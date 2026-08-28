import { useCallback, useEffect, useRef, useState } from "react";

import sound from "../utils/sound";
import { getTypingBestScores, setTypingBestScores } from "../utils/storage";

const MAX_MISSES = 5;
const TOTAL_LAPS = 5;
const SECTORS_PER_LAP = 4;
const TOTAL_SECTORS = TOTAL_LAPS * SECTORS_PER_LAP;
const DRS_COMBO_THRESHOLD = 5;

const SIMPLE_WORDS = [
  "apex", "brake", "drive", "gear", "grip", "lap", "pace", "race",
  "shift", "speed", "steer", "track", "turn", "tyre", "wheel",
];

const GENERAL_WORDS = [
  "accuracy", "balance", "cadence", "clarity", "control", "focus", "impact",
  "insight", "momentum", "patience", "precision", "pressure", "reaction",
  "rhythm", "stability", "strategy", "timing", "velocity", "awareness",
  "consistency", "discipline", "endurance", "intention", "judgment", "movement",
  "progress", "response", "restraint", "concentration", "determination",
  "efficiency", "anticipation", "adaptation", "communication", "coordination",
  "observation", "perseverance", "performance",
];

const RACING_WORDS = [
  "aerodynamics", "braking", "chicane", "circuit", "constructor", "differential",
  "downforce", "engineer", "formation", "grid", "kerb", "motorsport", "overtaking",
  "paddock", "pitstop", "qualifying", "racingline", "slipstream", "suspension",
  "telemetry", "throttle", "undercut", "understeer", "oversteer", "wetweather",
  "championship", "compound", "deployment", "fuelstrategy", "racecraft",
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function calculateAccuracy(correctCharacters, totalCharacters) {
  return totalCharacters === 0 ? 100 : Math.round((correctCharacters / totalCharacters) * 100);
}

function calculateWpm(correctCharacters, elapsedMs) {
  if (elapsedMs <= 0) return 0;
  return Math.round((correctCharacters / 5) / (elapsedMs / 60000));
}

function getDifficulty(completedWords) {
  if (completedWords < 2) return 1;
  if (completedWords < 8) return 2;
  if (completedWords < 14) return 3;
  if (completedWords < 18) return 4;
  return 5;
}

function getRaceLap(completedWords) {
  return Math.min(TOTAL_LAPS, Math.floor(completedWords / SECTORS_PER_LAP) + 1);
}

function chooseWord(difficulty, recentWords) {
  const source = difficulty === 1 ? SIMPLE_WORDS : Math.random() < 0.3 ? RACING_WORDS : GENERAL_WORDS;
  const available = source.filter((word) => !recentWords.includes(word));
  return randomItem(available.length > 0 ? available : source);
}

function createRaceWord(id, difficulty, recentWords) {
  return {
    id,
    text: chooseWord(difficulty, recentWords),
    difficulty,
    sector: (id % SECTORS_PER_LAP) + 1,
    startedAt: performance.now(),
  };
}

function getWordScore(word, difficulty, paceBonus = 0) {
  return word.length * 12 + difficulty * 15 + paceBonus;
}

function useTypingGame() {
  const [phase, setPhase] = useState("idle");
  const [words, setWords] = useState([]);
  const [typedText, setTypedText] = useState("");
  const [score, setScore] = useState(0);
  const [missedWords, setMissedWords] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [completedWords, setCompletedWords] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wpm, setWpm] = useState(0);
  const [bestScore, setBestScore] = useState(getTypingBestScores().bestScore || 0);
  const [sessionTime, setSessionTime] = useState(0);
  const [lap, setLap] = useState(1);
  const [totalLaps] = useState(TOTAL_LAPS);
  const [raceProgress, setRaceProgress] = useState(0);
  const [countdownValue, setCountdownValue] = useState(0);
  const [drsActive, setDrsActive] = useState(false);
  const [movementDuration, setMovementDuration] = useState(0.9);
  const [timeLimit, setTimeLimit] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [didNotFinish, setDidNotFinish] = useState(false);

  const typedRef = useRef("");
  const phaseRef = useRef("idle");
  const scoreRef = useRef(0);
  const missedWordsRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const completedWordsRef = useRef(0);
  const correctCharactersRef = useRef(0);
  const totalCharactersRef = useRef(0);
  const startTimeRef = useRef(null);
  const wordIdRef = useRef(0);
  const activeWordRef = useRef(null);
  const recentWordsRef = useRef([]);
  const countdownTimersRef = useRef([]);
  const drsTimerRef = useRef(null);
  const raceTimerRef = useRef(null);
  const raceClockRef = useRef(null);

  const clearTimers = useCallback(() => {
    countdownTimersRef.current.forEach((timer) => clearTimeout(timer));
    countdownTimersRef.current = [];
    if (drsTimerRef.current) clearTimeout(drsTimerRef.current);
    if (raceTimerRef.current) clearTimeout(raceTimerRef.current);
    if (raceClockRef.current) clearInterval(raceClockRef.current);
    raceTimerRef.current = null;
    raceClockRef.current = null;
  }, []);

  const updateHud = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsed = performance.now() - startTimeRef.current;
    setWpm(calculateWpm(correctCharactersRef.current, elapsed));
    setAccuracy(calculateAccuracy(correctCharactersRef.current, totalCharactersRef.current));
    setSessionTime(Math.round(elapsed / 1000));
  }, []);

  const finishRace = useCallback((timedOut = false) => {
    if (phaseRef.current === "result") return;
    clearTimers();
    const elapsed = startTimeRef.current ? Math.max(1, performance.now() - startTimeRef.current) : 0;
    const finalWpm = calculateWpm(correctCharactersRef.current, elapsed);
    const finalAccuracy = calculateAccuracy(correctCharactersRef.current, totalCharactersRef.current);
    const finalTime = startTimeRef.current ? Math.round(elapsed / 1000) : 0;
    const saved = getTypingBestScores();
    const nextBest = {
      bestWpm: Math.max(saved.bestWpm, finalWpm),
      bestScore: Math.max(saved.bestScore, scoreRef.current),
      bestAccuracy: Math.max(saved.bestAccuracy, finalAccuracy),
      bestRaceTime: finalTime === 0 ? saved.bestRaceTime : saved.bestRaceTime === 0 ? finalTime : Math.min(saved.bestRaceTime, finalTime),
      bestCombo: Math.max(saved.bestCombo, maxComboRef.current),
    };
    setTypingBestScores(nextBest);
    setBestScore(nextBest.bestScore);
    setDidNotFinish(timedOut);
    if (timedOut) setRemainingTime(0);
    phaseRef.current = "result";
    setPhase("result");
    sound.playRaceFinish();
    updateHud();
  }, [clearTimers, updateHud]);

  const resetGame = useCallback(() => {
    clearTimers();
    phaseRef.current = "idle";
    activeWordRef.current = null;
    recentWordsRef.current = [];
    typedRef.current = "";
    setPhase("idle");
    setWords([]);
    setTypedText("");
    setScore(0);
    setMissedWords(0);
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    setCompletedWords(0);
    setAccuracy(100);
    setWpm(0);
    setSessionTime(0);
    setLap(1);
    setRaceProgress(0);
    setCountdownValue(0);
    setDrsActive(false);
    setTimeLimit(0);
    setRemainingTime(null);
    setDidNotFinish(false);
    scoreRef.current = 0;
    missedWordsRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    completedWordsRef.current = 0;
    correctCharactersRef.current = 0;
    totalCharactersRef.current = 0;
    startTimeRef.current = null;
  }, [clearTimers]);

  const setNextWord = useCallback(() => {
    const difficulty = getDifficulty(completedWordsRef.current);
    const word = createRaceWord(wordIdRef.current++, difficulty, recentWordsRef.current);
    recentWordsRef.current = [...recentWordsRef.current.slice(-11), word.text];
    activeWordRef.current = word;
    setWords([word]);
    setLevel(difficulty);
  }, []);

  const startGame = useCallback((selectedTimeLimit = 0) => {
    resetGame();
    setTimeLimit(selectedTimeLimit);
    phaseRef.current = "ready";
    setPhase("ready");
    setCountdownValue(5);
    const countdownSteps = [5, 4, 3, 2, 1];
    countdownSteps.forEach((value, index) => {
      const timer = setTimeout(() => {
        setCountdownValue(value);
        sound.playCountdownLight(value);
      }, 280 + index * 260);
      countdownTimersRef.current.push(timer);
    });
    const goTimer = setTimeout(() => {
      phaseRef.current = "playing";
      setPhase("playing");
      setCountdownValue(0);
      startTimeRef.current = performance.now();
      if (selectedTimeLimit > 0) {
        const raceStartedAt = performance.now();
        setRemainingTime(selectedTimeLimit);
        raceClockRef.current = setInterval(() => {
          const elapsed = performance.now() - raceStartedAt;
          setRemainingTime(Math.max(0, selectedTimeLimit - Math.ceil(elapsed / 1000)));
        }, 250);
        raceTimerRef.current = setTimeout(() => finishRace(true), selectedTimeLimit * 1000);
      } else {
        setRemainingTime(null);
      }
      setNextWord();
      sound.playGo();
    }, 280 + countdownSteps.length * 260 + 220);
    countdownTimersRef.current.push(goTimer);
    setDidNotFinish(false);
  }, [finishRace, resetGame, setNextWord]);

  const completeWord = useCallback(() => {
    const word = activeWordRef.current;
    if (!word) return;
    const wordTime = performance.now() - word.startedAt;
    const isFast = wordTime < 1800;
    const nextCombo = comboRef.current + 1;
    const paceBonus = isFast ? 20 : wordTime > 4200 ? 0 : 10;
    const drs = nextCombo >= DRS_COMBO_THRESHOLD;
    const nextScore = scoreRef.current + getWordScore(word.text, word.difficulty, paceBonus) + comboRef.current * 8;
    const nextCompleted = completedWordsRef.current + 1;
    const nextLap = getRaceLap(nextCompleted);
    const nextProgress = Math.min(100, (nextCompleted / TOTAL_SECTORS) * 100);

    scoreRef.current = nextScore;
    comboRef.current = nextCombo;
    maxComboRef.current = Math.max(maxComboRef.current, nextCombo);
    completedWordsRef.current = nextCompleted;
    setScore(nextScore);
    setCombo(nextCombo);
    setMaxCombo(maxComboRef.current);
    setCompletedWords(nextCompleted);
    setRaceProgress(nextProgress);
    setLap(nextLap);
    setMovementDuration(drs ? 0.45 : isFast ? 0.62 : wordTime > 4200 ? 1.15 : 0.9);
    sound.playWordComplete();

    if (drs) {
      setDrsActive(true);
      if (drsTimerRef.current) clearTimeout(drsTimerRef.current);
      drsTimerRef.current = setTimeout(() => setDrsActive(false), 1200);
    }
    if (nextCompleted % SECTORS_PER_LAP === 0) sound.playLapComplete();
    if (nextCompleted >= TOTAL_SECTORS) {
      finishRace();
      return;
    }
    setNextWord();
  }, [finishRace, setNextWord]);

  const handleInput = useCallback((value) => {
    if (phaseRef.current !== "playing" || !activeWordRef.current) return;
    const cleanValue = value.toLowerCase().replace(/\s/g, "");
    const previousValue = typedRef.current;
    if (cleanValue.length > previousValue.length) {
      totalCharactersRef.current += 1;
      if (activeWordRef.current.text[cleanValue.length - 1] === cleanValue[cleanValue.length - 1]) {
        correctCharactersRef.current += 1;
      }
    }
    if (cleanValue.length > 0 && !activeWordRef.current.text.startsWith(cleanValue)) {
      const nextMisses = missedWordsRef.current + 1;
      missedWordsRef.current = nextMisses;
      setMissedWords(nextMisses);
      comboRef.current = 0;
      setCombo(0);
      typedRef.current = "";
      setTypedText("");
      if (nextMisses >= MAX_MISSES) finishRace();
      updateHud();
      return;
    }
    if (cleanValue === activeWordRef.current.text) {
      completeWord();
      typedRef.current = "";
      setTypedText("");
      updateHud();
      return;
    }
    typedRef.current = cleanValue;
    setTypedText(cleanValue);
    updateHud();
  }, [completeWord, finishRace, updateHud]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    phase, words, typedText, score, missedWords, level, combo, maxCombo,
    completedWords, accuracy, wpm, bestScore, sessionTime, lap, totalLaps,
    raceProgress, countdownValue, drsActive, movementDuration, startGame,
    resetGame, handleInput, timeLimit, remainingTime, didNotFinish,
  };
}

export default useTypingGame;
