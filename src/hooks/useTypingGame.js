import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import sound from "../utils/sound";
import {
  getTypingBestScores,
  setTypingBestScores,
} from "../utils/storage";

const MAX_MISSES = 5;
const TOTAL_LAPS = 5;
const WORDS_PER_LAP = 12;

const WORDS = [
  "apex",
  "brake",
  "boost",
  "carbon",
  "chicane",
  "circuit",
  "corner",
  "downforce",
  "drive",
  "engine",
  "finish",
  "formula",
  "gear",
  "grip",
  "grid",
  "helmet",
  "lap",
  "launch",
  "lights",
  "pit",
  "pole",
  "race",
  "racing",
  "sector",
  "shift",
  "slick",
  "speed",
  "steer",
  "straight",
  "strategy",
  "tarmac",
  "throttle",
  "traction",
  "turbo",
  "tyre",
  "velocity",
  "wing",
  "qualifying",
  "podium",
  "telemetry",
  "driver",
  "paddock",
  "braking",
  "overtake",
  "motorsport",
  "engineer",
  "stint",
  "slipstream",
  "aero",
  "kerb",
  "safety",
  "restart",
  "fuel",
  "track",
  "pace",
  "gridlock",
  "marbles",
  "understeer",
  "oversteer",
  "aerodynamics",
  "constructor",
  "championship",
  "performance",
  "position",
  "push",
  "relay",
  "stability",
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function calculateAccuracy(correctCharacters, totalCharacters) {
  if (totalCharacters === 0) {
    return 100;
  }

  return Math.round((correctCharacters / totalCharacters) * 100);
}

function calculateWpm(correctCharacters, elapsedMs) {
  if (elapsedMs <= 0) {
    return 0;
  }

  const minutes = elapsedMs / 60000;

  return Math.round((correctCharacters / 5) / minutes);
}

function getRaceLap(completedWords) {
  return Math.min(TOTAL_LAPS, Math.floor(completedWords / WORDS_PER_LAP) + 1);
}

function getRaceGoal() {
  return TOTAL_LAPS * WORDS_PER_LAP;
}

function getDifficulty(level) {
  return Math.min(5, Math.max(1, level));
}

function getSpawnRate(level) {
  return Math.max(650, 1800 - (level - 1) * 220);
}

function getWordScore(word, level) {
  return word.length * 12 + level * 15;
}

function createRaceWord(id, level, usedWords = []) {
  const available = WORDS.filter((word) => !usedWords.includes(word));
  const chosenWord =
    available.length > 0 ? randomItem(available) : randomItem(WORDS);

  const side = Math.floor(Math.random() * 4);

  let x = 0;
  let y = 0;

  if (side === 0) {
    x = Math.random() * 90 + 5;
    y = -10;
  } else if (side === 1) {
    x = 110;
    y = Math.random() * 80 + 10;
  } else if (side === 2) {
    x = Math.random() * 90 + 5;
    y = 110;
  } else {
    x = -10;
    y = Math.random() * 80 + 10;
  }

  const angle = Math.atan2(50 - y, 50 - x);
  const speed = 0.18 + level * 0.09 + Math.random() * 0.18;

  return {
    id,
    text: chosenWord,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    speed,
    progress: 0,
    status: "active",
  };
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

  const wordsRef = useRef([]);
  const typedRef = useRef("");
  const phaseRef = useRef("idle");
  const scoreRef = useRef(0);
  const missedWordsRef = useRef(0);
  const levelRef = useRef(1);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const completedWordsRef = useRef(0);
  const correctCharactersRef = useRef(0);
  const totalCharactersRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const countdownTimersRef = useRef([]);
  const wordIdRef = useRef(0);

  useEffect(() => {
    const saved = getTypingBestScores();
    setBestScore(saved.bestScore || 0);
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearCountdownTimers = useCallback(() => {
    countdownTimersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });
    countdownTimersRef.current = [];
  }, []);

  const clearRaceTimers = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }

    clearCountdownTimers();
  }, [clearCountdownTimers]);

  const updateHud = useCallback(() => {
    if (!startTimeRef.current) {
      return;
    }

    const elapsed = performance.now() - startTimeRef.current;
    const nextWpm = calculateWpm(correctCharactersRef.current, elapsed);
    const nextAccuracy = calculateAccuracy(
      correctCharactersRef.current,
      totalCharactersRef.current
    );

    setWpm(nextWpm);
    setAccuracy(nextAccuracy);
    setSessionTime(Math.round(elapsed / 1000));
  }, []);

  const finishRace = useCallback(() => {
    if (phaseRef.current === "result") {
      return;
    }

    clearRaceTimers();

    const finalElapsed = startTimeRef.current
      ? Math.max(1, performance.now() - startTimeRef.current)
      : 0;

    const finalWpm = calculateWpm(correctCharactersRef.current, finalElapsed);
    const finalAccuracy = calculateAccuracy(
      correctCharactersRef.current,
      totalCharactersRef.current
    );
    const finalRaceTime = startTimeRef.current
      ? Math.round(finalElapsed / 1000)
      : 0;

    const bestStats = getTypingBestScores();
    const nextBestStats = {
      bestWpm: Math.max(bestStats.bestWpm, finalWpm),
      bestScore: Math.max(bestStats.bestScore, scoreRef.current),
      bestAccuracy: Math.max(bestStats.bestAccuracy, finalAccuracy),
      bestRaceTime:
        finalRaceTime === 0
          ? bestStats.bestRaceTime
          : bestStats.bestRaceTime === 0 || finalRaceTime < bestStats.bestRaceTime
            ? finalRaceTime
            : bestStats.bestRaceTime,
      bestCombo: Math.max(bestStats.bestCombo, maxComboRef.current),
    };

    setTypingBestScores(nextBestStats);
    setBestScore(nextBestStats.bestScore);

    phaseRef.current = "result";
    setPhase("result");
    sound.playRaceFinish();
    updateHud();
  }, [clearRaceTimers, updateHud]);

  const startSpawnLoop = useCallback(() => {
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
    }

    spawnTimerRef.current = setInterval(() => {
      if (phaseRef.current !== "playing") {
        return;
      }

      const maxWords = Math.min(5, 2 + levelRef.current);

      if (wordsRef.current.length >= maxWords) {
        return;
      }

      const word = createRaceWord(
        wordIdRef.current++,
        levelRef.current,
        wordsRef.current.map((item) => item.text)
      );

      const nextWords = [...wordsRef.current, word];
      wordsRef.current = nextWords;
      setWords(nextWords);
    }, getSpawnRate(levelRef.current));
  }, []);

  const spawnWord = useCallback(() => {
    if (phaseRef.current !== "playing") {
      return;
    }

    const maxWords = Math.min(5, 2 + levelRef.current);

    if (wordsRef.current.length >= maxWords) {
      return;
    }

    const word = createRaceWord(
      wordIdRef.current++,
      levelRef.current,
      wordsRef.current.map((item) => item.text)
    );

    const nextWords = [...wordsRef.current, word];
    wordsRef.current = nextWords;
    setWords(nextWords);
  }, []);

  const resetGame = useCallback(() => {
    clearRaceTimers();

    wordsRef.current = [];
    typedRef.current = "";
    phaseRef.current = "idle";

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

    scoreRef.current = 0;
    missedWordsRef.current = 0;
    levelRef.current = 1;
    comboRef.current = 0;
    maxComboRef.current = 0;
    completedWordsRef.current = 0;
    correctCharactersRef.current = 0;
    totalCharactersRef.current = 0;
    startTimeRef.current = null;
  }, [clearRaceTimers]);

  const updateWords = useCallback(
    () => {
      if (phaseRef.current !== "playing") {
        return;
      }

      const nextWords = [];
      let newMisses = 0;

      wordsRef.current.forEach((word) => {
        const movedWord = {
          ...word,
          x: word.x + word.vx * 0.9,
          y: word.y + word.vy * 0.9,
          progress: word.progress + 1,
        };

        const isOffscreen =
          movedWord.x < -12 ||
          movedWord.x > 112 ||
          movedWord.y < -12 ||
          movedWord.y > 112;

        if (isOffscreen) {
          newMisses += 1;
          return;
        }

        nextWords.push(movedWord);
      });

      if (newMisses > 0) {
        const nextMissCount = missedWordsRef.current + newMisses;
        missedWordsRef.current = nextMissCount;
        setMissedWords(nextMissCount);

        comboRef.current = 0;
        setCombo(0);

        if (nextMissCount >= MAX_MISSES) {
          finishRace();
          return;
        }
      }

      wordsRef.current = nextWords;
      setWords(nextWords);
      updateHud();

      const nextRaceProgress = Math.min(
        100,
        (completedWordsRef.current / getRaceGoal()) * 100
      );

      setRaceProgress(nextRaceProgress);

      animationFrameRef.current = requestAnimationFrame(updateWords);
    },
    [finishRace, updateHud]
  );

  const startGame = useCallback(() => {
    clearRaceTimers();

    wordsRef.current = [];
    typedRef.current = "";
    phaseRef.current = "ready";
    scoreRef.current = 0;
    missedWordsRef.current = 0;
    levelRef.current = 1;
    comboRef.current = 0;
    maxComboRef.current = 0;
    completedWordsRef.current = 0;
    correctCharactersRef.current = 0;
    totalCharactersRef.current = 0;
    startTimeRef.current = null;

    setPhase("ready");
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
      setCountdownValue(0);
      phaseRef.current = "playing";
      setPhase("playing");
      startTimeRef.current = performance.now();
      setSessionTime(0);
      setRaceProgress(0);
      sound.playGo();

      for (let index = 0; index < 2; index += 1) {
        spawnWord();
      }

      startSpawnLoop();
      animationFrameRef.current = requestAnimationFrame(updateWords);
    }, 280 + countdownSteps.length * 260 + 220);

    countdownTimersRef.current.push(goTimer);
  }, [clearRaceTimers, spawnWord, startSpawnLoop, updateWords]);

  const completeWord = useCallback(
    (wordToComplete) => {
      const earned = getWordScore(wordToComplete.text, levelRef.current);
      const bonus = comboRef.current * 8;
      const totalEarned = earned + bonus;

      scoreRef.current += totalEarned;
      completedWordsRef.current += 1;
      comboRef.current += 1;
      maxComboRef.current = Math.max(maxComboRef.current, comboRef.current);

      const nextLap = getRaceLap(completedWordsRef.current);
      const nextLevel = getDifficulty(
        Math.min(5, 1 + Math.floor(completedWordsRef.current / 8))
      );

      if (nextLevel !== levelRef.current) {
        levelRef.current = nextLevel;
        setLevel(nextLevel);
        startSpawnLoop();
      }

      if (nextLap !== lap) {
        setLap(nextLap);
        sound.playLapComplete();
      }

      const nextCompleted = completedWordsRef.current;
      const nextRaceProgress = Math.min(
        100,
        (nextCompleted / getRaceGoal()) * 100
      );

      wordsRef.current = wordsRef.current.filter(
        (item) => item.id !== wordToComplete.id
      );

      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo(maxComboRef.current);
      setCompletedWords(nextCompleted);
      setWords([...wordsRef.current]);
      setRaceProgress(nextRaceProgress);
      setLap(nextLap);
      sound.playWordComplete();

      if (nextCompleted >= getRaceGoal()) {
        finishRace();
      }
    },
    [finishRace, lap, startSpawnLoop]
  );

  const handleInput = useCallback(
    (value) => {
      if (phaseRef.current !== "playing") {
        return;
      }

      const cleanValue = value.toLowerCase().replace(/\s/g, "");
      const previousValue = typedRef.current;
      const trailingCharacter =
        cleanValue.length > previousValue.length
          ? cleanValue[cleanValue.length - 1]
          : null;

      if (trailingCharacter) {
        totalCharactersRef.current += 1;

        const hasMatchingWord = wordsRef.current.some((word) =>
          word.text.startsWith(cleanValue)
        );

        const correctMatch = wordsRef.current.some((word) =>
          word.text[cleanValue.length - 1] === trailingCharacter
        );

        if (hasMatchingWord && correctMatch) {
          correctCharactersRef.current += 1;
        }
      }

      if (cleanValue.length > 0) {
        const matchingWords = wordsRef.current.filter((word) =>
          word.text.startsWith(cleanValue)
        );

        if (matchingWords.length === 0) {
          typedRef.current = "";
          setTypedText("");
          comboRef.current = 0;
          setCombo(0);
          return;
        }
      }

      const completedWord = wordsRef.current.find(
        (word) => word.text === cleanValue
      );

      if (completedWord) {
        completeWord(completedWord);
        typedRef.current = "";
        setTypedText("");
        return;
      }

      typedRef.current = cleanValue;
      setTypedText(cleanValue);
      updateHud();
    },
    [completeWord, updateHud]
  );

  useEffect(() => {
    return () => {
      clearRaceTimers();
    };
  }, [clearRaceTimers]);

  return {
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
  };
}

export default useTypingGame;