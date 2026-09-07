import { createFileRoute } from "@tanstack/react-router";

import { ContactSection } from "@/components/ContactSection";

const title = "Contact | EXCLADE 2K26 Communication Terminal";
const description =
  "Reach the EXCLADE Association coordinators for registration support, event questions and participant guidance.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return <ContactSection />;
}
