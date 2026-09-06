/**
 * SandSimulation + DustLayer + WindSystem on a single pooled Canvas 2D surface.
 * Purely decorative: pointer-events none, fails silently, and the site works
 * exactly the same if this never mounts.
 */
import { useEffect, useRef } from "react";

import { ENV_CONFIG } from "./config";
import { atmosphere } from "./atmosphere";
import { DEFAULT_TUNING, getEnvironmentTuning, subscribeEnvironmentTuning, type EnvironmentTuning } from "./tuning";

type Grain = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  depth: number; // 0 = distant, 1 = foreground
  drift: number;
  seed: number;
};

type Swirl = { x: number; y: number; life: number; max: number; radius: number; dir: number };
type Cloud = { x: number; y: number; r: number; speed: number; alpha: number };

const SAND_TONES = ["212, 186, 138", "196, 160, 108", "230, 214, 184", "166, 138, 96"];

export function SandCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let maybeCtx: CanvasRenderingContext2D | null = null;
    try {
      maybeCtx = canvas.getContext("2d", { alpha: true });
    } catch {
      maybeCtx = null;
    }
    if (!maybeCtx) {
      canvas.style.display = "none";
      return;
    }
    const ctx = maybeCtx;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    atmosphere.setQuality(coarse.matches ? ENV_CONFIG.mobileQuality : "high");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let last = performance.now();
    let fpsAccum = 0;
    let fpsFrames = 0;
    let tuning: EnvironmentTuning = getEnvironmentTuning();

    const layers: Grain[][] = [];
    const swirls: Swirl[] = [];
    const clouds: Cloud[] = [];

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const spawnGrain = (depth: number): Grain => ({
      x: rand(0, Math.max(1, width)),
      y: rand(-40, height + 40),
      vx: rand(0.25, 1) * (0.35 + depth),
      vy: rand(-0.12, 0.16),
      size: 0.4 + depth * rand(0.8, 2),
      alpha: 0.08 + depth * rand(0.12, 0.4),
      depth,
      drift: rand(0, Math.PI * 2),
      seed: rand(0.4, 1.6),
    });

    const buildLayers = () => {
      const scale = atmosphere.qualityScale();
      layers.length = 0;
      const defs: [number, number][] = [
        [0.18, ENV_CONFIG.particleCount.distant],
        [0.5, ENV_CONFIG.particleCount.midground],
        [0.95, ENV_CONFIG.particleCount.foreground],
      ];
      for (const [depth, base] of defs) {
        const count = Math.max(0, Math.round(base * scale * tuning.particleScale));
        const grains: Grain[] = [];
        for (let i = 0; i < count; i += 1) grains.push(spawnGrain(depth));
        layers.push(grains);
      }
      // ground-level skimming sand (always the last layer)
      const groundCount = Math.max(0, Math.round(ENV_CONFIG.particleCount.ground * scale * tuning.particleScale));
      const ground: Grain[] = [];
      for (let i = 0; i < groundCount; i += 1) {
        const g = spawnGrain(0.7);
        g.y = height - rand(0, Math.min(150, height * 0.18));
        ground.push(g);
      }
      layers.push(ground);

      clouds.length = 0;
      const cloudCount = Math.max(0, Math.round(ENV_CONFIG.hazeClouds * scale * tuning.particleScale));
      for (let i = 0; i < cloudCount; i += 1) {
        clouds.push({
          x: rand(0, width),
          y: rand(height * 0.1, height * 0.95),
          r: rand(height * 0.2, height * 0.5),
          speed: rand(0.04, 0.14),
          alpha: rand(0.012, 0.03),
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, coarse.matches ? 1.25 : 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLayers();
    };

    const degrade = () => {
      if (atmosphere.quality === "high") atmosphere.setQuality("medium");
      else if (atmosphere.quality === "medium") atmosphere.setQuality("low");
      else if (atmosphere.quality === "low") atmosphere.setQuality("off");
      else return;
      buildLayers();
    };

    const drawClouds = (delta: number) => {
      const haze = atmosphere.preset.haze * tuning.dustOpacity;
      const wind = atmosphere.windForce() * tuning.windStrength;
      for (const cloud of clouds) {
        cloud.x += cloud.speed * wind * delta * ENV_CONFIG.windDirection;
        if (cloud.x - cloud.r > width) cloud.x = -cloud.r;
        const gradient = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
        gradient.addColorStop(0, `rgba(214, 186, 138, ${cloud.alpha * haze})`);
        gradient.addColorStop(1, "rgba(214, 186, 138, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const updateSwirls = (delta: number) => {
      if (
        atmosphere.qualityScale() > 0.4 &&
        swirls.length < ENV_CONFIG.swirl.maxActive &&
        Math.random() < ENV_CONFIG.swirl.chance * delta * (1 + atmosphere.wind.gust)
      ) {
        const max = rand(ENV_CONFIG.swirl.minLife, ENV_CONFIG.swirl.maxLife);
        swirls.push({
          x: rand(width * 0.1, width * 0.9),
          y: rand(height * 0.35, height * 0.95),
          life: max,
          max,
          radius: rand(45, 110),
          dir: Math.random() > 0.5 ? 1 : -1,
        });
      }
      for (let i = swirls.length - 1; i >= 0; i -= 1) {
        const s = swirls[i]!;
        s.life -= delta / 60;
        if (s.life <= 0) swirls.splice(i, 1);
      }
    };

    const swirlForce = (grain: Grain) => {
      let fx = 0;
      let fy = 0;
      for (const s of swirls) {
        const dx = grain.x - s.x;
        const dy = grain.y - s.y;
        const dist = Math.hypot(dx, dy);
        if (dist > s.radius || dist < 0.01) continue;
        const strength = (1 - dist / s.radius) * Math.sin((s.life / s.max) * Math.PI) * 0.7;
        fx += (-dy / dist) * strength * s.dir;
        fy += (dx / dist) * strength * s.dir;
      }
      return [fx, fy] as const;
    };

    const cursorForce = (grain: Grain) => {
      const p = atmosphere.pointer;
      if (!p.active || p.speed < 0.02) return [0, 0] as const;
      const dx = grain.x - p.x;
      const dy = grain.y - p.y;
      const dist = Math.hypot(dx, dy);
      const radius = ENV_CONFIG.cursorWakeRadius;
      if (dist > radius) return [0, 0] as const;
      const falloff = (1 - dist / radius) * Math.min(ENV_CONFIG.maxCursorForce, p.speed);
      return [
        (p.vx * 0.03 + (dx / (dist || 1)) * 0.22) * falloff * grain.depth,
        (p.vy * 0.03 + (dy / (dist || 1)) * 0.22) * falloff * grain.depth,
      ] as const;
    };

    const burstForce = (grain: Grain, now: number) => {
      let fx = 0;
      let fy = 0;
      for (const burst of atmosphere.bursts) {
        const age = (now - burst.time) / 450;
        if (age > 1) continue;
        const dx = grain.x - burst.x;
        const dy = grain.y - burst.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 90 || dist < 0.01) continue;
        const power = (1 - age) * (1 - dist / 90) * 0.8;
        fx += (dx / dist) * power;
        fy += (dy / dist) * power;
      }
      return [fx, fy] as const;
    };

    const draw = (time: number) => {
      const rawDelta = Math.min(48, time - last);
      const delta = Math.max(0.2, rawDelta / 16.67);
      last = time;

      fpsAccum += rawDelta;
      fpsFrames += 1;
      if (fpsFrames >= 60) {
        const fps = 1000 / (fpsAccum / fpsFrames);
        fpsAccum = 0;
        fpsFrames = 0;
        if (fps < 34) degrade();
      }

      atmosphere.update(delta);
      if (atmosphere.bursts.length) {
        atmosphere.bursts = atmosphere.bursts.filter((b) => time - b.time < 500);
      }

      ctx.clearRect(0, 0, width, height);

      if (atmosphere.quality === "off") {
        frame = window.requestAnimationFrame(draw);
        return;
      }

      drawClouds(delta);
      if (!reduce.matches) updateSwirls(delta);

       const wind = atmosphere.windForce() * tuning.windStrength * (reduce.matches ? 0.12 : 1);
      const turbulence = ENV_CONFIG.turbulence * (reduce.matches ? 0.1 : 1);
      const dust = atmosphere.preset.dust;
      const groundFloor = height - Math.min(160, height * 0.2);

      for (let li = 0; li < layers.length; li += 1) {
        const grains = layers[li]!;
        const isGround = li === layers.length - 1;
        for (const grain of grains) {
          grain.drift += 0.012 * delta * grain.seed;
          const noise = Math.sin(grain.drift) * turbulence;
          const [sx, sy] = swirlForce(grain);
          const [cx, cy] = cursorForce(grain);
          const [bx, by] = burstForce(grain, time);

          const targetVx =
            wind * (0.35 + grain.depth) * ENV_CONFIG.windDirection * (isGround ? 1.35 : 1) +
            noise * 0.35;
          grain.vx += (targetVx - grain.vx) * 0.06 * delta + (sx + cx + bx) * delta * 0.35;
          grain.vy +=
            (noise * 0.22 + 0.012 * grain.depth - grain.vy) * 0.05 * delta +
            (sy + cy + by) * delta * 0.35;

          grain.x += grain.vx * delta;
          grain.y += grain.vy * delta;

          // recycle in place — no allocations per frame
          if (grain.x > width + 30) {
            grain.x = -20;
            grain.y = isGround ? height - rand(0, Math.min(150, height * 0.18)) : rand(-20, height);
          } else if (grain.x < -60) {
            grain.x = width + 20;
          }
          if (isGround) {
            if (grain.y < groundFloor) grain.y = groundFloor + rand(0, 12);
            if (grain.y > height + 10) grain.y = height - rand(0, 20);
          } else if (grain.y < -50 || grain.y > height + 50) {
            grain.y = grain.y < 0 ? height + 20 : -20;
          }

          const tone = SAND_TONES[Math.floor(grain.seed * SAND_TONES.length) % SAND_TONES.length]!;
           const alpha = grain.alpha * dust * (tuning.dustOpacity / DEFAULT_TUNING.dustOpacity) * (reduce.matches ? 0.5 : 1);
          ctx.fillStyle = `rgba(${tone}, ${alpha})`;
          if (grain.depth > 0.8 && Math.abs(grain.vx) > 1.6) {
            ctx.fillRect(grain.x, grain.y, grain.size + Math.min(9, Math.abs(grain.vx) * 1.6), grain.size);
          } else {
            ctx.fillRect(grain.x, grain.y, grain.size, grain.size);
          }
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => atmosphere.notePointer(event.clientX, event.clientY);
    const onScroll = () => atmosphere.noteScroll();

    const onVisibility = () => {
      if (document.hidden && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden && !frame) {
        last = performance.now();
        frame = window.requestAnimationFrame(draw);
      }
    };

    let unsubscribe: (() => void) | null = null;

    try {
      resize();
      unsubscribe = subscribeEnvironmentTuning((nextTuning) => {
        tuning = nextTuning;
        buildLayers();
      });
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      frame = window.requestAnimationFrame(draw);
    } catch {
      canvas.style.display = "none";
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="sand-canvas" aria-hidden="true" />;
}
