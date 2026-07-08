"use client";

/**
 * OrbitClients — desktop (lg+) client constellation. Mounted only via
 * ClientsShowcase, which serves a static grid below 1024px and under
 * prefers-reduced-motion, so this file can assume a large, motion-friendly
 * viewport. One rAF loop writes transform/opacity (plus band-quantized
 * z-index) imperatively; it pauses offscreen, on hidden tabs, and during
 * heavy route/section transitions.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import type { MediaItem } from "@/lib/manifest/types";
import OrbitClientCard from "./OrbitClientCard";
import styles from "./OrbitClients.module.css";
import {
  useMediaQuery,
  usePrefersReducedMotion,
  COARSE_POINTER_QUERY,
} from "@/lib/motion/reducedMotion";
import {
  isHeavyTransitionActive,
  onHeavyTransitionChange,
} from "@/lib/motion/motionState";

const TAU = Math.PI * 2;

const RINGS = [
  { key: "inner", count: 5, x: 0.23, y: 0.13, speed: 0.36, dir: 1, tilt: -10 },
  { key: "middle", count: 7, x: 0.34, y: 0.2, speed: 0.24, dir: -1, tilt: -13 },
  { key: "outer", count: 8, x: 0.45, y: 0.28, speed: 0.17, dir: 1, tilt: -16 },
] as const;

type OrbitItem = {
  logo: MediaItem;
  index: number;
  label: string;
  ring: number;
  angle: number;
  phase: number;
};

type ItemMotion = {
  angle: number;
  hover: number;
  mx: number;
  my: number;
  targetMx: number;
  targetMy: number;
  /** Last written z-index (quantized) — avoids redundant per-frame style writes. */
  z: number;
};

function labelFromLogo(logo: MediaItem, index: number) {
  const readable = logo.title && logo.title !== "Client" ? logo.title : "";
  return readable || `Partner ${String(index + 1).padStart(2, "0")}`;
}

function buildOrbitItems(logos: MediaItem[]): OrbitItem[] {
  let cursor = 0;
  return RINGS.flatMap((ring, ringIndex) => {
    const remaining = logos.length - cursor;
    const count = ringIndex === RINGS.length - 1 ? remaining : Math.min(ring.count, remaining);
    return Array.from({ length: Math.max(0, count) }, (_, inRingIndex) => {
      const logo = logos[cursor];
      const angle = (inRingIndex / Math.max(1, count)) * TAU + ringIndex * 0.42;
      const item = {
        logo,
        index: cursor,
        label: labelFromLogo(logo, cursor),
        ring: ringIndex,
        angle,
        phase: (cursor % 5) * 0.7,
      };
      cursor += 1;
      return item;
    });
  });
}

export default function OrbitClients({ logos }: { logos: MediaItem[] }) {
  const items = useMemo(() => buildOrbitItems(logos), [logos]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const motionRef = useRef<ItemMotion[]>([]);
  const rafRef = useRef<number | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lastTimeRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const coarsePointerRef = useRef(false);
  const visibleRef = useRef(true);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeRing, setActiveRing] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useMediaQuery(COARSE_POINTER_QUERY);

  useEffect(() => {
    motionRef.current = items.map((item) => ({
      angle: item.angle,
      hover: 0,
      mx: 0,
      my: 0,
      targetMx: 0,
      targetMy: 0,
      z: -1,
    }));
    cardRefs.current = cardRefs.current.slice(0, items.length);
  }, [items]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
    setActiveRing(activeIndex === null ? null : items[activeIndex]?.ring ?? null);

    motionRef.current.forEach((motion, index) => {
      gsap.killTweensOf(motion);
      gsap.to(motion, {
        hover: activeIndex === index ? 1 : 0,
        duration: activeIndex === index ? 0.42 : 0.26,
        ease: activeIndex === index ? "back.out(1.7)" : "power3.out",
      });
    });
  }, [activeIndex, items]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    coarsePointerRef.current = coarsePointer;
  }, [reducedMotion, coarsePointer]);

  // No autoplay interval: this component only mounts on lg+ (ClientsShowcase
  // renders the static grid below that and under reduced motion), so hover /
  // focus drive the active card. Coarse-pointer desktops simply tap.

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !items.length) return;

    // Cache scene size (avoids per-frame layout reads).
    const size = { width: scene.offsetWidth, height: scene.offsetHeight };
    const resizeObserver = new ResizeObserver(([entry]) => {
      size.width = entry.contentRect.width;
      size.height = entry.contentRect.height;
    });
    resizeObserver.observe(scene);

    const render = (time: number) => {
      const width = Math.max(320, size.width);
      const height = Math.max(420, size.height);
      const minSide = Math.min(width, height);
      const elapsed = lastTimeRef.current === null ? 16 : Math.min(48, time - lastTimeRef.current);
      lastTimeRef.current = time;
      const dt = elapsed / 1000;
      const active = activeIndexRef.current;
      const shouldOrbit = visibleRef.current && !reducedMotionRef.current && active === null;

      pointerRef.current.x += (pointerRef.current.tx - pointerRef.current.x) * 0.06;
      pointerRef.current.y += (pointerRef.current.ty - pointerRef.current.y) * 0.06;

      items.forEach((item, index) => {
        const el = cardRefs.current[index];
        const motion = motionRef.current[index];
        if (!el || !motion) return;

        const ring = RINGS[item.ring];
        if (shouldOrbit) {
          motion.angle += ring.speed * ring.dir * dt;
        }

        motion.mx += (motion.targetMx - motion.mx) * 0.22;
        motion.my += (motion.targetMy - motion.my) * 0.22;

        const angle = reducedMotionRef.current ? item.angle : motion.angle;
        const radiusX = Math.min(width * ring.x, minSide * (0.32 + item.ring * 0.1));
        const radiusY = Math.min(height * ring.y, minSide * (0.18 + item.ring * 0.05));
        const orbitX = Math.cos(angle) * radiusX;
        const orbitY = Math.sin(angle) * radiusY;
        const depth = (Math.sin(angle) + 1) / 2;
        const breathe =
          reducedMotionRef.current || active !== null ? 0 : Math.sin(time * 0.001 + item.phase) * 5;
        const parallaxX = pointerRef.current.x * (14 + item.ring * 7) * (1 - depth * 0.45);
        const parallaxY = pointerRef.current.y * (10 + item.ring * 5) * (1 - depth * 0.4);
        const hover = motion.hover;
        const scale = 0.66 + depth * 0.4 + hover * 0.5;
        // Depth reads through scale + opacity only. The old per-frame
        // blur() filter writes forced constant repaints of 20 cards and
        // were the section's main desktop cost — removed.
        const opacity = 0.46 + depth * 0.48 + hover * 0.18;
        const lift = hover * -18;
        const x = orbitX + parallaxX + motion.mx;
        const y = orbitY + parallaxY + breathe + lift;

        el.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(
          2
        )}px), 0) scale(${scale.toFixed(3)})`;
        el.style.opacity = String(Math.min(1, opacity));
        // Quantized z-index, written only when its band actually changes.
        const z = 20 + Math.round(depth * 8) * 10 + (hover > 0.5 ? 200 : 0);
        if (z !== motion.z) {
          motion.z = z;
          el.style.zIndex = String(z);
        }
      });

      rafRef.current = window.requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (rafRef.current !== null) return;
      lastTimeRef.current = null;
      rafRef.current = window.requestAnimationFrame(render);
    };
    const stopLoop = () => {
      if (rafRef.current === null) return;
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };

    // Pause the RAF loop entirely while offscreen, and don't (re)start it
    // while a boundary/route overlay is mid-transition.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !isHeavyTransitionActive() && !document.hidden) startLoop();
        else if (!entry.isIntersecting) stopLoop();
      },
      { threshold: 0.08 }
    );
    observer.observe(scene);

    // Pause the orbit during heavy transitions; resume once the cover clears.
    const offTransition = onHeavyTransitionChange((active) => {
      if (active) stopLoop();
      else if (visibleRef.current && !document.hidden) startLoop();
    });

    // Pause when the tab is hidden (don't rely on browser rAF throttling).
    const onVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else if (visibleRef.current && !isHeavyTransitionActive()) startLoop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      offTransition();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      stopLoop();
      gsap.killTweensOf(motionRef.current);
    };
  }, [items]);

  const setCardRef = useCallback(
    (index: number) => (node: HTMLButtonElement | null) => {
      cardRefs.current[index] = node;
    },
    []
  );

  const activate = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const clearActive = useCallback(() => {
    if (coarsePointerRef.current) return;
    setActiveIndex(null);
  }, []);

  const handleScenePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerRef.current.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }, []);

  const handleCardPointerMove = useCallback(
    (index: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
      const motion = motionRef.current[index];
      if (!motion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      motion.targetMx = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
      motion.targetMy = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
    },
    []
  );

  const resetMagnet = useCallback((index: number) => {
    const motion = motionRef.current[index];
    if (!motion) return;
    motion.targetMx = 0;
    motion.targetMy = 0;
  }, []);

  if (!items.length) return null;

  const activeItem = activeIndex === null ? null : items[activeIndex] ?? null;

  return (
    <div
      ref={sceneRef}
      className={styles.scene}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      onPointerMove={handleScenePointerMove}
      onPointerLeave={() => {
        pointerRef.current.tx = 0;
        pointerRef.current.ty = 0;
      }}
    >
      <div className={styles.watermark} aria-hidden="true">
        CLIENTS
      </div>
      <div className={styles.depthGlow} aria-hidden="true" />
      <div className={styles.dashedCircle} aria-hidden="true" />

      <div className={styles.rings} aria-hidden="true">
        {RINGS.map((ring, index) => (
          <span
            key={ring.key}
            className={styles.ring}
            data-active={activeRing === index ? "true" : "false"}
            style={
              {
                "--ring-x": `${ring.x * 200}%`,
                "--ring-y": `${ring.y * 230}%`,
                "--ring-tilt": `${ring.tilt}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.orbitPlane} aria-label="Sultan Shadi client constellation">
        {items.map((item) => (
          <OrbitClientCard
            key={`${item.logo.src}-${item.index}`}
            ref={setCardRef(item.index)}
            logo={item.logo}
            index={item.index}
            active={activeIndex === item.index}
            label={item.label}
            ring={item.ring}
            onEnter={() => activate(item.index)}
            onLeave={() => {
              resetMagnet(item.index);
              clearActive();
            }}
            onSelect={() => activate(item.index)}
            onPointerMove={handleCardPointerMove(item.index)}
          />
        ))}
      </div>

      <aside className={styles.infoPanel} data-visible={activeItem ? "true" : "false"}>
        <span className={styles.infoKicker}>
          {activeItem ? `Orbit ${activeItem.ring + 1}` : "Partner"}
        </span>
        <strong>{activeItem?.label ?? "Client constellation"}</strong>
        <p>
          {activeItem
            ? "Selected partner in Sultan Shadi's client orbit."
            : "Hover or focus a logo to pause the orbit and bring it forward."}
        </p>
      </aside>
    </div>
  );
}
