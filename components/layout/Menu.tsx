"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks } from "@/lib/data/nav";
import { profile, emailHref, whatsappHref } from "@/lib/data/profile";
import TransitionLink from "@/components/transitions/TransitionLink";

const easeCinema = [0.16, 1, 0.3, 1] as const;

/** Fullscreen cinematic overlay menu (Theodore-inspired). */
export default function Menu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Lock scroll + escape-to-close while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[65] flex flex-col overflow-y-auto bg-ink"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: easeCinema }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          {/* Ambient accent glows */}
          <div className="pointer-events-none absolute -right-40 top-0 h-[40rem] w-[40rem] rounded-full bg-bronze/10 blur-[120px]" />
          <div className="pointer-events-none absolute -left-40 bottom-0 h-[36rem] w-[36rem] rounded-full bg-steel/10 blur-[120px]" />

          <div className="shell flex min-h-full flex-1 flex-col justify-center py-28">
            <nav aria-label="Primary">
              <ul className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.25 + i * 0.05,
                      ease: easeCinema,
                    }}
                    className="border-b border-steel-400/15"
                  >
                    <TransitionLink
                      href={link.href}
                      intent="menu"
                      label={link.label === "Work" ? "WORK" : "SULTAN"}
                      onBeforeNavigate={onClose}
                      className="group flex items-baseline gap-5 py-3 md:py-4"
                    >
                      <span className="font-display text-xs text-champagne/60">
                        {link.index}
                      </span>
                      <span className="font-display text-3xl font-semibold uppercase tracking-tight text-mist transition-all duration-500 group-hover:translate-x-3 group-hover:text-mist-300 sm:text-4xl md:text-5xl">
                        {link.label}
                      </span>
                    </TransitionLink>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-14 flex flex-wrap gap-x-10 gap-y-3 font-display text-[0.65rem] uppercase tracking-[0.25em] text-haze/70"
            >
              <a href={emailHref} className="hover:text-champagne">
                {profile.email}
              </a>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-champagne">
                WhatsApp
              </a>
              <span>{profile.location}</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
