const safeStorage = {
  get() {
    try {
      return window?.localStorage ?? null;
    } catch {
      return null;
    }
  },
};

export const STORAGE_KEYS = {
  reactionBest: "reflex-arena-reaction-best",
  typingBest: "reflex-arena-typing-best",
  soundEnabled: "reflex-arena-sound-enabled",
};

export function readStorageValue(key, fallback = null) {
  const storage = safeStorage.get();

  if (!storage) {
    return fallback;
  }

  try {
    const saved = storage.getItem(key);

    return saved === null ? fallback : saved;
  } catch {
    return fallback;
  }
}

export function writeStorageValue(key, value) {
  const storage = safeStorage.get();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export function readNumber(key, fallback = 0) {
  const value = readStorageValue(key, fallback);

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function writeNumber(key, value) {
  return writeStorageValue(key, Number(value));
}

export function readBoolean(key, fallback = true) {
  const value = readStorageValue(key, fallback ? "true" : "false");

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return Boolean(fallback);
}

export function writeBoolean(key, value) {
  return writeStorageValue(key, Boolean(value));
}

export function getTypingBestScores() {
  return {
    bestWpm: readNumber(`${STORAGE_KEYS.typingBest}-wpm`, 0),
    bestScore: readNumber(`${STORAGE_KEYS.typingBest}-score`, 0),
    bestAccuracy: readNumber(`${STORAGE_KEYS.typingBest}-accuracy`, 0),
    bestRaceTime: readNumber(`${STORAGE_KEYS.typingBest}-time`, 0),
    bestCombo: readNumber(`${STORAGE_KEYS.typingBest}-combo`, 0),
  };
}

export function setTypingBestScores(next) {
  const updates = [
    ["bestWpm", `${STORAGE_KEYS.typingBest}-wpm`],
    ["bestScore", `${STORAGE_KEYS.typingBest}-score`],
    ["bestAccuracy", `${STORAGE_KEYS.typingBest}-accuracy`],
    ["bestRaceTime", `${STORAGE_KEYS.typingBest}-time`],
    ["bestCombo", `${STORAGE_KEYS.typingBest}-combo`],
  ];

  updates.forEach(([key, storageKey]) => {
    if (typeof next[key] === "number") {
      writeNumber(storageKey, next[key]);
    }
  });
}

export function getReactionBest() {
  return readNumber(STORAGE_KEYS.reactionBest, 0);
}

export function setReactionBest(value) {
  return writeNumber(STORAGE_KEYS.reactionBest, value);
}

export function getSoundEnabledPreference() {
  return readBoolean(STORAGE_KEYS.soundEnabled, true);
}

export function setSoundEnabledPreference(value) {
  return writeBoolean(STORAGE_KEYS.soundEnabled, value);
}
