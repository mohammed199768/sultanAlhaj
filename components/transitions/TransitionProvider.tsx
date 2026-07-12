"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion/gsap";
import {
  intentForHref,
  transitionDurations,
  transitionWords,
  type TransitionIntent,
} from "@/lib/motion/pageTransitions";
import PageTransitionOverlay, {
  type PageTransitionOverlayRefs,
} from "./PageTransitionOverlay";
import {
  beginHeavyTransition,
  endHeavyTransition,
} from "@/lib/motion/motionState";

interface NavigateOptions {
  intent?: TransitionIntent;
  label?: string;
  replace?: boolean;
  scroll?: boolean;
}

interface PendingNavigation {
  href: string;
  path: string;
  intent: TransitionIntent;
  hash: string;
}

type ReadyOverlayRefs = {
  [K in keyof PageTransitionOverlayRefs]: NonNullable<PageTransitionOverlayRefs[K]>;
};

interface TransitionContextValue {
  isTransitioning: boolean;
  navigate: (href: string, options?: NavigateOptions) => Promise<void>;
  playMenuPulse: (open: boolean) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

function splitHref(href: string) {
  const [pathWithQuery, hash = ""] = href.split("#");
  return {
    path: pathWithQuery || window.location.pathname,
    hash: hash ? `#${hash}` : "",
  };
}

function isSameRouteHash(href: string, pathname: string) {
  if (!href.includes("#")) return false;
  const { path } = splitHref(href);
  return path === "" || path === pathname;
}

export function usePageTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("usePageTransition must be used inside TransitionProvider");
  }
  return context;
}

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<PageTransitionOverlayRefs>(null);
  const pendingRef = useRef<PendingNavigation | null>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [label, setLabel] = useState("SULTAN");
  const [historyNavigationId, setHistoryNavigationId] = useState(0);

  // Level 1 (route overlay) owns the shared heavy-transition state while it
  // runs: section boundaries can't fire and child reveals wait.
  useEffect(() => {
    if (!isTransitioning) return;
    beginHeavyTransition();
    return () => endHeavyTransition();
  }, [isTransitioning]);

  const killTimeline = useCallback(() => {
    activeTimelineRef.current?.kill();
    activeTimelineRef.current = null;
  }, []);

  const refsReady = useCallback((): ReadyOverlayRefs | null => {
    const refs = overlayRef.current;
    if (
      !refs?.root ||
      !refs.bronze ||
      !refs.navy ||
      !refs.svg ||
      !refs.word ||
      !refs.caption ||
      !refs.line ||
      !refs.edge
    ) {
      return null;
    }
    return refs as ReadyOverlayRefs;
  }, []);

  const playCover = useCallback(
    (intent: TransitionIntent, nextLabel?: string) => {
      registerGsap();
      const refs = refsReady();
      if (!refs) return Promise.resolve();

      killTimeline();
      setIsTransitioning(true);
      const activeLabel = nextLabel || transitionWords[intent];
      setLabel(activeLabel);
      refs.word.textContent = activeLabel;

      if (prefersReducedMotion()) {
        gsap.set(refs.root, { opacity: 1, visibility: "visible", pointerEvents: "auto" });
        return new Promise<void>((resolve) => {
          window.setTimeout(resolve, 80);
        });
      }

      const duration = transitionDurations[intent].cover;
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          activeTimelineRef.current = null;
        },
      });
      activeTimelineRef.current = tl;

      gsap.set(refs.root, { autoAlpha: 1, visibility: "visible", pointerEvents: "auto" });
      gsap.set(refs.bronze, { clipPath: "inset(100% 0 0 0)" });
      gsap.set(refs.navy, { clipPath: "inset(100% 0 0 0)" });
      gsap.set(refs.svg, { yPercent: 42, scaleY: 0.7, opacity: 0 });
      gsap.set(refs.word, { yPercent: 42, opacity: 0, scale: 0.96 });
      gsap.set(refs.caption, { y: 18, opacity: 0 });
      gsap.set(refs.line, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(refs.edge, { scaleY: 0, transformOrigin: "top center" });

      tl.to(refs.bronze, { clipPath: "inset(0% 0 0 0)", duration }, 0)
        .to(refs.navy, { clipPath: "inset(0% 0 0 0)", duration: duration * 0.9 }, 0.08)
        .to(refs.svg, { yPercent: 0, scaleY: 1, opacity: 1, duration: duration * 0.85 }, 0.1)
        .to(refs.edge, { scaleY: 1, duration: duration * 0.62, ease: "power2.out" }, 0.1)
        .to(refs.line, { scaleX: 1, duration: duration * 0.55, ease: "power2.out" }, 0.18)
        .to(
          refs.word,
          { yPercent: 0, opacity: 1, scale: 1, duration: duration * 0.72, ease: "power3.out" },
          0.2
        )
        .to(refs.caption, { y: 0, opacity: 1, duration: duration * 0.45 }, 0.28);

      return new Promise<void>((resolve) => tl.call(resolve));
    },
    [killTimeline, refsReady]
  );

  const playReveal = useCallback(
    (intent: TransitionIntent = "default") => {
      registerGsap();
      const refs = refsReady();
      if (!refs) {
        setIsTransitioning(false);
        return Promise.resolve();
      }

      killTimeline();

      if (prefersReducedMotion()) {
        return new Promise<void>((resolve) => {
          gsap.set(refs.root, { opacity: 0, visibility: "hidden", pointerEvents: "none" });
          setIsTransitioning(false);
          window.setTimeout(resolve, 80);
        });
      }

      const duration = transitionDurations[intent].reveal;
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          gsap.set(refs.root, { autoAlpha: 0, visibility: "hidden", pointerEvents: "none" });
          activeTimelineRef.current = null;
          setIsTransitioning(false);
        },
      });
      activeTimelineRef.current = tl;

      tl.to(refs.word, { yPercent: -28, opacity: 0, duration: duration * 0.45, ease: "power2.in" }, 0)
        .to(refs.caption, { y: -12, opacity: 0, duration: duration * 0.32 }, 0)
        .to(refs.line, { scaleX: 0, transformOrigin: "right center", duration: duration * 0.42 }, 0.05)
        .to(refs.svg, { yPercent: -28, opacity: 0, duration: duration * 0.55 }, 0.08)
        .to(refs.navy, { clipPath: "inset(0 0 100% 0)", duration }, 0.12)
        .to(refs.bronze, { clipPath: "inset(0 0 100% 0)", duration: duration * 0.82 }, 0.2)
        .to(refs.edge, { scaleY: 0, transformOrigin: "bottom center", duration: duration * 0.45 }, 0.1);

      return new Promise<void>((resolve) => tl.call(resolve));
    },
    [killTimeline, refsReady]
  );

  const scrollToHash = useCallback(async (hash: string) => {
    if (!hash) return;

    if (
      window.location.pathname === "/" &&
      document.documentElement.dataset.homeLayoutReady !== "true"
    ) {
      await new Promise<void>((resolve) => {
        window.addEventListener("sultan:home-layout-ready", () => resolve(), {
          once: true,
        });
      });
    }

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });

    ScrollTrigger.refresh();
    window.dispatchEvent(new CustomEvent("sultan:scroll-to", { detail: { target: hash } }));
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ block: "start", behavior: "auto" });
  }, []);

  const navigate = useCallback(
    async (href: string, options: NavigateOptions = {}) => {
      if (isTransitioning) return;

      const intent = options.intent ?? intentForHref(href);
      const nextLabel = options.label ?? transitionWords[intent];
      const { path, hash } = splitHref(href);

      if (isSameRouteHash(href, pathname)) {
        await playCover("section", nextLabel);
        if (hash) {
          router.push(href, { scroll: false });
          await scrollToHash(hash);
        }
        ScrollTrigger.refresh();
        await playReveal("section");
        return;
      }

      pendingRef.current = { href, path: path.split("?")[0], intent, hash };
      await playCover(intent, nextLabel);

      if (options.replace) router.replace(href, { scroll: options.scroll ?? false });
      else router.push(href, { scroll: options.scroll ?? false });

      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = window.setTimeout(() => {
        if (!pendingRef.current) return;
        pendingRef.current = null;
        playReveal(intent);
      }, 1800);
    },
    [isTransitioning, pathname, playCover, playReveal, router, scrollToHash]
  );

  const playMenuPulse = useCallback(
    (open: boolean) => {
      const refs = refsReady();
      if (!refs || prefersReducedMotion()) return;
      gsap.fromTo(
        refs.edge,
        { scaleY: 0, transformOrigin: open ? "top center" : "bottom center", opacity: 1 },
        { scaleY: 1, duration: 0.28, yoyo: true, repeat: 1, ease: "power2.inOut" }
      );
    },
    [refsReady]
  );

  useEffect(() => {
    const pending = pendingRef.current;
    const restoredHash = pathname === "/" ? window.location.hash : "";
    if (!pending && !restoredHash) return;
    if (pending && pending.path !== pathname) return;

    if (pending) pendingRef.current = null;
    if (pending && fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    let cancelled = false;
    const restore = async () => {
      const hash = pending?.hash || restoredHash;
      if (hash) await scrollToHash(hash);
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      if (cancelled) return;

      ScrollTrigger.refresh();
      window.dispatchEvent(new CustomEvent("sultan:route-transition-complete"));
      if (pending) await playReveal(pending.intent);
    };
    void restore();

    return () => {
      cancelled = true;
    };
  }, [historyNavigationId, pathname, playReveal, scrollToHash]);

  useEffect(() => {
    registerGsap();
    const refs = refsReady();
    if (!refs) return;

    if (prefersReducedMotion()) {
      gsap.set(refs.root, { autoAlpha: 0, visibility: "hidden", pointerEvents: "none" });
      return;
    }

    setLabel("SULTAN");
    refs.word.textContent = "SULTAN";
    gsap.set(refs.root, { autoAlpha: 1, visibility: "visible", pointerEvents: "auto" });
    gsap.set(refs.bronze, { clipPath: "inset(0 0 0 0)" });
    gsap.set(refs.navy, { clipPath: "inset(0 0 0 0)" });
    gsap.set(refs.svg, { yPercent: 0, opacity: 1 });
    gsap.set(refs.word, { yPercent: 0, opacity: 1, scale: 1 });
    gsap.set(refs.caption, { y: 0, opacity: 1 });
    gsap.set(refs.line, { scaleX: 1 });
    gsap.set(refs.edge, { scaleY: 1 });

    const timer = window.setTimeout(() => {
      playReveal("default");
    }, 220);

    const onPopState = () => {
      if (prefersReducedMotion()) return;
      pendingRef.current = {
        href: window.location.href,
        path: window.location.pathname,
        intent: "back",
        hash: window.location.hash,
      };
      setHistoryNavigationId((value) => value + 1);
      playCover("back", transitionWords.back);
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("popstate", onPopState);
      killTimeline();
    };
  }, [killTimeline, playCover, playReveal, refsReady]);

  const value = useMemo(
    () => ({ isTransitioning, navigate, playMenuPulse }),
    [isTransitioning, navigate, playMenuPulse]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <PageTransitionOverlay ref={overlayRef} label={label} />
    </TransitionContext.Provider>
  );
}
