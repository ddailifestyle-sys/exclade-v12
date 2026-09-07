import { createFileRoute } from "@tanstack/react-router";

import { RegistrationSection } from "@/components/RegistrationSection";

const title = "Register | EXCLADE 2K26 Registration Terminal";
const description =
  "Register for EXCLADE 2K26 at KSR College of Engineering — pick your events and lock in your slot at the registration terminal.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return <RegistrationSection />;
}
