import { Music, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import introTrack from "@/assets/tuco-tight-intro.mpeg.asset.json";

export function IntroMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const targetVolumeRef = useRef(0.2);
  const fallbackRef = useRef<{ context: AudioContext; gain: GainNode; oscillators: OscillatorNode[] } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(20);
  const [showVolume, setShowVolume] = useState(false);

  const fadeTo = (target: number) => {
    const audio = audioRef.current;
    if (fadeRef.current) window.cancelAnimationFrame(fadeRef.current);
    const fallback = fallbackRef.current;
    const start = audio ? audio.volume : fallback?.gain.gain.value ?? 0;
    const startedAt = performance.now();
    const duration = target === 0 ? 350 : 700;
    const step = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      const next = start + (target - start) * progress;
      if (audio) audio.volume = next;
      if (fallback) fallback.gain.gain.value = next;
      if (progress < 1) fadeRef.current = window.requestAnimationFrame(step);
      else fadeRef.current = null;
    };
    fadeRef.current = window.requestAnimationFrame(step);
  };

  const startFallback = async () => {
    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return false;
    const context = new AudioContextConstructor();
    await context.resume();
    const gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(context.destination);
    const oscillators = [
      [55, "sine"],
      [82.41, "sine"],
      [164.81, "triangle"],
    ].map(([frequency, type]) => {
      const oscillator = context.createOscillator();
      oscillator.type = type as OscillatorType;
      oscillator.frequency.value = frequency as number;
      oscillator.connect(gain);
      oscillator.start();
      return oscillator;
    });
    fallbackRef.current = { context, gain, oscillators };
    fadeTo(targetVolumeRef.current);
    return true;
  };

  const stopFallback = () => {
    const fallback = fallbackRef.current;
    if (!fallback) return;
    fadeTo(0);
    window.setTimeout(() => {
      fallback.oscillators.forEach((oscillator) => oscillator.stop());
      fallback.context.close();
      fallbackRef.current = null;
    }, 380);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const savedVolume = Number(window.localStorage.getItem("exclade-music-volume"));
    const initialVolume = Number.isFinite(savedVolume) ? Math.min(100, Math.max(0, savedVolume)) : 20;
    setVolume(initialVolume);
    targetVolumeRef.current = initialVolume / 100;
    audio.volume = 0;
    audio.loop = true;
    audio.preload = "auto";

    return () => {
      if (fadeRef.current) window.cancelAnimationFrame(fadeRef.current);
      stopFallback();
    };
  }, []);

  /* Start the cinematic loop on the visitor's first interaction (browsers block
     autoplay before that). Muted by choice is remembered and respected. */
  useEffect(() => {
    if (window.localStorage.getItem("exclade-music-muted") === "true") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let done = false;
    const start = async () => {
      if (done) return;
      done = true;
      remove();
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.loop = true;
        await audio.play();
        setPlaying(true);
        fadeTo(targetVolumeRef.current);
      } catch {
        setPlaying(await startFallback());
      }
    };
    const remove = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("touchstart", start);
    };
    window.addEventListener("pointerdown", start, { once: false });
    window.addEventListener("keydown", start);
    window.addEventListener("touchstart", start);
    return remove;
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        audio.loop = true;
        await audio.play();
        setPlaying(true);
        fadeTo(targetVolumeRef.current);
        window.localStorage.setItem("exclade-music-muted", "false");
      } catch {
        setPlaying(await startFallback());
        window.localStorage.setItem("exclade-music-muted", "false");
      }
    } else {
      fadeTo(0);
      window.setTimeout(() => audio.pause(), 380);
      stopFallback();
      setPlaying(false);
      window.localStorage.setItem("exclade-music-muted", "true");
    }
  };

  const updateVolume = (nextVolume: number) => {
    const normalized = nextVolume / 100;
    setVolume(nextVolume);
    targetVolumeRef.current = normalized;
    window.localStorage.setItem("exclade-music-volume", String(nextVolume));
    if (playing) fadeTo(normalized);
  };

  return (
    <div className="music-control-wrap">
      <audio ref={audioRef} {...(introTrack.url ? { src: introTrack.url } : {})} aria-hidden="true" />
      <button
        type="button"
        className={playing ? "theme-toggle is-playing" : "theme-toggle"}
        onClick={toggle}
        onContextMenu={(event) => event.preventDefault()}
        aria-expanded={showVolume}
        aria-label={playing ? "Turn sound off" : "Turn sound on"}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {playing ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </span>
        <span className="theme-toggle-label">{playing ? "SOUND ON" : "SOUND OFF"}</span>
        <span className="theme-eq" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      </button>
      <button type="button" className="music-volume-toggle" onClick={() => setShowVolume((open) => !open)} aria-label="Adjust music volume">
        <Music size={13} aria-hidden="true" />
      </button>
      {showVolume && (
        <label className="music-volume-panel">
          <span>VOLUME {volume}%</span>
          <input type="range" min="0" max="100" value={volume} onChange={(event) => updateVolume(Number(event.target.value))} />
        </label>
      )}
    </div>
  );
}
