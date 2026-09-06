/**
 * CustomCursor — minimal targeting-instrument cursor with spring inertia,
 * velocity stretch, a short dust trail, hover/click states and a hard fail-safe
 * that restores the native pointer if anything goes wrong.
 */
import { useEffect, useRef } from "react";

import { ENV_CONFIG } from "./config";
import { atmosphere } from "./atmosphere";

type TrailDot = { x: number; y: number; life: number; el: HTMLSpanElement };

const HOVER_SELECTOR =
  "a, button, [role='button'], input[type='submit'], summary, label.event-option, .event-card, .personnel-card";

export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches) return; // mobile/touch: no fake cursor at all

    const ring = root.querySelector<HTMLElement>(".env-cursor-ring");
    const dot = root.querySelector<HTMLElement>(".env-cursor-dot");
    const halo = root.querySelector<HTMLElement>(".env-cursor-halo");
    const label = root.querySelector<HTMLElement>(".env-cursor-label");
    const trailHost = root.querySelector<HTMLElement>(".env-cursor-trail");
    if (!ring || !dot || !halo || !label || !trailHost) return; // fail-safe

    document.documentElement.classList.add("has-env-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let frame = 0;
    let visible = false;
    const trail: TrailDot[] = [];
    const pool: HTMLSpanElement[] = [];

    const takeDot = () => {
      const el = pool.pop() ?? document.createElement("span");
      el.className = "env-cursor-speck";
      if (!el.parentElement) trailHost.appendChild(el);
      el.style.opacity = "0.6";
      return el;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      tx = event.clientX;
      ty = event.clientY;
      atmosphere.notePointer(tx, ty, performance.now());
      if (!visible) {
        visible = true;
        root.classList.add("is-visible");
      }
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      const interactive = target.closest(HOVER_SELECTOR);
      const card = target.closest(".event-card, .personnel-card, label.event-option");
      root.classList.toggle("is-hover", Boolean(interactive));
      root.classList.toggle("is-target", Boolean(card));
      label.textContent = card ? "TARGET" : interactive ? "ACCESS" : "";
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      root.classList.add("is-click");
      atmosphere.addBurst(event.clientX, event.clientY);
      window.setTimeout(() => root.classList.remove("is-click"), 420);
    };

    const onLeave = () => {
      visible = false;
      root.classList.remove("is-visible");
    };

    const loop = () => {
      const lerp = reduce.matches ? 1 : ENV_CONFIG.cursorLerp;
      const dx = tx - x;
      const dy = ty - y;
      x += dx * lerp;
      y += dy * lerp;

      const speed = Math.min(1, Math.hypot(dx, dy) / 45);
      const stretch = reduce.matches ? 0 : speed;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `rotate(${angle}deg) scaleX(${1 + stretch * 0.55}) scaleY(${1 - stretch * 0.18})`;
      halo.style.opacity = String(0.18 + stretch * 0.35);

      if (!reduce.matches && speed > 0.12 && trail.length < ENV_CONFIG.maxTrail) {
        const el = takeDot();
        el.style.transform = `translate3d(${x - dx * 0.6}px, ${y - dy * 0.6}px, 0)`;
        trail.push({ x, y, life: 1, el });
      }

      for (let i = trail.length - 1; i >= 0; i -= 1) {
        const t = trail[i]!;
        t.life -= 0.06;
        if (t.life <= 0) {
          t.el.style.opacity = "0";
          pool.push(t.el);
          trail.splice(i, 1);
          continue;
        }
        t.el.style.opacity = String(t.life * 0.45);
      }

      frame = window.requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("pointerleave", onLeave);
    frame = window.requestAnimationFrame(loop);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-env-cursor");
    };
  }, []);

  return (
    <div ref={rootRef} className="env-cursor" aria-hidden="true">
      <span className="env-cursor-halo" />
      <span className="env-cursor-ring" />
      <span className="env-cursor-ring env-cursor-ring-outer" />
      <span className="env-cursor-dot" />
      <span className="env-cursor-label" />
      <span className="env-cursor-trail" />
    </div>
  );
}
