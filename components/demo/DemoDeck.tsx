"use client";

import Image from "next/image";
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/thank-you/thankYou.module.css";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { cardOffset, wrapIndex } from "@/lib/demoDeck";
import { projects } from "@/lib/site";
import demo from "./demo.module.css";

/**
 * The real demo sites, in deck order: different kinds of business, so a
 * visitor can picture their own. Labels are short enough for a phone card.
 */
const deckOrder: { slug: string; label: string }[] = [
  { slug: "stitch-house", label: "Tailor, London" },
  { slug: "solvers-cleaning", label: "Cleaning" },
  { slug: "ideal-baby", label: "Baby store, Miami" },
  { slug: "removals", label: "Removals" },
  { slug: "allen-fitness", label: "Activewear" },
  { slug: "cleaning", label: "Home cleaning" },
];

const realCards = deckOrder.flatMap(({ slug, label }) => {
  const project = projects.find((item) => item.slug === slug);
  return project ? [{ ...project, label }] : [];
});

const AUTOPLAY_MS = 3500;
const SWIPE_PX = 40;

// Fixed values, so the server and the browser render the same bubbles. Sizes
// and distances are in cqi of the card.
const BUBBLES = [
  { left: "6%", size: 12, delay: 0.25, duration: 1.5, drift: -22, rise: -90 },
  { left: "20%", size: 7, delay: 0.4, duration: 1.2, drift: -10, rise: -70 },
  { left: "34%", size: 15, delay: 0.3, duration: 1.8, drift: -14, rise: -110 },
  { left: "50%", size: 6, delay: 0.5, duration: 1.1, drift: 4, rise: -64 },
  { left: "62%", size: 13, delay: 0.22, duration: 1.7, drift: 16, rise: -100 },
  { left: "76%", size: 8, delay: 0.45, duration: 1.3, drift: 22, rise: -80 },
  { left: "88%", size: 5, delay: 0.6, duration: 1, drift: 12, rise: -56 },
];

/** Where each card sits for its offset from the front card. */
function placement(offset: number): CSSProperties {
  const distance = Math.abs(offset);
  const side = Math.sign(offset);
  if (distance === 0) return { transform: "translateX(-50%)", zIndex: 30 };
  if (distance === 1) {
    return {
      transform: `translateX(calc(-50% + ${side * 62}%)) rotate(${side * 9}deg) scale(0.86)`,
      zIndex: 20,
      filter: "brightness(0.82)",
    };
  }
  return {
    transform: `translateX(calc(-50% + ${side * 96}%)) rotate(${side * 14}deg) scale(0.72)`,
    zIndex: 10 - distance,
    opacity: 0,
    pointerEvents: "none",
  };
}

type DemoDeckProps = {
  /** The visitor's sketch, once they have chosen a trade. It is always the first card. */
  sketch: ReactNode | null;
  /** Changes whenever the sketch is restyled for a different trade. */
  sketchKey: string;
  active: number;
  onActiveChange: (index: number) => void;
  /** The business name, stamped on the sketch once the request is saved. */
  stamp: string | null;
};

export function DemoDeck({ sketch, sketchKey, active, onActiveChange, stamp }: DemoDeckProps) {
  const count = realCards.length + (sketch ? 1 : 0);
  const [touched, setTouched] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  // A swipe that ends on a background card must not also bring it forward.
  const swiped = useRef(false);

  const canAutoplay = !sketch && !touched && !reduced;
  const playing = canAutoplay && !paused && visible;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(pointer: fine)");
    const sync = () => {
      setReduced(motion.matches);
      setFinePointer(pointer.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
    };
  }, []);

  // Autoplay pauses off screen and in a hidden tab.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    observer.observe(stage);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => onActiveChange(wrapIndex(active + 1, count)), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [playing, active, count, onActiveChange]);

  function go(index: number) {
    setTouched(true);
    onActiveChange(wrapIndex(index, count));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX, y: event.clientY };
    swiped.current = false;
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true;
      go(active + (dx < 0 ? 1 : -1));
    }
  }

  // The front card leans towards a fine pointer.
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const front = frontRef.current;
    if (!front || !finePointer || reduced || drag.current) return;
    const box = front.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    front.style.setProperty("--ry", `${Math.max(-1, Math.min(1, x)) * 8}deg`);
    front.style.setProperty("--rx", `${Math.max(-1, Math.min(1, y)) * -6}deg`);
  }

  function onPointerLeave() {
    drag.current = null;
    frontRef.current?.style.setProperty("--ry", "0deg");
    frontRef.current?.style.setProperty("--rx", "0deg");
  }

  const cards = [
    ...(sketch ? [{ key: "sketch", label: "A quick sketch of your homepage" }] : []),
    ...realCards.map((project) => ({ key: project.slug, label: `Real demo: ${project.label}` })),
  ];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Demo websites"
      onKeyDown={onKeyDown}
      className="relative"
    >
      <div
        ref={stageRef}
        className={demo.stage}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerLeave}
        aria-live={playing ? "off" : "polite"}
      >
        <p className={demo.tag} aria-hidden="true">
          {sketch ? (
            <>
              Your quick sketch<span className="hidden sm:inline"> · real demo 48h after our call</span>
            </>
          ) : (
            "Real demos we’ve designed"
          )}
        </p>

        {cards.map((card, index) => {
          const offset = cardOffset(index, active, count);
          const front = offset === 0;
          const isSketch = card.key === "sketch";
          const project = isSketch ? null : realCards.find((item) => item.slug === card.key);
          return (
            <div
              key={card.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${card.label}`}
              aria-hidden={front ? undefined : true}
              className={demo.card}
              style={placement(offset)}
              onClick={() => {
                if (!front && !swiped.current) go(index);
              }}
            >
              <div
                ref={front ? frontRef : undefined}
                className={cn(
                  demo.cardFace,
                  isSketch && demo.sketchFace,
                  // The sketch card mounts once, so it deals in once.
                  isSketch && demo.dealt,
                  !sketch && demo.enter,
                )}
                style={{ "--i": index } as CSSProperties}
              >
                {isSketch ? (
                  <div key={sketchKey} className={cn("absolute inset-0", demo.restyle)}>
                    {sketch}
                  </div>
                ) : project ? (
                  <>
                    <Image
                      src={project.screenshots.mobile}
                      alt={`${project.name}, a demo website for a ${project.industry.toLowerCase()} business`}
                      width={420}
                      height={900}
                      sizes="(min-width: 1024px) 300px, 172px"
                      // The front card and the two fanned beside it are on screen at load.
                      priority={!sketch && Math.abs(cardOffset(index, 0, count)) <= 1}
                      draggable={false}
                      className="h-full w-full object-cover object-top"
                    />
                    <span className={demo.label}>
                      <small>Real demo</small>
                      {project.label}
                    </span>
                  </>
                ) : null}
              </div>

              {isSketch && stamp ? (
                <>
                  <div aria-hidden="true" className={cn(demo.bubbles, "motion-reduce:hidden")}>
                    {BUBBLES.map((bubble) => (
                      <span
                        key={bubble.left}
                        className={styles.bubble}
                        style={
                          {
                            left: bubble.left,
                            width: `${bubble.size}cqi`,
                            height: `${bubble.size}cqi`,
                            "--delay": `${bubble.delay}s`,
                            "--duration": `${bubble.duration}s`,
                            "--drift": `${bubble.drift}cqi`,
                            "--rise": `${bubble.rise}cqi`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                  <p className={demo.stamp}>
                    ✓ Reserved
                    <br />
                    {stamp}
                  </p>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="relative z-40 -mt-1 flex items-center justify-center gap-2 md:mt-3 md:gap-3">
        <button
          type="button"
          onClick={() => go(active - 1)}
          aria-label="Previous"
          className="hidden h-9 w-9 place-items-center md:grid rounded-full text-muted-invert ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Icon name="arrow" size={16} className="rotate-180" aria-hidden />
        </button>
        <div className="flex items-center gap-1.5">
          {cards.map((card, index) => (
            <button
              key={card.key}
              type="button"
              onClick={() => go(index)}
              aria-label={`Show ${card.label}`}
              aria-current={index === active ? "true" : undefined}
              className="grid h-6 place-items-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  index === active ? "w-5 bg-brand" : "w-1.5 bg-white/30",
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(active + 1)}
          aria-label="Next"
          className="hidden h-9 w-9 place-items-center md:grid rounded-full text-muted-invert ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Icon name="arrow" size={16} aria-hidden />
        </button>
        {canAutoplay ? (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Play the demos" : "Pause the demos"}
            className="grid h-8 w-8 place-items-center md:h-9 md:w-9 rounded-full text-muted-invert ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
          >
            {paused ? (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" /></svg>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
