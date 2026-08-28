import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function F1Loader({
  loading = true,
  text = "INITIALIZING RACE SYSTEM",
  subtext = "TELEMETRY SYNC // ARENA READY",
  fullScreen = true,
  onFinish,
}) {
  const [activeLights, setActiveLights] = useState(0);
  const [lightsOut, setLightsOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setActiveLights(0);
      setLightsOut(false);
      return;
    }

    let isMounted = true;
    let lightInterval;
    let finishTimeout;

    const startSequence = () => {
      setActiveLights(0);
      setLightsOut(false);
      let count = 0;

      lightInterval = setInterval(() => {
        if (!isMounted) return;
        count += 1;
        if (count <= 5) {
          setActiveLights(count);
        } else {
          clearInterval(lightInterval);
          setLightsOut(true);
          setActiveLights(0);
          finishTimeout = setTimeout(() => {
            if (isMounted) {
              if (onFinish) onFinish();
              startSequence();
            }
          }, 700);
        }
      }, 200);
    };

    startSequence();

    return () => {
      isMounted = false;
      if (lightInterval) clearInterval(lightInterval);
      if (finishTimeout) clearTimeout(finishTimeout);
    };
  }, [loading, onFinish]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className={`f1-loader-overlay ${fullScreen ? "fullscreen" : "inline"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
          role="status"
          aria-live="polite"
          aria-label="Loading race arena"
        >
          <div className="f1-loader-card">
            <div className="f1-loader-topbar">
              <span className="f1-loader-badge">RACE CONTROL</span>
              <span className={`f1-loader-state ${lightsOut ? "go-state" : ""}`}>
                {lightsOut ? "LIGHTS OUT // GO!" : "LIGHTS ARMED"}
              </span>
            </div>

            {/* F1 Gantry Starting Lights */}
            <div className={`f1-loader-gantry ${lightsOut ? "lights-out-flash" : ""}`}>
              {Array.from({ length: 5 }, (_, index) => {
                const active = index < activeLights;
                return (
                  <div
                    key={index}
                    className={`f1-loader-light ${active ? "active" : ""} ${lightsOut ? "go" : ""}`}
                  >
                    <span className="f1-loader-light-core" />
                  </div>
                );
              })}
            </div>

            {/* Car & Track animation line */}
            <div className="f1-loader-track">
              <div className="f1-loader-track-line" />
              <div className={`f1-loader-car ${lightsOut ? "launch" : ""}`}>
                <span className="f1-loader-car-wing" />
                <span className="f1-loader-car-body" />
                <span className="f1-loader-car-glow" />
              </div>
            </div>

            {/* Typography & Subtext */}
            <div className="f1-loader-details">
              <div className="f1-loader-title">
                {text}
                <span className="f1-loader-pulse-dots">
                  <span className="dot dot-1">.</span>
                  <span className="dot dot-2">.</span>
                  <span className="dot dot-3">.</span>
                </span>
              </div>
              {subtext && <div className="f1-loader-subtext">{subtext}</div>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default F1Loader;
