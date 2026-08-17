import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Info,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GameHelp from "../components/ui/GameHelp";
import useReactionGame from "../hooks/useReactionGame";
import sound from "../utils/sound";
import { getSoundEnabledPreference } from "../utils/storage";

function ReactionGame() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(getSoundEnabledPreference());
  const [helpOpen, setHelpOpen] = useState(false);

  const {
    phase,
    activeLights,
    reactionTime,
    rating,
    personalBest,
    registerInput,
    resetGame,
  } = useReactionGame();

  useEffect(() => {
    setSoundEnabled(sound.isEnabled());
  }, [phase]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        if (helpOpen) {
          return;
        }
        registerInput();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [helpOpen, registerInput]);

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
    "Wait for the lights.",
    "When they turn green, tap as fast as you can.",
    "The faster you react, the better your time.",
    "Tap too early and it’s a false start.",
    "That’s it.",
  ];

  const statusText = {
    idle: "PRESS START WHEN READY",
    ready: "READY",
    countdown: "STARTING LIGHTS",
    go: "GO — GO — GO",
    "false-start": "FALSE START",
    result: "SESSION COMPLETE",
  };

  return (
    <main className="page game-page reaction-page">
      <button
        className="back-button"
        onClick={handleExit}
        type="button"
        aria-label="Exit reaction test"
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
        aria-label="How to play Reaction Test"
      >
        <Info size={15} />
      </button>

      <GameHelp
        open={helpOpen}
        title="HOW TO PLAY"
        description={helpLines}
        onClose={() => setHelpOpen(false)}
      />

      <section className="reaction-shell">
        <header className="reaction-topbar">
          <div className="reaction-heading">
            <span className="reaction-session">SESSION 01</span>
            <span className="reaction-title">REACTION TEST</span>
          </div>

          <span className="reaction-instruction">SPACE / ENTER</span>
        </header>

        <section className="reaction-arena">
          <div className="reaction-status">
            <span className="reaction-status-line" />
            {statusText[phase] || "READY"}
          </div>

          <div className="start-lights" aria-live="polite">
            {Array.from({ length: 5 }, (_, index) => {
              const active = index < activeLights;

              return (
                <motion.div
                  key={index}
                  className={`start-light ${active ? "active" : ""}`}
                  animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              );
            })}
          </div>

          <div className="reaction-message">
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key="idle"
                  className="reaction-message-content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <span>READY?</span>
                  <small>React when the lights go out.</small>
                </motion.div>
              )}

              {(phase === "ready" || phase === "countdown") && (
                <motion.div
                  key="ready"
                  className="reaction-message-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span>READY</span>
                  <small>Hold position for lights.</small>
                </motion.div>
              )}

              {phase === "go" && (
                <motion.div
                  key="go"
                  className="reaction-message-content"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="go-text">GO!</span>
                  <small>TAP / CLICK NOW</small>
                </motion.div>
              )}

              {phase === "false-start" && (
                <motion.div
                  key="false-start"
                  className="reaction-message-content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="danger-text">FALSE START</span>
                  <small>You jumped the lights.</small>
                </motion.div>
              )}

              {phase === "result" && (
                <motion.div
                  key="result"
                  className="reaction-message-content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>{reactionTime} MS</span>
                  <small>{rating?.label}</small>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(phase === "idle" || phase === "ready" || phase === "countdown" || phase === "go") && (
            <button
              type="button"
              className={`reaction-button ${phase === "go" ? "reaction-button-go" : ""}`}
              onPointerDown={(event) => {
                event.preventDefault();
                registerInput();
              }}
              aria-label={phase === "go" ? "React now" : "Start reaction test"}
            >
              <Zap size={19} />

              <span>
                {phase === "idle"
                  ? "START SESSION"
                  : phase === "ready" || phase === "countdown"
                    ? "WAIT..."
                    : "REACT"}
              </span>
            </button>
          )}

          {phase === "false-start" && (
            <button
              type="button"
              className="reaction-button"
              onClick={resetGame}
              aria-label="Retry reaction test"
            >
              <RotateCcw size={18} />
              TRY AGAIN
            </button>
          )}
        </section>

        {phase === "result" && (
          <>
            <motion.div
              className="reaction-result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="result-stat">
                <span>REACTION</span>
                <strong>{reactionTime} ms</strong>
              </div>

              <div className="result-stat">
                <span>RATING</span>
                <strong>{rating?.label}</strong>
              </div>

              <div className="result-stat">
                <span>PERSONAL BEST</span>
                <strong>{personalBest ? `${personalBest} ms` : "--"}</strong>
              </div>
            </motion.div>

            <div className="reaction-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={resetGame}
                aria-label="Start a new reaction test"
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
          </>
        )}
      </section>
    </main>
  );
}

export default ReactionGame;