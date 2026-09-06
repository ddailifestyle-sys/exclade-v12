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
  "/": { wind: 1.08, dust: 1, haze: 0.92, light: 1.08 },
  "/about": { wind: 0.84, dust: 0.92, haze: 1.12, light: 0.95 },
  "/events": { wind: 1, dust: 0.78, haze: 0.76, light: 1 },
  "/crew": { wind: 0.68, dust: 0.72, haze: 0.86, light: 0.8 },
  "/register": { wind: 0.56, dust: 0.62, haze: 0.7, light: 0.85 },
  "/contact": { wind: 0.64, dust: 0.76, haze: 0.9, light: 0.9 },
};

export function presetFor(pathname: string): AtmospherePreset {
  return SECTION_PRESETS[pathname] ?? DEFAULT_PRESET;
}
