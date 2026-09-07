import { useEffect, useRef } from "react";

import introTrack from "@/assets/tuco-tight-intro.mpeg.asset.json";

export function CinematicLoader() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackRef = useRef<{
    context: AudioContext;
    gain: GainNode;
    oscillators: OscillatorNode[];
  } | null>(null);
  const startingRef = useRef(false);

  const startFallback = async () => {
    const AudioContextConstructor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return false;
    const context = new AudioContextConstructor();
    await context.resume();
    const gain = context.createGain();
    gain.gain.value = 0.55;
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
    return true;
  };

  const stopFallback = () => {
    const fallback = fallbackRef.current;
    if (!fallback) return;
    fallback.oscillators.forEach((oscillator) => oscillator.stop());
    fallback.context.close();
    fallbackRef.current = null;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.55;
    audio.loop = true;
    let cancelled = false;

    const startOnce = (allowFallback = false) => {
      if (cancelled || startingRef.current || !audio.paused || audio.ended) return;
      startingRef.current = true;
      const playback = introTrack.url
        ? audio
            .play()
            .then(() => true)
            .catch(() => (allowFallback ? startFallback() : false))
        : startFallback();
      playback
        .then(() => {
          startingRef.current = false;
          if (audio.paused) return;
          window.removeEventListener("pointerdown", onGesture);
          window.removeEventListener("keydown", onGesture);
        })
        .catch(() => {
          startingRef.current = false;
        });
    };

    const onGesture = () => startOnce(true);
    startOnce();
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);

    return () => {
      cancelled = true;
      audio.pause();
      audio.currentTime = 0;
      stopFallback();
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  return (
    <div className="loader-screen" role="dialog" aria-label="EXCLADE 2K26 introduction">
      <audio
        ref={audioRef}
        {...(introTrack.url ? { src: introTrack.url } : {})}
        preload="auto"
        aria-hidden="true"
      />
      <div className="loader-noise" aria-hidden="true" />
      <div className="loader-dust loader-dust-one" aria-hidden="true" />
      <div className="loader-dust loader-dust-two" aria-hidden="true" />
      <div className="loader-content">
        <div className="loader-mark">E</div>
        <p className="loader-line loader-line-one">KSR COLLEGE OF ENGINEERING</p>
        <p className="loader-line loader-line-two">DEPARTMENT OF CSE (IoT)</p>
        <div className="loader-title">
          <span>EXCLADE</span>
          <span>2K26</span>
        </div>
        <p className="loader-caption">THE SYMPOSIUM BEGINS</p>
      </div>
    </div>
  );
}
