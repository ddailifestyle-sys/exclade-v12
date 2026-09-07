import { createFileRoute } from "@tanstack/react-router";

import { AboutSection } from "@/components/AboutSection";
import { LabPreview } from "@/components/LabPreview";

const title = "About EXCLADE 2K26 | The Lab Behind The Symposium";
const description =
  "What EXCLADE 2K26 is, who runs it, and how the CSE (IoT) lab at KSR College of Engineering turns ideas into field-ready systems.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <AboutSection />
      <LabPreview />
    </>
  );
}
