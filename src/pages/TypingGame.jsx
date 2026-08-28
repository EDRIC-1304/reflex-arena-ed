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
import { MINI_TRACK_PATH } from "../components/layout/MiniTrack";
import useTypingGame from "../hooks/useTypingGame";
import { getTrackPosition } from "../utils/raceTrack";
import sound from "../utils/sound";
import { getSoundEnabledPreference } from "../utils/storage";

const TIME_LIMIT_OPTIONS = [0, 30, 60, 90, 120];

function formatRemainingTime(seconds) {
  const safeSeconds = Math.max(0, seconds ?? 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

function TypingGame() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(getSoundEnabledPreference());
  const [helpOpen, setHelpOpen] = useState(false);
  const [missCounterHelpOpen, setMissCounterHelpOpen] = useState(false);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(0);
  const [selectedMissCounterEnabled, setSelectedMissCounterEnabled] = useState(true);

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
    timeLimit,
    remainingTime,
    didNotFinish,
    missCounterEnabled,
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

  const raceStatus = (className = "") => (
    <div className={`typing-race-status ${className}`}>
      {timeLimit > 0 && (
        <div className={`typing-hud-stat typing-time-stat ${remainingTime <= 10 ? "warning" : ""}`}>
          <span>TIME LEFT</span>
          <strong>{formatRemainingTime(remainingTime)}</strong>
        </div>
      )}

      {missCounterEnabled && (
        <div className="typing-lives">
          <span>MISSES</span>
          <div className="life-indicators" aria-label={`${missedWords} of 5 misses`}>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={index < missedWords ? "life active" : "life"} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

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

      <GameHelp
        open={missCounterHelpOpen}
        title="MISS COUNTER"
        description={["Miss counter tracks typing mistakes. If you reach the limit, the race ends early."]}
        onClose={() => setMissCounterHelpOpen(false)}
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
        </div>

        {(phase === "idle" || phase === "ready" || phase === "countdown") && (
          <motion.div
            className="typing-start-screen"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="typing-start-icon">
              <Flag size={30} strokeWidth={1} />
            </div>

            <div className="typing-start-copy">
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
                <>
                  <div className="time-limit-picker" role="group" aria-label="Race time limit">
                    <span className="time-limit-label">TIME MODE</span>
                    <div className="time-limit-options">
                      {TIME_LIMIT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={selectedTimeLimit === option ? "time-limit-option active" : "time-limit-option"}
                          onClick={() => setSelectedTimeLimit(option)}
                          aria-pressed={selectedTimeLimit === option}
                        >
                          {option === 0 ? "NO TIME LIMIT" : `${option} SECONDS`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="miss-counter-picker" role="group" aria-label="Miss counter setting">
                    <div className="miss-counter-heading">
                      <span className="time-limit-label">MISS COUNTER</span>
                      <button
                        type="button"
                        className="miss-counter-info"
                        onClick={() => setMissCounterHelpOpen(true)}
                        aria-label="Explain miss counter"
                      >
                        <Info size={12} />
                      </button>
                    </div>
                    <div className="miss-counter-options">
                      {[true, false].map((enabled) => (
                        <button
                          key={String(enabled)}
                          type="button"
                          className={selectedMissCounterEnabled === enabled ? "miss-counter-option active" : "miss-counter-option"}
                          onClick={() => setSelectedMissCounterEnabled(enabled)}
                          aria-pressed={selectedMissCounterEnabled === enabled}
                        >
                          MISS COUNTER {enabled ? "ON" : "OFF"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {phase === "idle" && (
              <button
                type="button"
                className="reaction-button"
                onClick={(event) => {
                  event.stopPropagation();
                  startGame(selectedTimeLimit, selectedMissCounterEnabled);
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

        <section className="typing-arena" onClick={handleArenaClick}>
          <div className="typing-grid" />

          <div className="race-circuit" aria-hidden="true">
            <div className="track-header typing-track-header">
              <span className="track-live"><span className="track-live-dot" />RACE LIVE</span>
              <span>TRACK STATUS</span>
            </div>
            <svg className="typing-track-svg" viewBox="0 0 230 95" preserveAspectRatio="xMidYMid meet">
              <path d={MINI_TRACK_PATH} className="track-outer" />
              <path d={MINI_TRACK_PATH} className="track-surface" />
              <path id="typingRaceTrackPath" d={MINI_TRACK_PATH} className="track-center" fill="none" />
              
              {/* Background cars for non-active phase */}
              {phase !== "playing" && phase !== "result" && Array.from({ length: 7 }, (_, index) => (
                <circle
                  key={index}
                  r={index === 0 ? 3 : 1.9}
                  fill={index === 0 ? "#ff3b30" : index % 3 === 0 ? "#ffd43b" : "#f5f5f5"}
                  className={index === 0 ? "typing-track-leader" : "typing-track-car"}
                >
                  <animateMotion dur={`${9 + (index % 4) * 0.45}s`} begin={`-${index * 0.5}s`} repeatCount="indefinite" rotate="auto">
                    <mpath href="#typingRaceTrackPath" />
                  </animateMotion>
                </circle>
              ))}

              {/* Active F1 Race Car rendered inside exact SVG path coordinate space */}
              {phase !== "result" && (() => {
                const pos = getTrackPosition(raceProgress);
                return (
                  <g
                    key="active-f1-car"
                    className={`typing-svg-car ${drsActive ? "drs" : ""}`}
                    style={{
                      transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.angle}deg)`,
                      transformOrigin: `${pos.x}px ${pos.y}px`,
                      transition: `transform ${movementDuration}s ease-in-out`,
                    }}
                  >
                    {/* F1 Car Body */}
                    <path
                      d="M -6 -2.5 L 3 -2.5 L 6.5 0 L 3 2.5 L -6 2.5 Z"
                      fill={drsActive ? "#ffd43b" : "#ff3b30"}
                      className="car-body-path"
                    />
                    {/* Front wing */}
                    <rect x="4.5" y="-4" width="2" height="8" fill="#ffffff" rx="0.5" />
                    {/* Rear wing */}
                    <rect x="-7.5" y="-4.5" width="2" height="9" fill="#ffffff" rx="0.5" />
                    {/* Front wheels */}
                    <rect x="1.5" y="-4.8" width="3" height="1.6" fill="#000000" rx="0.4" />
                    <rect x="1.5" y="3.2" width="3" height="1.6" fill="#000000" rx="0.4" />
                    {/* Rear wheels */}
                    <rect x="-4.5" y="-4.8" width="3.2" height="1.6" fill="#000000" rx="0.4" />
                    <rect x="-4.5" y="3.2" width="3.2" height="1.6" fill="#000000" rx="0.4" />
                    {/* Helmet */}
                    <circle cx="-1" cy="0" r="1.4" fill="#ffd43b" />
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="race-progress-readout">
            <span>{Math.round(raceProgress).toString().padStart(2, "0")}% TRACK DISTANCE</span>
            <span>{drsActive ? "DRS OPEN // BOOST ACTIVE" : "RACE PACE // HOLD THE LINE"}</span>
          </div>

          {/* Dedicated Status Area directly below mini track on ALL devices */}
          {(timeLimit > 0 || missCounterEnabled) && (phase === "playing" || phase === "result") && (
            <div className="typing-dedicated-status-bar">
              {raceStatus("dedicated-status-content")}
            </div>
          )}

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

          {phase === "result" && (
            <motion.div
              className="typing-result-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="typing-result-modal" role="dialog" aria-modal="true" aria-labelledby="typing-result-title">
              <span className={`typing-result-label ${didNotFinish ? "dnf-label" : ""}`}>
                {didNotFinish ? "DNF - DID NOT FINISH" : "SESSION COMPLETE"}
              </span>

              <h1 id="typing-result-title">{didNotFinish ? "DNF - DID NOT FINISH" : "RACE COMPLETE"}</h1>

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

                {missCounterEnabled && <div><span>MISSED</span><strong>{missedWords}/5</strong></div>}

                <div>
                  <span>TIME</span>
                  <strong>{sessionTime}s</strong>
                </div>

                <div>
                  <span>TIME LIMIT</span>
                  <strong>{timeLimit > 0 ? `${timeLimit}s` : "NONE"}</strong>
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
                onInput={(event) => handleInput(event.currentTarget.value)}
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
