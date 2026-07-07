"use client";

import type React from "react";

export type TransitionIntent = "default" | "work" | "back" | "section" | "menu";

export const transitionWords: Record<TransitionIntent, string> = {
  default: "SULTAN",
  work: "CASE FILE",
  back: "WORK",
  section: "STRATEGY",
  menu: "SULTAN",
};

export const transitionDurations: Record<TransitionIntent, { cover: number; reveal: number }> = {
  default: { cover: 0.58, reveal: 0.56 },
  work: { cover: 0.68, reveal: 0.62 },
  back: { cover: 0.46, reveal: 0.5 },
  section: { cover: 0.42, reveal: 0.44 },
  menu: { cover: 0.5, reveal: 0.5 },
};

export function intentForHref(href: string): TransitionIntent {
  if (href.includes("/work/")) return "work";
  if (href.includes("#")) return "section";
  return "default";
}

export function isModifiedNavigation(event: React.MouseEvent<HTMLElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:|sms:|whatsapp:)/i.test(href);
}
