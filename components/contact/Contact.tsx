import { ArrowUpRight } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import TransitionLink from "@/components/transitions/TransitionLink";

const ctaChips = [
  "Brand positioning",
  "Campaign management",
  "Sales & business development",
];

export default function Contact() {
  return (
    <Section id="contact" className="pb-32">
      <div className="relative overflow-hidden rounded-[2rem] border border-steel-400/25 bg-[linear-gradient(135deg,rgba(0,4,25,0.94),rgba(7,23,57,0.98)_48%,rgba(24,40,60,0.92))] px-6 py-16 shadow-2xl shadow-navy-900/35 md:px-16 md:py-20">
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-4xl">
            <Reveal>
              <span className="eyebrow">10 - Contact</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-2 mt-6 text-4xl md:text-6xl">
                Ready to build
                <br />
                <span className="text-champagne">the next campaign?</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="lede mt-7 max-w-3xl">
                Connect with Sultan for brand positioning, marketing strategy,
                campaign management, content, and business development support.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-8 flex flex-wrap gap-2">
                {ctaChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-steel-400/25 bg-mist-300/[0.055] px-3 py-1.5 font-display text-[0.6rem] uppercase tracking-[0.16em] text-haze/78"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.28}>
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <TransitionLink
                href="/contact"
                className="btn-primary min-h-12 px-7"
                aria-label="Contact Sultan"
              >
                Contact Sultan
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </TransitionLink>
              <p className="max-w-xs text-left text-sm leading-6 text-haze/70 lg:text-right">
                Direct email, WhatsApp, phone, and a focused message form are on
                the contact page.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
