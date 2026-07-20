"use client";

import { Mail, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  cvDownloadFileName,
  cvDownloadHref,
  emailHref,
  whatsappHref,
} from "@/lib/data/profile";

export default function FloatingCvButton() {
  const pathname = usePathname();
  const isCv = pathname === "/cv";

  return (
    <div
      className={`${isCv ? "hidden" : "flex"} fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 z-[50] flex-col gap-2 md:bottom-auto md:left-5 md:top-1/2 md:-translate-y-1/2`}
    >
      <a
        href={cvDownloadHref}
        download={cvDownloadFileName}
        aria-label="Download Sultan Shadi CV"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne/40 bg-ink/74 font-display text-[0.64rem] font-bold uppercase tracking-[0.14em] text-champagne shadow-2xl shadow-navy-900/45 backdrop-blur-md transition duration-200 hover:scale-[1.04] hover:border-champagne hover:bg-champagne hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      >
        CV
      </a>
      <a
        href={emailHref}
        aria-label="Email Sultan Shadi"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-steel-400/28 bg-ink/74 text-champagne shadow-2xl shadow-navy-900/45 backdrop-blur-md transition duration-200 hover:scale-[1.04] hover:border-champagne hover:bg-champagne hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      >
        <Mail className="h-4 w-4" aria-hidden />
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Sultan Shadi"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-steel-400/28 bg-ink/74 text-champagne shadow-2xl shadow-navy-900/45 backdrop-blur-md transition duration-200 hover:scale-[1.04] hover:border-champagne hover:bg-champagne hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}
