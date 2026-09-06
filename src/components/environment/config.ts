/**
 * EXCLADE 2K26 — Environmental system configuration.
 * All tuning values live here so the atmosphere can be balanced in one place.
 */

export type QualityTier = "high" | "medium" | "low" | "off";

export const ENV_CONFIG = {
  /* wind */
  windStrength: 1,
  windDirection: 1, // dominant horizontal direction (1 = right)
  gustFrequency: { minSeconds: 10, maxSeconds: 25 },
  gustPeak: 2.2,
  turbulence: 0.55,

  /* particles per layer at high quality */
  particleCount: {
    foreground: 85,
    midground: 160,
    distant: 200,
    ground: 85,
  },

  /* haze / dust clouds */
  dustOpacity: 0.5,
  hazeClouds: 5,

  /* swirls */
  swirl: { chance: 0.0022, minLife: 1, maxLife: 3, maxActive: 2 },

  /* cursor */
  cursorLerp: 0.14,
  maxCursorForce: 1,
  cursorWakeRadius: 130,
  maxTrail: 26,

  /* liquid */
  liquidTilt: 8, // degrees

  /* quality multipliers */
  quality: {
    high: 1,
    medium: 0.58,
    low: 0.3,
    off: 0,
  } as Record<QualityTier, number>,

  mobileQuality: "low" as QualityTier,
} as const;

export type AtmospherePreset = {
  wind: number;
  dust: number;
  haze: number;
  light: number;
};

const DEFAULT_PRESET: AtmospherePreset = { wind: 1, dust: 1, haze: 1, light: 1 };

/** Section-based atmosphere — subtle differences only, never a hard switch. */
export const SECTION_PRESETS: Record<string, AtmospherePreset> = {
  "/": { wind: 1.32, dust: 1.05, haze: 0.9, light: 1.1 },
  "/about": { wind: 0.8, dust: 0.88, haze: 1.1, light: 0.96 },
  "/events": { wind: 0.95, dust: 0.74, haze: 0.78, light: 1 },
  "/crew": { wind: 0.42, dust: 0.5, haze: 0.82, light: 0.82 },
  "/register": { wind: 0.22, dust: 0.34, haze: 0.62, light: 0.88 },
  "/contact": { wind: 0.6, dust: 0.7, haze: 0.88, light: 0.9 },
};

export function presetFor(pathname: string): AtmospherePreset {
  return SECTION_PRESETS[pathname] ?? DEFAULT_PRESET;
}
