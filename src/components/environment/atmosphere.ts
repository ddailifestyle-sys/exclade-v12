/**
 * AtmosphereController — a tiny singleton store shared by the sand simulation,
 * the custom cursor and the liquid layer. Deliberately ref/mutation based so
 * nothing here triggers React re-renders per frame.
 */
import { ENV_CONFIG, presetFor, type AtmospherePreset, type QualityTier } from "./config";

export type PointerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  active: boolean;
};

export type WindState = {
  base: number;
  gust: number;
  phase: number;
  nextGustAt: number;
  gustLife: number;
  gustDuration: number;
};

type Burst = { x: number; y: number; time: number };

class Atmosphere {
  pointer: PointerState = { x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, active: false };

  wind: WindState = {
    base: 0.85,
    gust: 0,
    phase: 0,
    nextGustAt: 6,
    gustLife: 0,
    gustDuration: 0,
  };

  preset: AtmospherePreset = presetFor("/");
  targetPreset: AtmospherePreset = presetFor("/");
  scrollEnergy = 0;
  audioEnergy = 0;
  quality: QualityTier = "high";
  bursts: Burst[] = [];

  private lastScrollY = 0;

  setRoute(pathname: string) {
    this.targetPreset = presetFor(pathname);
  }

  setQuality(quality: QualityTier) {
    this.quality = quality;
  }

  qualityScale() {
    return ENV_CONFIG.quality[this.quality];
  }

  addBurst(x: number, y: number) {
    if (this.bursts.length > 6) this.bursts.shift();
    this.bursts.push({ x, y, time: performance.now() });
  }

  notePointer(x: number, y: number) {
    const p = this.pointer;
    if (!p.active) {
      p.x = x;
      p.y = y;
      p.active = true;
      return;
    }
    p.vx = x - p.x;
    p.vy = y - p.y;
    p.x = x;
    p.y = y;
    p.speed = Math.min(1, Math.hypot(p.vx, p.vy) / 38);
  }

  noteScroll() {
    const y = window.scrollY;
    const delta = Math.abs(y - this.lastScrollY);
    this.lastScrollY = y;
    this.scrollEnergy = Math.min(1, this.scrollEnergy + delta / 900);
  }

  /** Advance wind cycle + easings. `delta` is in ~60fps frames. */
  update(delta: number) {
    const seconds = delta / 60;
    const w = this.wind;

    w.phase += seconds;
    if (w.gustLife > 0) {
      w.gustLife -= seconds;
      const t = 1 - Math.max(0, w.gustLife) / w.gustDuration;
      // gradual acceleration → peak → gradual decay
      w.gust = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) * ENV_CONFIG.gustPeak;
      if (w.gustLife <= 0) {
        w.gust = 0;
        const { minSeconds, maxSeconds } = ENV_CONFIG.gustFrequency;
        w.nextGustAt = w.phase + minSeconds + Math.random() * (maxSeconds - minSeconds);
      }
    } else if (w.phase >= w.nextGustAt) {
      w.gustDuration = 4 + Math.random() * 5;
      w.gustLife = w.gustDuration;
    }

    // breathing calm / light-breeze baseline
    w.base = 0.8 + Math.sin(w.phase * 0.18) * 0.18 + Math.sin(w.phase * 0.07) * 0.1;

    // ease section preset changes so transitions stay seamless
    const ease = 1 - Math.pow(0.985, delta);
    const p = this.preset;
    const t = this.targetPreset;
    this.preset = {
      wind: p.wind + (t.wind - p.wind) * ease,
      dust: p.dust + (t.dust - p.dust) * ease,
      haze: p.haze + (t.haze - p.haze) * ease,
      light: p.light + (t.light - p.light) * ease,
    };

    this.scrollEnergy *= Math.pow(0.94, delta);
    this.audioEnergy *= Math.pow(0.97, delta);

    const pointer = this.pointer;
    pointer.speed *= Math.pow(0.86, delta);
    pointer.vx *= Math.pow(0.86, delta);
    pointer.vy *= Math.pow(0.86, delta);
  }

  /** Effective wind multiplier used by the sand simulation. */
  windForce() {
    return (
      ENV_CONFIG.windStrength *
      this.preset.wind *
      (this.wind.base + this.wind.gust) *
      (1 + this.scrollEnergy * 0.35)
    );
  }
}

export const atmosphere = new Atmosphere();
