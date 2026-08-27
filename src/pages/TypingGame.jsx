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
import { getTrackPosition } from "../utils/raceTrack";
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
    drsActive,
    movementDuration,
    startGame,
    resetGame,
    handleInput,
  } = useTypingGame();

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

          <div className="race-circuit" aria-hidden="true">
            <div className="circuit-label circuit-label-start">START / FINISH</div>
            <div className="circuit-label circuit-label-apex">APEX 02</div>
            <div className="circuit-sector sector-one">01</div>
            <div className="circuit-sector sector-two">02</div>
            <div className="circuit-sector sector-three">03</div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path className="circuit-outer" d="M16 65 C12 43 23 20 47 14 C72 17 91 31 91 55 C76 72 54 78 39 67 C27 73 16 65 16 65" />
              <path className="circuit-line" d="M16 65 C12 43 23 20 47 14 C72 17 91 31 91 55 C76 72 54 78 39 67 C27 73 16 65 16 65" />
              <path className="circuit-dash" d="M16 65 C12 43 23 20 47 14 C72 17 91 31 91 55 C76 72 54 78 39 67 C27 73 16 65 16 65" />
            </svg>
            <motion.div
              className={`race-car ${drsActive ? "race-car-drs" : ""}`}
              animate={(() => {
                const position = getTrackPosition(raceProgress);
                return { left: `${position.x}%`, top: `${position.y}%` };
              })()}
              transition={{ duration: movementDuration, ease: "easeInOut" }}
            >
              <span className="race-car-wing" />
              <span className="race-car-body" />
              <span className="race-car-wheel race-car-wheel-front" />
              <span className="race-car-wheel race-car-wheel-back" />
            </motion.div>
          </div>

          <AnimatePresence>
            {words.map((word) => {
              const isTyping = typedText.length > 0 && word.text.startsWith(typedText);

              return (
                <motion.div
                  key={word.id}
                  className={`sector-card ${isTyping ? "target-active" : ""}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="sector-card-meta">
                    <span>SECTOR {word.sector.toString().padStart(2, "0")}</span>
                    <span>PACE {word.difficulty}</span>
                  </div>

                  <div className="sector-word">
                    {isTyping ? (
                      <>
                        <span className="typed-part">{word.text.slice(0, typedText.length)}</span>
                        <span>{word.text.slice(typedText.length)}</span>
                      </>
                    ) : (
                      word.text
                    )}
                  </div>

                  <div className="sector-card-hint">COMPLETE SECTOR TO ADVANCE</div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="race-progress-readout">
            <span>{Math.round(raceProgress).toString().padStart(2, "0")}% TRACK DISTANCE</span>
            <span>{drsActive ? "DRS OPEN // BOOST ACTIVE" : "RACE PACE // HOLD THE LINE"}</span>
          </div>

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