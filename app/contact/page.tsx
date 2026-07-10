import type { Metadata } from "next";
import ContactCommandCenter from "./ContactCommandCenter";

export const metadata: Metadata = {
  title: "Contact Sultan Shadi",
  description:
    "Reach Sultan Shadi for marketing strategy, healthcare campaigns, brand activations, and digital growth across Jordan and Saudi markets.",
};

export default function ContactPage() {
  return <ContactCommandCenter />;
}
