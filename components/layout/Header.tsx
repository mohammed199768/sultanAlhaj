"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { profile } from "@/lib/data/profile";
import TransitionLink from "@/components/transitions/TransitionLink";

export default function Header({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[70] transition-colors duration-500",
        scrolled && !open ? "bg-ink/70 backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div className="shell flex h-20 items-center justify-between">
        <TransitionLink
          href="/"
          className="group flex items-center gap-3"
          aria-label={`${profile.name} home`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne/40 font-display text-sm font-bold text-champagne">
            S
          </span>
          <span className="hidden font-display text-sm font-semibold uppercase tracking-[0.2em] text-mist-300 sm:block">
            {profile.name}
          </span>
        </TransitionLink>

        <div className="flex items-center gap-6">
          <TransitionLink
            href="/contact"
            className="hidden font-display text-[0.65rem] uppercase tracking-[0.25em] text-mist transition-colors hover:text-champagne md:block"
          >
            Let&rsquo;s talk
          </TransitionLink>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="group flex items-center gap-3"
          >
            <span className="font-display text-[0.65rem] uppercase tracking-[0.25em] text-mist-300">
              {open ? "Close" : "Menu"}
            </span>
            <span className="relative flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-steel-400/45 transition-colors group-hover:border-champagne">
              <span
                className={cn(
                  "h-px w-4 bg-mist-300 transition-all duration-300",
                  open && "translate-y-[3px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "h-px w-4 bg-mist-300 transition-all duration-300",
                  open && "-translate-y-[3px] -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
