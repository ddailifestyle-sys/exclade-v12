import { createFileRoute } from "@tanstack/react-router";

import { ChaosZone } from "@/components/ChaosZone";
import { TechnicalOperations } from "@/components/TechnicalOperations";

const title = "Events | EXCLADE 2K26 Technical & Non-Technical";
const description =
  "Every EXCLADE 2K26 event: technical operations for builders and coders, plus the Chaos Zone of non-technical challenges.";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <>
      <TechnicalOperations />
      <ChaosZone />
    </>
  );
}
