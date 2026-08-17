import {
  getSoundEnabledPreference,
  setSoundEnabledPreference,
} from "./storage";

function createTone({
  audioContext,
  frequency,
  duration,
  type = "sine",
  gainValue = 0.04,
  slideTo,
}) {
  if (!audioContext) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(
    frequency,
    audioContext.currentTime
  );

  if (typeof slideTo === "number") {
    oscillator.frequency.exponentialRampToValueAtTime(
      slideTo,
      audioContext.currentTime + duration
    );
  }

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    gainValue,
    audioContext.currentTime + 0.02
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

export function createSoundController() {
  let audioContext = null;
  let enabled = getSoundEnabledPreference();

  const ensureAudio = async () => {
    if (!enabled) {
      return null;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const AudioCtor =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioCtor) {
      return null;
    }

    if (!audioContext) {
      audioContext = new AudioCtor();
    }

    if (audioContext.state === "suspended") {
      try {
        await audioContext.resume();
      } catch {
        // Browser may block audio until user interaction.
      }
    }

    return audioContext;
  };

  const playTone = async ({
    frequency,
    duration = 0.12,
    type = "triangle",
    gainValue = 0.04,
    slideTo,
  }) => {
    if (!enabled) {
      return;
    }

    const context = await ensureAudio();

    if (!context) {
      return;
    }

    createTone({
      audioContext: context,
      frequency,
      duration,
      type,
      gainValue,
      slideTo,
    });
  };

  const playCountdownLight = async (step) => {
    if (step <= 0) {
      return;
    }

    await playTone({
      frequency: 260 + step * 60,
      duration: 0.08,
      type: "square",
      gainValue: 0.03,
      slideTo: 220 + step * 70,
    });
  };

  const playGo = async () => {
    await playTone({
      frequency: 880,
      duration: 0.12,
      type: "sawtooth",
      gainValue: 0.045,
      slideTo: 1200,
    });
  };

  const playWordComplete = async () => {
    await playTone({
      frequency: 420,
      duration: 0.08,
      type: "triangle",
      gainValue: 0.03,
      slideTo: 760,
    });
  };

  const playFalseStart = async () => {
    await playTone({
      frequency: 180,
      duration: 0.18,
      type: "square",
      gainValue: 0.03,
      slideTo: 120,
    });
  };

  const playLapComplete = async () => {
    await playTone({
      frequency: 620,
      duration: 0.1,
      type: "triangle",
      gainValue: 0.035,
      slideTo: 960,
    });
  };

  const playRaceFinish = async () => {
    await playTone({
      frequency: 780,
      duration: 0.16,
      type: "sawtooth",
      gainValue: 0.04,
      slideTo: 1000,
    });

    setTimeout(() => {
      playTone({
        frequency: 980,
        duration: 0.12,
        type: "triangle",
        gainValue: 0.03,
        slideTo: 1160,
      });
    }, 80);
  };

  const playReactionResult = async () => {
    await playTone({
      frequency: 520,
      duration: 0.12,
      type: "triangle",
      gainValue: 0.04,
      slideTo: 740,
    });
  };

  const toggleMute = () => {
    enabled = !enabled;
    setSoundEnabledPreference(enabled);
    return enabled;
  };

  return {
    isEnabled: () => enabled,
    toggleMute,
    setEnabled(nextEnabled) {
      enabled = Boolean(nextEnabled);
      setSoundEnabledPreference(enabled);
      return enabled;
    },
    ensureAudio,
    playCountdownLight,
    playGo,
    playWordComplete,
    playFalseStart,
    playLapComplete,
    playRaceFinish,
    playReactionResult,
  };
}

export default createSoundController();
