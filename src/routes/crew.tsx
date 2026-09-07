import { createFileRoute } from "@tanstack/react-router";

import { CrewSection } from "@/components/CrewSection";

const title = "The Crew | EXCLADE 2K26 Organising Team";
const description =
  "Meet the EXCLADE 2K26 crew — the students and staff of CSE (IoT) running every operation at KSR College of Engineering.";

export const Route = createFileRoute("/crew")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CrewPage,
});

function CrewPage() {
  return <CrewSection />;
}
