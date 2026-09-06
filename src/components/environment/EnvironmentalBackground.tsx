/**
 * EnvironmentalBackground — composes the decorative desert-laboratory layer:
 * atmosphere tint, cinematic lighting, dust haze and the sand simulation.
 * Sits behind all content, never intercepts pointer events.
 */
import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { atmosphere } from "./atmosphere";
import { SandCanvas } from "./SandCanvas";

export function EnvironmentalBackground() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    atmosphere.setRoute(pathname);
  }, [pathname]);

  return (
    <div className="env-layer" aria-hidden="true">
      <div className="env-atmosphere" />
      <div className="env-light env-light-warm" />
      <div className="env-light env-light-lab" />
      <div className="env-haze" />
      <SandCanvas />
      <div className="env-vignette" />
    </div>
  );
}
