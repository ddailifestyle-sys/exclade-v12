/**
 * CustomCursor + CursorInteraction.
 * Minimal targeting instrument: glowing core, thin ring, inertia, dust trail,
 * hover/click states. Desktop (fine pointer) only, never mounted on touch, and
 * it restores the native cursor if anything goes wrong.
 */
import { useEffect, useRef, useState } from "react";

import { ENV_CONFIG } from "./config";
import { atmosphere } from "./atmosphere";

const INTERACTIVE = 'a,button,[role="button"],input,select,textarea,label,summary,[data-cursor]';
const CARD_SELECTOR = "[data-cursor='target'],.event-card,.file-card,.personnel-card";

type Mote = { x: number; y: number; vx: number; vy: number; life: number };

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    setEnabled(fine.matches);
    const onChange = () => setEnabled(fine.matches);
    fine.addEventListener("change", onChange);
    return () => fine.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const canvas = trailRef.current;
    if (!root || !canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      ctx = null;
    }
    if (!ctx) {
      document.body.classList.remove("has-lab-cursor");
      return;
    }
    const context = ctx;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    document.body.classList.add("has-lab-cursor");

    let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const view = { x: target.x, y: target.y };
    const motes: Mote[] = Array.from({ length: 34 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0 }));
    let frame = 0;
    let visible = false;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnMotes = (count: number, x: number, y: number, power: number) => {
      let spawned = 0;
      for (const mote of motes) {
        if (spawned >= count) break;
        if (mote.life > 0) continue;
        mote.x = x;
        mote.y = y;
        mote.vx = (Math.random() - 0.5) * power - atmosphere.pointer.vx * 0.12;
        mote.vy = (Math.random() - 0.5) * power - atmosphere.pointer.vy * 0.12;
        mote.life = 1;
        spawned += 1;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      target = { x: event.clientX, y: event.clientY };
      if (!visible) {
        view.x = target.x;
        view.y = target.y;
        visible = true;
        root.classList.add("is-visible");
      }
      const el = event.target as HTMLElement | null;
      const interactive = el?.closest?.(INTERACTIVE);
      const card = el?.closest?.(CARD_SELECTOR);
      root.classList.toggle("is-hover", Boolean(interactive));
      root.classList.toggle("is-target", Boolean(card) && !interactive);
      if (labelRef.current) {
        const label = interactive?.getAttribute("data-cursor-label");
        labelRef.current.textContent = label ?? (interactive ? "ACCESS" : "");
        labelRef.current.classList.toggle("is-shown", Boolean(interactive));
      }
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      root.classList.add("is-pressed");
      atmosphere.addBurst(event.clientX, event.clientY);
      if (!reduce.matches) spawnMotes(8, event.clientX, event.clientY, 3.4);
      window.setTimeout(() => root.classList.remove("is-pressed"), 420);
    };

    const onLeave = () => {
      visible = false;
      root.classList.remove("is-visible");
    };

    const tick = () => {
      const lerp = reduce.matches ? 1 : ENV_CONFIG.cursorLerp;
      view.x += (target.x - view.x) * lerp;
      view.y += (target.y - view.y) * lerp;

      const dx = target.x - view.x;
      const dy = target.y - view.y;
      const speed = Math.min(1, Math.hypot(dx, dy) / 46);
      const angle = Math.atan2(dy, dx);
      const stretch = reduce.matches ? 0 : Math.min(ENV_CONFIG.maxTrail, speed * ENV_CONFIG.maxTrail);

      root.style.transform = `translate3d(${view.x}px, ${view.y}px, 0)`;
      root.style.setProperty("--cursor-angle", `${angle}rad`);
      root.style.setProperty("--cursor-stretch", `${1 + speed * 0.45}`);
      root.style.setProperty("--cursor-trail", `${stretch}px`);

      if (!reduce.matches && speed > 0.16 && Math.random() < 0.6) {
        spawnMotes(1, view.x - Math.cos(angle) * 8, view.y - Math.sin(angle) * 8, 1.1 + speed * 1.6);
      }

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const mote of motes) {
        if (mote.life <= 0) continue;
        mote.life -= 0.045;
        mote.vx *= 0.93;
        mote.vy *= 0.93;
        mote.x += mote.vx + atmosphere.windForce() * 0.25;
        mote.y += mote.vy + 0.08;
        context.fillStyle = `rgba(224, 196, 148, ${Math.max(0, mote.life) * 0.5})`;
        context.fillRect(mote.x, mote.y, 1.4, 1.4);
      }

      frame = window.requestAnimationFrame(tick);
    };

    try {
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      frame = window.requestAnimationFrame(tick);
    } catch {
      document.body.classList.remove("has-lab-cursor");
      root.style.display = "none";
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.body.classList.remove("has-lab-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas ref={trailRef} className="cursor-trail-canvas" aria-hidden="true" />
      <div ref={rootRef} className="lab-cursor-v2" aria-hidden="true">
        <span className="lc-streak" />
        <span className="lc-ring" />
        <span className="lc-ring-secondary" />
        <span className="lc-core" />
        <span className="lc-ripple" />
        <span ref={labelRef} className="lc-label" />
      </div>
    </>
  );
}
