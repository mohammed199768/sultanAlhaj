import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
// Breakpoint-aware showcase: static grid below lg / reduced motion,
// lazily-loaded orbit constellation on desktop.
import ClientsShowcase from "./ClientsShowcase";
import { getClientLogos } from "@/lib/manifest/getPortfolio";
import home from "@/content/home.json";

export default function Clients() {
  const logos = getClientLogos();
  if (!logos.length) return null;

  return (
    <Section id="clients" full className="overflow-hidden border-y border-steel-400/15 bg-mist-300/[0.015]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <Reveal>
            <span className="eyebrow">{home.clients.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-2 mt-5 text-4xl md:text-5xl">
              {home.clients.titleBefore}
              <br />
              <span className="text-champagne">{home.clients.titleAccent}</span> {home.clients.titleAfter}
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="lede mt-6 max-w-md">
              {home.clients.intro}
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-8 font-display text-5xl font-bold text-mist-300 md:text-6xl">
              {logos.length}
              <span className="ml-2 align-middle text-sm uppercase tracking-[0.2em] text-haze/50">
                {home.clients.countLabel}
              </span>
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <ClientsShowcase logos={logos} />
        </div>
      </div>
    </Section>
  );
}
