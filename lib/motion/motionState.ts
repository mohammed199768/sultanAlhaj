"use client";

/**
 * Central "heavy transition" state shared by the route overlay and section
 * boundaries. While active: child reveals wait, continuous loops pause, and
 * no second major transition layer may start. Mirrors to
 * <html data-transitioning> for CSS-level guards.
 */

type Listener = (active: boolean) => void;

let activeCount = 0;
const listeners = new Set<Listener>();

export function isHeavyTransitionActive(): boolean {
  return activeCount > 0;
}

export function beginHeavyTransition(): void {
  activeCount += 1;
  if (activeCount === 1) {
    document.documentElement.setAttribute("data-transitioning", "");
    listeners.forEach((l) => l(true));
  }
}

export function endHeavyTransition(): void {
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount === 0) {
    document.documentElement.removeAttribute("data-transitioning");
    listeners.forEach((l) => l(false));
  }
}

export function onHeavyTransitionChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
