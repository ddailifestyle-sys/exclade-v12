import { createLazyFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { CountdownStrip } from "@/components/CountdownStrip";
import { CrewSection } from "@/components/CrewSection";
import { HeroSection } from "@/components/HeroSection";
import { LabEntryTransition } from "@/components/LabEntryTransition";
import { LabIntro } from "@/components/LabIntro";
import { LabDashboard } from "@/components/LabDashboard";
import { RegistrationSection } from "@/components/RegistrationSection";

export const Route = createLazyFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [showGate, setShowGate] = useState(false);

  const finishGate = useCallback(() => {
    setShowGate(false);
    document.getElementById("lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      {showGate && <LabEntryTransition onDone={finishGate} />}
      <HeroSection onEnterLab={() => setShowGate(true)} />
      <CountdownStrip />
      <LabIntro />
      <LabDashboard />
      <CrewSection />
      <RegistrationSection />
    </>
  );
}
