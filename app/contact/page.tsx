import type { Metadata } from "next";
import ContactCommandCenter from "./ContactCommandCenter";

export const metadata: Metadata = {
  title: "Contact Sultan Shadi",
  description:
    "Contact Sultan Shadi, Sales & Marketing Manager in Riyadh, for marketing strategy, brand positioning, campaigns, and business development support.",
};

export default function ContactPage() {
  return <ContactCommandCenter />;
}
