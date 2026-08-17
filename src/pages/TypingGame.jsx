import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Flag,
  Info,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import GameHelp from "../components/ui/GameHelp";
import useTypingGame from "../hooks/useTypingGame";
import sound from "../utils/sound";
import { getSoundEnabledPreference } from "../utils/storage";

function TypingGame() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(getSoundEnabledPreference());
  const [helpOpen, setHelpOpen] = useState(false);

  const {
    phase,
    words,
    typedText,
    score,
    missedWords,
    level,
    combo,
    maxCombo,
    completedWords,
    accuracy,
    wpm,
    bestScore,
    sessionTime,
    lap,
    totalLaps,
    raceProgress,
    countdownValue,
    startGame,
    resetGame,
    handleInput,
  } = useTypingGame();

  useEffect(() => {
    setSoundEnabled(sound.isEnabled());
  }, [phase]);

  useEffect(() => {
    if (phase === "playing") {
      inputRef.current?.focus();
    }
  }, [phase]);

  const handleArenaClick = () => {
    if (phase === "playing") {
      inputRef.current?.focus();
    }
  };

  const handleExit = () => {
    resetGame();
    navigate("/");
  };

  const handleMuteToggle = async () => {
    const nextValue = sound.toggleMute();
    setSoundEnabled(nextValue);

    if (nextValue) {
      await sound.ensureAudio();
    }
  };

  const helpLines = [
    "Wait for the race to start.",
    "Words will appear on the screen.",
    "Type each word correctly to clear it.",
    "Type faster and more accurately to get a better score.",
    "Finish all the laps before you miss too many words.",
    "That’s it.",
  ];

  return (
    <main className="page game-page typing-page">
      <button
        type="button"
        className="back-button"
        onClick={handleExit}
        aria-label="Exit type to race"
      >
        <ArrowLeft size={16} />
        EXIT
      </button>

      <button
        type="button"
        className="game-mute-button"
        onClick={handleMuteToggle}
        aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
      >
        {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      </button>

      <button
        type="button"
        className="info-button"
        onClick={() => setHelpOpen(true)}
        aria-label="How to play Type to Race"
      >
        <Info size={15} />
      </button>

      <GameHelp
        open={helpOpen}
        title="HOW TO PLAY"
        description={helpLines}
        onClose={() => setHelpOpen(false)}
      />

      <section className="typing-shell">
        <header className="typing-topbar">
          <div className="typing-heading">
            <span className="typing-session">SESSION 02</span>
            <span className="typing-title">TYPE TO RACE</span>
          </div>

          <div className="typing-controls">
            <span>RACE LINE</span>
            <Flag size={14} />
          </div>
        </header>

        <div className="typing-hud">
          <div className="typing-hud-stat">
            <span>SCORE</span>
            <strong>{score.toString().padStart(5, "0")}</strong>
          </div>

          <div className="typing-hud-stat">
            <span>LAP</span>
            <strong>{lap}/{totalLaps}</strong>
          </div>

          <div className="typing-hud-stat">
            <span>LEVEL</span>
            <strong>{level}</strong>
          </div>

          <div className="typing-hud-stat">
            <span>COMBO</span>
            <strong>x{combo}</strong>
          </div>

          <div className="typing-hud-stat">
            <span>WPM</span>
            <strong>{wpm}</strong>
          </div>

          <div className="typing-hud-stat">
            <span>ACC</span>
            <strong>{accuracy}%</strong>
          </div>

          <div className="typing-lives">
            <span>MISSES</span>
            <div className="life-indicators">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={index < missedWords ? "life active" : "life"}
                />
              ))}
            </div>
          </div>
        </div>

        <section className="typing-arena" onClick={handleArenaClick}>
          <div className="typing-grid" />

          <div className="arena-core">
            <div className="core-ring core-ring-one" />
            <div className="core-ring core-ring-two" />
            <Flag size={24} strokeWidth={1} />
            <span>{Math.round(raceProgress)}% GRID</span>
          </div>

          <AnimatePresence>
            {words.map((word) => {
              const isTyping = typedText.length > 0 && word.text.startsWith(typedText);

              return (
                <motion.div
                  key={word.id}
                  className={`typing-target ${isTyping ? "target-active" : ""}`}
                  style={{
                    left: `${word.x}%`,
                    top: `${word.y}%`,
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="target-marker target-marker-top" />
                  <span className="target-marker target-marker-right" />
                  <span className="target-marker target-marker-bottom" />
                  <span className="target-marker target-marker-left" />

                  <div className="target-word">
                    {isTyping ? (
                      <>
                        <span className="typed-part">{word.text.slice(0, typedText.length)}</span>
                        <span>{word.text.slice(typedText.length)}</span>
                      </>
                    ) : (
                      word.text
                    )}
                  </div>

                  <div className="target-distance">SECTOR // {Math.round(word.progress)}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {(phase === "idle" || phase === "ready" || phase === "countdown") && (
            <motion.div
              className="typing-start-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="typing-start-icon">
                <Flag size={30} strokeWidth={1} />
              </div>

              <span className="typing-start-label">RACE CONTROL</span>

              <h1>{phase === "idle" ? "TYPE TO RACE" : phase === "ready" ? "READY" : `STARTING ${countdownValue || 5}`}</h1>

              <p>
                {phase === "idle"
                  ? "Keep your inputs sharp, hold the line, and beat the clock."
                  : phase === "ready"
                    ? "Lights armed. Hold steady."
                    : "Countdown active. Typing is disabled until GO."}
              </p>

              {phase === "idle" && (
                <button
                  type="button"
                  className="reaction-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    startGame();
                  }}
                  aria-label="Start type to race session"
                >
                  <Zap size={18} />
                  START SESSION
                </button>
              )}

              {phase !== "idle" && (
                <div className="countdown-lights" aria-live="polite">
                  {Array.from({ length: 5 }, (_, index) => {
                    const shouldLight = index < countdownValue;
                    return <span key={index} className={`countdown-light ${shouldLight ? "active" : ""}`} />;
                  })}
                </div>
              )}
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              className="typing-result-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="typing-result-label">SESSION COMPLETE</span>

              <h1>{score > 0 ? "RACE COMPLETE" : "RACE OVER"}</h1>

              <div className="typing-result-grid">
                <div>
                  <span>SCORE</span>
                  <strong>{score}</strong>
                </div>

                <div>
                  <span>WPM</span>
                  <strong>{wpm}</strong>
                </div>

                <div>
                  <span>ACC</span>
                  <strong>{accuracy}%</strong>
                </div>

                <div>
                  <span>WORDS</span>
                  <strong>{completedWords}</strong>
                </div>

                <div>
                  <span>MISSED</span>
                  <strong>{missedWords}</strong>
                </div>

                <div>
                  <span>TIME</span>
                  <strong>{sessionTime}s</strong>
                </div>

                <div>
                  <span>LAP</span>
                  <strong>{lap}/{totalLaps}</strong>
                </div>

                <div>
                  <span>BEST COMBO</span>
                  <strong>x{maxCombo}</strong>
                </div>

                <div>
                  <span>PACE</span>
                  <strong>{level}</strong>
                </div>
              </div>

              <div className="typing-result-best">
                BEST SCORE:
                <strong>{bestScore}</strong>
              </div>

              <div className="reaction-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={resetGame}
                  aria-label="Start a new type to race session"
                >
                  <RotateCcw size={15} />
                  NEW GAME
                </button>

                <button
                  type="button"
                  className="primary-action"
                  onClick={handleExit}
                  aria-label="Exit to home"
                >
                  <ArrowLeft size={15} />
                  EXIT ARENA
                </button>
              </div>
            </motion.div>
          )}

          {phase === "playing" && (
            <div className="typing-input-area">
              <div className="typing-input-label">
                <span className="input-live-dot" />
                TYPE TO RACE
              </div>

              <input
                ref={inputRef}
                value={typedText}
                onChange={(event) => handleInput(event.target.value)}
                className="typing-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="text"
                aria-label="Type race word"
              />

              <div className="typing-input-display" aria-live="polite">
                {typedText || "START TYPING..."}
                <span className="input-cursor" />
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default TypingGame;