import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import {
  DEFAULT_TUNING,
  getEnvironmentTuning,
  resetEnvironmentTuning,
  setEnvironmentTuning,
  subscribeEnvironmentTuning,
  type EnvironmentTuning,
} from "./tuning";

const SHORTCUT = "e";

export function EnvironmentDevPanel() {
  const [open, setOpen] = useState(false);
  const [tuning, setTuning] = useState<EnvironmentTuning>(() => getEnvironmentTuning());

  useEffect(() => {
    const unsubscribe = subscribeEnvironmentTuning(setTuning);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== SHORTCUT || !event.shiftKey || !(event.ctrlKey || event.metaKey)) {
        return;
      }
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!open) return null;

  const update = (key: keyof EnvironmentTuning, values: number[]) => {
    const value = values[0];
    if (value === undefined) return;
    setEnvironmentTuning({ [key]: value });
  };

  return (
    <aside className="environment-dev-panel" aria-label="Environment developer panel">
      <div className="environment-dev-panel__header">
        <div>
          <p className="environment-dev-panel__eyebrow">DEVELOPER / ATMOSPHERE</p>
          <h2>Environment tuner</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close environment tuner">
          ×
        </Button>
      </div>

      <div className="environment-dev-panel__control">
        <div className="environment-dev-panel__label">
          <span>Wind strength</span>
          <output>{tuning.windStrength.toFixed(2)}</output>
        </div>
        <Slider
          min={0}
          max={2}
          step={0.05}
          value={[tuning.windStrength]}
          onValueChange={(values) => update("windStrength", values)}
          aria-label="Wind strength"
        />
      </div>

      <div className="environment-dev-panel__control">
        <div className="environment-dev-panel__label">
          <span>Particle count</span>
          <output>{Math.round(tuning.particleScale * 100)}%</output>
        </div>
        <Slider
          min={0}
          max={1.5}
          step={0.05}
          value={[tuning.particleScale]}
          onValueChange={(values) => update("particleScale", values)}
          aria-label="Particle count"
        />
      </div>

      <div className="environment-dev-panel__control">
        <div className="environment-dev-panel__label">
          <span>Dust opacity</span>
          <output>{Math.round(tuning.dustOpacity * 100)}%</output>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={[tuning.dustOpacity]}
          onValueChange={(values) => update("dustOpacity", values)}
          aria-label="Dust opacity"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setEnvironmentTuning(DEFAULT_TUNING)}
        className="environment-dev-panel__reset"
      >
        Reset atmosphere
      </Button>

      <p className="environment-dev-panel__hint">Ctrl/⌘ + Shift + E to hide</p>
    </aside>
  );
}

export function EnvironmentDevPanelPlaceholder() {
  resetEnvironmentTuning();
  return null;
}