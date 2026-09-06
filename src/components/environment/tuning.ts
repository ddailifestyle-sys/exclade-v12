export type EnvironmentTuning = {
  windStrength: number;
  particleScale: number;
  dustOpacity: number;
};

const STORAGE_KEY = "exclade-environment-tuning";
const DEFAULT_TUNING: EnvironmentTuning = {
  windStrength: 1,
  particleScale: 1,
  dustOpacity: 0.5,
};

let currentTuning: EnvironmentTuning = { ...DEFAULT_TUNING };
let hasLoaded = false;
const listeners = new Set<(tuning: EnvironmentTuning) => void>();

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadTuning() {
  if (hasLoaded || typeof window === "undefined") return;
  hasLoaded = true;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Partial<EnvironmentTuning>;
    const numberOr = (value: number | undefined, fallback: number) =>
      typeof value === "number" && Number.isFinite(value) ? value : fallback;
    currentTuning = {
      windStrength: clamp(numberOr(parsed.windStrength, DEFAULT_TUNING.windStrength), 0, 2),
      particleScale: clamp(numberOr(parsed.particleScale, DEFAULT_TUNING.particleScale), 0, 1.5),
      dustOpacity: clamp(numberOr(parsed.dustOpacity, DEFAULT_TUNING.dustOpacity), 0, 1),
    };
  } catch {
    currentTuning = { ...DEFAULT_TUNING };
  }
}

export function getEnvironmentTuning() {
  loadTuning();
  return currentTuning;
}

export function setEnvironmentTuning(patch: Partial<EnvironmentTuning>) {
  const next = {
    windStrength: clamp(patch.windStrength ?? currentTuning.windStrength, 0, 2),
    particleScale: clamp(patch.particleScale ?? currentTuning.particleScale, 0, 1.5),
    dustOpacity: clamp(patch.dustOpacity ?? currentTuning.dustOpacity, 0, 1),
  };
  currentTuning = next;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The controls still work when storage is unavailable.
    }
  }

  listeners.forEach((listener) => listener(currentTuning));
}

export function resetEnvironmentTuning() {
  setEnvironmentTuning(DEFAULT_TUNING);
}

export function subscribeEnvironmentTuning(listener: (tuning: EnvironmentTuning) => void) {
  listeners.add(listener);
  listener(getEnvironmentTuning());
  return () => listeners.delete(listener);
}

export { DEFAULT_TUNING };