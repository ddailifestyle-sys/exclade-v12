import { useEffect, useRef } from "react";

type LiquidState = {
  angle: number;
  targetAngle: number;
  velocity: number;
  energy: number;
  targetEnergy: number;
  wave: number;
  waveVelocity: number;
  lastX: number;
  lastY: number;
  hasPointer: boolean;
};

const MAX_TILT = Math.PI / 22.5;

export function GravityWaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state: LiquidState = {
      angle: 0,
      targetAngle: 0,
      velocity: 0,
      energy: 0,
      targetEnergy: 0,
      wave: 0,
      waveVelocity: 0,
      lastX: 0,
      lastY: 0,
      hasPointer: false,
    };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let lastTime = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduceMotion.matches) return;
      if (!state.hasPointer) {
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        state.hasPointer = true;
        return;
      }
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      const speed = Math.min(1, Math.hypot(dx, dy) / 42);
      if (speed < 0.01) return;
      state.targetAngle = Math.max(-MAX_TILT, Math.min(MAX_TILT, (dx / 24) * MAX_TILT));
      state.targetEnergy = Math.min(1, state.targetEnergy + speed * 0.32);
      state.waveVelocity += Math.max(-0.035, Math.min(0.035, (dx + dy) * 0.00055));
    };

    const draw = (time: number) => {
      const delta = Math.min(32, time - lastTime) / 16.67;
      lastTime = time;
      const settling = Math.pow(0.88, delta);
      state.targetAngle *= Math.pow(0.88, delta);
      state.targetEnergy *= Math.pow(0.93, delta);
      state.angle += (state.targetAngle - state.angle) * (1 - Math.pow(0.84, delta));
      state.velocity = state.velocity * Math.pow(0.78, delta) + (state.targetAngle - state.angle) * 0.018 * delta;
      state.angle += state.velocity;
      state.waveVelocity *= settling;
      state.wave += state.waveVelocity;
      state.wave *= Math.pow(0.9, delta);
      state.energy += (state.targetEnergy - state.energy) * (1 - Math.pow(0.8, delta));

      context.clearRect(0, 0, width, height);
      const centerX = width * 0.5;
      const centerY = height * 0.52;
      const liquidY = height * 0.58;
      const liquidHeight = height * 0.42;
      const tilt = Math.tan(state.angle);
      const waveAmplitude = 2 + state.energy * 8 + Math.abs(state.wave) * 60;

      context.save();
      context.globalAlpha = reduceMotion.matches ? 0.055 : 0.075;
      context.translate(centerX, centerY);
      context.rotate(state.angle * 0.32);
      context.translate(-centerX, -centerY);
      const gradient = context.createLinearGradient(0, liquidY, 0, height);
      gradient.addColorStop(0, "rgba(125, 211, 252, 0.24)");
      gradient.addColorStop(0.25, "rgba(56, 189, 248, 0.12)");
      gradient.addColorStop(0.62, "rgba(45, 212, 191, 0.07)");
      gradient.addColorStop(1, "rgba(17, 22, 12, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(0, liquidY + tilt * -width * 0.5);
      for (let x = 0; x <= width; x += Math.max(14, width / 60)) {
        const normalized = x / width;
        const curve = Math.sin(normalized * Math.PI * 2.4 + state.wave * 9) * waveAmplitude;
        context.lineTo(x, liquidY + tilt * (x - width / 2) + curve);
      }
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.fill();

      context.globalAlpha = reduceMotion.matches ? 0.06 : 0.12;
      context.strokeStyle = "rgba(147, 230, 255, 0.82)";
      context.lineWidth = 1;
      context.beginPath();
      for (let x = 0; x <= width; x += Math.max(14, width / 60)) {
        const normalized = x / width;
        const curve = Math.sin(normalized * Math.PI * 2.4 + state.wave * 9) * waveAmplitude;
        const y = liquidY + tilt * (x - width / 2) + curve;
        if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.stroke();

      context.globalAlpha = reduceMotion.matches ? 0.018 : 0.035;
      const reflection = context.createLinearGradient(0, liquidY, width, liquidY + liquidHeight);
      reflection.addColorStop(0, "rgba(125, 211, 252, 0)");
      reflection.addColorStop(0.5, "rgba(186, 230, 253, 0.78)");
      reflection.addColorStop(1, "rgba(45, 212, 191, 0)");
      context.fillStyle = reflection;
      context.fillRect(width * 0.15, liquidY + height * 0.08, width * 0.7, 1.5);
      context.restore();

      frame = window.requestAnimationFrame(draw);
    };

    const onVisibilityChange = () => {
      if (document.hidden && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden && !frame) {
        lastTime = performance.now();
        frame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    frame = window.requestAnimationFrame(draw);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="gravity-water-canvas" aria-hidden="true" />;
}