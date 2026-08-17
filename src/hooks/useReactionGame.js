import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import sound from "../utils/sound";
import {
  getReactionBest,
  setReactionBest,
} from "../utils/storage";

const LIGHT_COUNT = 5;
const LIGHT_INTERVAL = 260;
const READY_DELAY = 420;
const MIN_GO_DELAY = 900;
const MAX_GO_DELAY = 2200;

function getRating(time) {
  if (time < 150) {
    return { label: "SUPERSONIC" };
  }

  if (time < 200) {
    return { label: "ELITE" };
  }

  if (time < 250) {
    return { label: "FAST" };
  }

  if (time < 300) {
    return { label: "GOOD" };
  }

  if (time < 400) {
    return { label: "AVERAGE" };
  }

  return { label: "NEEDS WORK" };
}

function useReactionGame() {
  const [phase, setPhase] = useState("idle");
  const [activeLights, setActiveLights] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [rating, setRating] = useState(null);
  const [personalBest, setPersonalBest] = useState(getReactionBest() || null);

  const phaseRef = useRef("idle");
  const goTimeRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const saved = getReactionBest();

    if (saved) {
      setPersonalBest(saved);
    }
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });

    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const startGame = useCallback(() => {
    clearTimers();

    setActiveLights(0);
    setReactionTime(null);
    setRating(null);

    setPhase("ready");
    phaseRef.current = "ready";
    goTimeRef.current = null;

    const readyTimer = setTimeout(() => {
      setPhase("countdown");
      phaseRef.current = "countdown";
    }, READY_DELAY);

    timersRef.current.push(readyTimer);

    for (let light = 1; light <= LIGHT_COUNT; light += 1) {
      const timer = setTimeout(() => {
        setActiveLights(light);
        sound.playCountdownLight(light);
      }, READY_DELAY + light * LIGHT_INTERVAL);

      timersRef.current.push(timer);
    }

    const randomDelay =
      Math.floor(Math.random() * (MAX_GO_DELAY - MIN_GO_DELAY + 1)) +
      MIN_GO_DELAY;

    const goTimer = setTimeout(() => {
      setActiveLights(0);
      setPhase("go");
      phaseRef.current = "go";
      goTimeRef.current = performance.now();
      sound.playGo();
    }, READY_DELAY + LIGHT_COUNT * LIGHT_INTERVAL + randomDelay);

    timersRef.current.push(goTimer);
  }, [clearTimers]);

  const registerInput = useCallback(() => {
    const currentPhase = phaseRef.current;

    if (currentPhase === "idle") {
      startGame();
      return;
    }

    if (currentPhase === "ready" || currentPhase === "countdown") {
      clearTimers();
      goTimeRef.current = null;
      setActiveLights(0);
      setPhase("false-start");
      phaseRef.current = "false-start";
      sound.playFalseStart();
      return;
    }

    if (currentPhase === "go" && goTimeRef.current !== null) {
      const elapsed = performance.now() - goTimeRef.current;
      const result = Math.round(elapsed);
      const resultRating = getRating(result);

      setReactionTime(result);
      setRating(resultRating);
      setPhase("result");
      phaseRef.current = "result";
      goTimeRef.current = null;
      clearTimers();

      const currentBest = getReactionBest();

      if (!currentBest || result < currentBest) {
        setReactionBest(result);
        setPersonalBest(result);
      }

      sound.playReactionResult();
    }
  }, [clearTimers, startGame]);

  const resetGame = useCallback(() => {
    clearTimers();
    goTimeRef.current = null;
    phaseRef.current = "idle";
    setPhase("idle");
    setActiveLights(0);
    setReactionTime(null);
    setRating(null);
  }, [clearTimers]);

  return {
    phase,
    activeLights,
    reactionTime,
    rating,
    personalBest,
    startGame,
    registerInput,
    resetGame,
  };
}

export default useReactionGame;