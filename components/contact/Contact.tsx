import { Mail, MessageCircle, Phone, Linkedin } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import { profile, emailHref, whatsappHref } from "@/lib/data/profile";

export default function Contact() {
  return (
    <Section id="contact" className="pb-32">
      <div className="relative overflow-hidden rounded-[2rem] border border-steel-400/25 bg-gradient-to-br from-surface-2 to-ink px-6 py-20 md:px-16 md:py-28">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-champagne/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-steel/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="eyebrow">10 — Contact</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-2 mt-6 text-4xl md:text-6xl">
              Let&rsquo;s build a brand presence
              <br />
              <span className="text-champagne">that converts.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="lede mx-auto mt-7 max-w-2xl">
              Available for marketing leadership, branding and campaign work across
              Jordan and Saudi Arabia. Let&rsquo;s talk about what you&rsquo;re building.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <a href={emailHref} className="btn-primary">
                <Mail className="h-4 w-4" aria-hidden /> Email
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
              </a>
              {profile.linkedin ? (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn
                </a>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-14 flex flex-col items-center justify-center gap-x-10 gap-y-3 text-sm text-haze/70 sm:flex-row">
              <a
                href={`tel:${profile.phoneJordan}`}
                className="flex items-center gap-2 hover:text-champagne"
              >
                <Phone className="h-4 w-4" aria-hidden /> {profile.phoneJordan} · Jordan
              </a>
              <a
                href={`tel:${profile.phoneSaudi}`}
                className="flex items-center gap-2 hover:text-champagne"
              >
                <Phone className="h-4 w-4" aria-hidden /> {profile.phoneSaudi} · KSA
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
