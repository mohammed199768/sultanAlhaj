import type { Metadata } from "next";
import ContactCommandCenter from "./ContactCommandCenter";
import contact from "@/content/contact.json";

export const metadata: Metadata = contact.metadata;

export default function ContactPage() {
  return <ContactCommandCenter />;
}
