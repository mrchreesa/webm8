"use client";

import { analyticsName } from "@/lib/analyticsNames";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { CSSProperties, FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useDeckImages } from "@/components/ui/useDeckImages";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { cardOffset, wrapIndex } from "@/lib/demoDeck";
import { projects } from "@/lib/site";
import { DemoSiteModal } from "./DemoSiteModal";
import demo from "./demo.module.css";

/**
 * Every real demo site, in deck order: different kinds of business, with no
 * two alike side by side (the deck wraps), so a visitor can picture their
 * own. Labels are short enough for a phone card.
 */
const deckOrder: { slug: string; label: string }[] = [
  { slug: "stitch-house", label: "Tailor, London" },
  { slug: "solvers-cleaning", label: "Cleaning" },
  { slug: "aesthetic-nacre", label: "Aesthetic clinic" },
  { slug: "dps-gasworks", label: "Heating, Bedford" },
  { slug: "chibauchi-atelier", label: "Fashion label" },
  { slug: "removals", label: "Removals" },
  { slug: "aesthetic-veil", label: "Skin clinic, London" },
  { slug: "allen-fitness", label: "Activewear" },
  { slug: "ideal-baby", label: "Baby store, Miami" },
  { slug: "cleaning", label: "Home cleaning" },
  { slug: "chibauchi-studio", label: "Clothing brand" },
];

const realCards = deckOrder.flatMap(({ slug, label }) => {
  const project = projects.find((item) => item.slug === slug);
  return project ? [{ ...project, label }] : [];
});

const count = realCards.length;
const AUTOPLAY_MS = 3500;
const SWIPE_PX = 40;

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
  active: number;
  onActiveChange: (index: number) => void;
};

export function DemoDeck({ active, onActiveChange }: DemoDeckProps) {
  const pathname = usePathname();
  // The visible fan is three cards; one more on each side is ready before
  // a swipe or autoplay brings it into view. Distant slides have no image yet.
  const shouldLoadImage = useDeckImages(active, count, 2);
  const [touched, setTouched] = useState(false);
  /** The card whose live site is open in the dialog. */
  const [opened, setOpened] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLAnchorElement>(null);
  const refocus = useRef(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  // A swipe that ends on a background card must not also bring it forward.
  const swiped = useRef(false);

  const canAutoplay = !touched && !reduced;
  // Autoplay also waits while focus is in the deck, so a card never turns
  // away from under the keyboard.
  const playing = canAutoplay && !paused && visible && !focusWithin;

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
  }, [playing, active, onActiveChange]);

  function go(index: number) {
    const next = wrapIndex(index, count);
    // The focused front card is about to be hidden from assistive tech, so
    // focus waits on the deck and moves to the new front card once it is there.
    if (next !== active && document.activeElement?.closest("[data-deck-card]")) {
      regionRef.current?.focus({ preventScroll: true });
      refocus.current = true;
    }
    setTouched(true);
    onActiveChange(next);
  }

  useLayoutEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    frontRef.current?.focus({ preventScroll: true });
  }, [active]);

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
  }

  // A card is a link to its live site. A plain click opens it in the dialog
  // and brings the card to the front; a modified click opens a new tab, as
  // any link would. A swipe that ends on a card opens nothing.
  function openCard(event: MouseEvent<HTMLAnchorElement>, index: number) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (swiped.current) return;
    go(index);
    setOpened(index);
    trackEvent("portfolio_example_clicked", {
      example: realCards[index].slug,
      position: index + 1,
      placement: "demo_deck",
      page: pathname ?? "",
    });
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

  return (
    <>
      <div data-analytics-section="Demo examples"
        ref={regionRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Demo websites"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onFocus={() => setFocusWithin(true)}
        onBlur={onBlur}
        className="relative outline-none"
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
            Real demos we’ve designed
          </p>

          {realCards.map((project, index) => {
            const offset = cardOffset(index, active, count);
            const front = offset === 0;
            return (
              <div
                key={project.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}: Real demo: ${project.label}`}
                aria-hidden={front ? undefined : true}
                className={demo.card}
                style={placement(offset)}
              >
                <a
                  ref={front ? frontRef : undefined}
                  href={project.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  tabIndex={front ? undefined : -1}
                  data-deck-card
                  data-analytics-id={analyticsName(`${front ? "Preview" : "Show"} ${project.name} card`)} aria-label={`View ${project.name}, a real demo website`}
                  // A card behind the front one is hidden from assistive tech,
                  // so a click on it must not leave focus inside it.
                  onMouseDown={front ? undefined : (event) => event.preventDefault()}
                  onClick={(event) => openCard(event, index)}
                  // The first preview is useful content at first paint. Only
                  // the supporting cards deal in; navigation still animates.
                  className={cn(demo.cardFace, index !== 0 && demo.enter, "block")}
                  style={{ "--i": index } as CSSProperties}
                >
                  {shouldLoadImage(index) && <Image
                    src={project.screenshots.mobile}
                    alt={`${project.name}, a demo website for a ${project.industry.toLowerCase()} business`}
                    width={420}
                    height={900}
                    sizes="(min-width: 1024px) 300px, 172px"
                    // Keep the initial LCP image high priority even after autoplay moves it.
                    // Supporting previews must not compete with it for a preload.
                    priority={index === 0}
                    loading="eager"
                    fetchPriority={index === 0 ? "high" : "low"}
                    draggable={false}
                    className="h-full w-full object-cover object-top"
                  />}
                  <span className={demo.label}>
                    <small>Real demo</small>
                    {project.label}
                  </span>
                  {front ? (
                    <span className={demo.view} aria-hidden="true">
                      <Icon name="expand" size={12} />
                      View site
                    </span>
                  ) : null}
                </a>
              </div>
            );
          })}
        </div>

        <div className="relative z-40 -mt-1 flex items-center justify-center gap-2 md:mt-3 md:gap-3">
          <button data-analytics-id="Previous demo"
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous"
            className="hidden h-9 w-9 place-items-center md:grid rounded-full text-muted-invert ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon name="arrow" size={16} className="rotate-180" aria-hidden />
          </button>
          <div className="flex items-center gap-1.5">
            {realCards.map((project, index) => (
              <button data-analytics-id={analyticsName(`Select ${project.name}`)}
                key={project.slug}
                type="button"
                onClick={() => go(index)}
                aria-label={`Show real demo: ${project.label}`}
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
          <button data-analytics-id="Next demo"
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next"
            className="hidden h-9 w-9 place-items-center md:grid rounded-full text-muted-invert ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon name="arrow" size={16} aria-hidden />
          </button>
          {canAutoplay ? (
            <button data-analytics-id={paused ? "Play demos" : "Pause demos"}
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

      <DemoSiteModal project={opened === null ? null : realCards[opened]} onClose={() => setOpened(null)} />
    </>
  );
}
