"use client";

import { analyticsName } from "@/lib/analyticsNames";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Icon } from "@/components/ui/Icon";
import { useDeckImages } from "@/components/ui/useDeckImages";
import { cn } from "@/lib/cn";
import { cardOffset, springStep, wrapIndex } from "@/lib/demoDeck";
import { projects, workDeckStart } from "@/lib/site";

const hostOf = (url?: string) => (url ? new URL(url).hostname : "webm8agency.com");

const count = projects.length;
const startIndex = Math.max(0, projects.findIndex((project) => project.slug === workDeckStart));
const narrowQuery = "(max-width: 759px)";
/** Movement, in pixels, before a press on the deck becomes a drag. */
const DRAG_PX = 6;
/** A drag this long, in pixels, always moves on at least one card. */
const SWIPE_PX = 40;
/** How far a flick carries the deck on: its speed, in cards a second, times this. */
const FLICK_S = 0.18;
/** The quiet after the last sideways wheel event before the deck settles on a card. */
const WHEEL_SETTLE_MS = 160;
/**
 * How briskly the deck follows, as the natural frequency (radians a second) of
 * the spring that carries it: about a third of a second to settle on a card.
 */
const STIFFNESS = 14;
/**
 * The phone trails the deck on a softer spring, so it grows into place over
 * about half a second, finishing after its card has landed.
 */
const PHONE_STIFFNESS = 8;
/** A phone's size beside the deck, as a share of its size at the front. */
const PHONE_SMALL = 0.8;

/** How far apart neighbouring cards sit, as a share of a card's width. */
const spread = (narrow: boolean) => (narrow ? 62 : 44);

/** The distance, in pixels, a drag or scroll moves to bring the next card to the front. */
function stepWidth(stage: HTMLElement) {
  const card = stage.querySelector<HTMLElement>("[data-deck-card]");
  return ((card?.offsetWidth || stage.offsetWidth * 0.76) * spread(window.matchMedia(narrowQuery).matches)) / 100;
}

/**
 * A card's opacity by its distance from the front: solid within half a card,
 * so nothing shows through the front card mid-drag, then 0.78 beside it, 0.56
 * two away, and gone by three.
 */
function opacityAt(distance: number) {
  if (distance <= 0.5) return 1;
  if (distance <= 1) return 1 - (distance - 0.5) * 0.44;
  if (distance <= 2) return 1 - distance * 0.22;
  return Math.max(0, (3 - distance) * 0.56);
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Where a card sits, and how it looks, `offset` cards from the front: the
 * card itself, its browser frame and its phone. The phone has its own
 * `phoneOffset`, which trails the card's.
 *
 * The phone grows from small, a card away, to full size at the front. It
 * also stands 60px proud of the front card, but a filter, or opacity below
 * 1, flattens a card's 3D, so the dimming goes on the frame and the phone
 * rather than the card, and the phone rises only while the card is solid,
 * within half a card of the front.
 */
function cardLook(offset: number, narrow: boolean, phoneOffset = offset) {
  const distance = Math.abs(offset);
  const dim = Math.min(distance, 3);
  const grow = smooth(Math.max(0, 1 - Math.abs(phoneOffset)));
  const lift = smooth(Math.max(0, 1 - Math.max(distance, Math.abs(phoneOffset)) * 2));
  const filter = distance ? `brightness(${1 - dim * 0.25}) saturate(${1 - dim * 0.3})` : "none";
  return {
    card: {
      transform: `translateX(${offset * spread(narrow) - 50}%) translateZ(${-distance * (narrow ? 260 : 220)}px) rotateY(${narrow ? 0 : -offset * 24}deg)`,
      opacity: String(opacityAt(distance)),
      zIndex: String(100 - Math.round(distance * 10)),
      pointerEvents: distance > 2.5 ? "none" : "auto",
    } satisfies CSSProperties,
    frame: { filter } satisfies CSSProperties,
    phone: {
      filter,
      transform: `translateZ(${lift * 60}px) scale(${PHONE_SMALL + (1 - PHONE_SMALL) * grow})`,
    } satisfies CSSProperties,
  };
}

// The server cannot know the screen size, so it draws the wide fan, and the
// deck redraws itself for a phone once it hydrates. These never change, so
// React never rewrites them, and the frame loop owns each card's style.
const firstLooks = projects.map((_, index) => cardLook(cardOffset(index, startIndex, count), false));

type CardParts = { card: HTMLElement; frame: HTMLElement | null; phone: HTMLElement | null };

/**
 * Moves the deck. `position` counts cards and runs on past either end, so the
 * deck loops for ever; a fraction is between two cards. A critically damped
 * spring carries it towards `target` frame by frame, keeping its speed through
 * every change of course (a scroll settling, a flick, an arrow mid-scroll),
 * and each frame is written straight onto the cards, so nothing waits on
 * React. While `held`, the deck follows a finger exactly. `phoneAt` chases
 * `position` on a softer spring, and sizes the phones.
 */
function createDeckMotion(onActive: (index: number) => void) {
  const cards: (CardParts | null)[] = [];
  const bind = projects.map((_, index) => (card: HTMLElement | null) => {
    cards[index] = card && {
      card,
      frame: card.querySelector<HTMLElement>("[data-deck-frame]"),
      phone: card.querySelector<HTMLElement>("[data-deck-phone]"),
    };
  });
  let position = startIndex;
  let velocity = 0;
  let target = startIndex;
  let held = false;
  let phoneAt = startIndex;
  let phoneSpeed = 0;
  let narrow = false;
  let reduced = false;
  let frame = 0;
  let last = 0;
  let shown = startIndex;

  const draw = () => {
    cards.forEach((parts, index) => {
      if (!parts) return;
      const look = cardLook(cardOffset(index, position, count), narrow, cardOffset(index, phoneAt, count));
      Object.assign(parts.card.style, look.card);
      if (parts.frame) Object.assign(parts.frame.style, look.frame);
      if (parts.phone) Object.assign(parts.phone.style, look.phone);
    });
  };

  // The caption and chips show the card the deck is heading for.
  const announce = (to: number) => {
    const index = wrapIndex(Math.round(to), count);
    if (index === shown) return;
    shown = index;
    onActive(index);
  };

  const tick = (time: number) => {
    const dt = Math.min(0.05, Math.max(0, (time - last) / 1000));
    last = time;
    if (!held) {
      if (reduced) {
        position = target;
        velocity = 0;
      } else {
        const [offset, speed] = springStep(position - target, velocity, STIFFNESS, dt);
        position = target + offset;
        velocity = speed;
        if (Math.abs(offset) < 1e-3 && Math.abs(speed) < 1e-2) {
          position = target;
          velocity = 0;
        }
      }
    }
    if (reduced) {
      phoneAt = position;
      phoneSpeed = 0;
    } else {
      const [lag, speed] = springStep(phoneAt - position, phoneSpeed, PHONE_STIFFNESS, dt);
      phoneAt = position + lag;
      phoneSpeed = speed;
      if (Math.abs(lag) < 1e-3 && Math.abs(speed) < 1e-2) {
        phoneAt = position;
        phoneSpeed = 0;
      }
    }
    draw();
    const resting = (held || (position === target && velocity === 0)) && phoneAt === position && phoneSpeed === 0;
    frame = resting ? 0 : requestAnimationFrame(tick);
  };

  const wake = () => {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const aim = (to: number) => {
    target = to;
    announce(to);
    wake();
  };

  return {
    bind,
    get position() {
      return position;
    },
    configure(next: { narrow: boolean; reduced: boolean }) {
      ({ narrow, reduced } = next);
      draw();
    },
    step(by: number) {
      aim(Math.round(target) + by);
    },
    /** Brings a card forward the short way round, so it never rewinds the whole deck. */
    show(index: number) {
      const from = Math.round(target);
      aim(from + cardOffset(index, from, count));
    },
    scroll(by: number) {
      if (!held) aim(target + by);
    },
    settle() {
      if (!held) aim(Math.round(target));
    },
    hold() {
      held = true;
      velocity = 0;
      target = position;
    },
    drag(to: number) {
      position = to;
      target = to;
      announce(to);
      wake();
    },
    release(to: number, speed: number) {
      held = false;
      velocity = speed;
      aim(to);
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}

type Drag = {
  pointer: number;
  /** Where the press began. */
  x: number;
  /** The deck position the drag counts from, and the card in front, once it is a drag. */
  start: number;
  from: number;
  step: number;
  dragging: boolean;
  lastX: number;
  lastTime: number;
  /** The pointer's speed in px/ms, smoothed. */
  velocity: number;
};

/**
 * The demo sites as a 3D fan that loops endlessly. It moves with its arrows,
 * the keyboard, a drag or swipe, and a sideways trackpad scroll. Adding a
 * project to lib/site.ts adds a card.
 */
export function WorkDeck() {
  const [active, setActive] = useState(startIndex);
  const [motion] = useState(() => createDeckMotion(setActive));
  const stageRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const shouldLoadImage = useDeckImages(active, count, 2, nearViewport);
  const drag = useRef<Drag | null>(null);
  // A drag that ends on a card must not also count as a click on it.
  const swiped = useRef(false);
  const current = projects[active];

  // This deck sits below the story. Start its visible fan shortly before it
  // enters view, instead of competing with the hero for image bandwidth.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!("IntersectionObserver" in window)) {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearViewport(true);
      observer.disconnect();
    }, { rootMargin: "600px 0px" });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Draws the deck for a phone or a wider screen, and settles at once under reduced motion.
  useLayoutEffect(() => {
    const narrow = window.matchMedia(narrowQuery);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => motion.configure({ narrow: narrow.matches, reduced: reduced.matches });
    update();
    narrow.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      narrow.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
      motion.stop();
    };
  }, [motion]);

  // A sideways trackpad scroll, or shift and the mouse wheel, scrolls the deck.
  // Vertical scrolling is left to the page. React's wheel listener is passive,
  // so it could not stop a sideways swipe going back a page.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let timer: number | undefined;
    const onWheel = (event: WheelEvent) => {
      const dx = event.deltaX || (event.shiftKey ? event.deltaY : 0);
      const dy = event.deltaX || !event.shiftKey ? event.deltaY : 0;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.offsetWidth : 1;
      motion.scroll((dx * unit) / stepWidth(stage));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => motion.settle(), WHEEL_SETTLE_MS);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      window.clearTimeout(timer);
    };
  }, [motion]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      motion.step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      motion.step(-1);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    swiped.current = false;
    drag.current = {
      pointer: event.pointerId,
      x: event.clientX,
      start: 0,
      from: 0,
      step: stepWidth(event.currentTarget),
      dragging: false,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    const dx = event.clientX - current.x;
    if (!current.dragging) {
      if (Math.abs(dx) < DRAG_PX) return;
      current.dragging = true;
      // Keeps the drag going off the deck, and the release from clicking a card.
      event.currentTarget.setPointerCapture(event.pointerId);
      // Picks the deck up where it is, even mid-glide, so it never jumps.
      motion.hold();
      current.start = motion.position + dx / current.step;
      current.from = Math.round(motion.position);
    }
    const elapsed = event.timeStamp - current.lastTime;
    if (elapsed > 0) {
      current.velocity = 0.8 * ((event.clientX - current.lastX) / elapsed) + 0.2 * current.velocity;
    }
    current.lastX = event.clientX;
    current.lastTime = event.timeStamp;
    motion.drag(current.start - dx / current.step);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    drag.current = null;
    if (!current.dragging) return;
    swiped.current = true;
    window.setTimeout(() => {
      swiped.current = false;
    });
    const dx = event.clientX - current.x;
    // A finger held still before letting go is not a flick.
    const pointerSpeed = event.timeStamp - current.lastTime > 100 ? 0 : current.velocity;
    const speed = (-pointerSpeed * 1000) / current.step;
    const { from } = current;
    const flung = motion.position + speed * FLICK_S;
    let target = Math.round(Math.min(from + 3, Math.max(from - 3, flung)));
    if (target === from && Math.abs(dx) >= SWIPE_PX) target = from + (dx < 0 ? 1 : -1);
    // The deck glides on at the flick's speed into the card it lands on.
    motion.release(target, speed);
  };

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    drag.current = null;
    if (current.dragging) motion.release(Math.round(motion.position), 0);
  };

  return (
    <section data-analytics-section="Homepage examples"
      id="work"
      aria-labelledby="work-title"
      className="surface-dark overflow-hidden bg-gradient-to-b from-night to-ink-deep py-28 text-white md:py-36"
    >
      <div className="container-page text-center">
        <h2 id="work-title" className="text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] font-bold text-balance">
          Built for businesses like yours.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-invert">
          Demo sites we designed for local businesses. Pick one to take a closer look.
        </p>
      </div>

      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Demo sites"
        className="relative mt-12 h-[clamp(260px,44vw,520px)] touch-pan-y overscroll-x-contain select-none [perspective:2000px]"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {projects.map((project, index) => {
          const slot = cardOffset(index, active, count);
          const isActive = slot === 0;
          const disabled = isActive && !project.siteUrl;
          return (
            <button data-analytics-id={analyticsName(`${isActive ? "Open" : "Show"} ${project.name} card`)}
              key={project.slug}
              ref={motion.bind[index]}
              type="button"
              data-deck-card
              tabIndex={Math.abs(slot) > 2 ? -1 : 0}
              disabled={disabled}
              aria-label={isActive ? `Open the ${project.name} demo site` : `Show ${project.name}`}
              onClick={() => {
                if (swiped.current) return;
                if (!isActive) motion.show(index);
                else if (project.siteUrl) window.open(project.siteUrl, "_blank", "noopener,noreferrer");
              }}
              // Hover lifts with `translate`, which the frame loop's inline `transform` leaves alone.
              className={cn(
                "absolute top-0 left-1/2 w-[min(76vw,760px)] cursor-pointer text-left [transform-style:preserve-3d] transition-[translate] duration-300 ease-out disabled:cursor-default",
                !disabled && "group/card motion-safe:hover:-translate-y-1.5",
              )}
              style={firstLooks[index].card}
            >
              <div
                data-deck-frame
                style={firstLooks[index].frame}
                className="overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_60px_100px_-40px_rgb(0_0_0/0.9)] transition-shadow duration-300 group-hover/card:shadow-[0_0_0_1px_rgb(255_255_255/0.28),0_60px_100px_-40px_rgb(0_0_0/0.9),0_24px_80px_-24px_rgb(43_108_252/0.55)]"
              >
                <div className="flex h-8 items-center gap-1.5 bg-[#e9edf3] px-3">
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <span className="mx-auto h-5 max-w-[280px] flex-1 truncate rounded-md bg-white text-center font-mono text-[10.5px] leading-5 text-[#6b7280]">
                    {hostOf(project.siteUrl)}
                  </span>
                </div>
                <div className="relative aspect-[16/9.2] overflow-hidden">
                  {shouldLoadImage(index) && <Image
                    src={project.screenshots.desktop}
                    alt=""
                    fill
                    draggable={false}
                    sizes="(min-width: 1024px) 760px, 76vw"
                    loading="eager"
                    className="origin-top object-cover object-top transition-[scale] duration-700 ease-out motion-safe:group-hover/card:scale-[1.03]"
                  />}
                </div>
              </div>
              <div
                data-deck-phone
                style={firstLooks[index].phone}
                className="absolute right-[-3%] bottom-[-8%] w-[19%] rounded-2xl bg-[#0b1220] p-1 shadow-[0_30px_50px_-20px_rgb(0_0_0/0.9)] origin-bottom ring-1 ring-white/10 transition-[translate] duration-300 ease-out motion-safe:group-hover/card:-translate-y-1"
              >
                <div className="relative aspect-[9/19] overflow-hidden rounded-xl">
                  {shouldLoadImage(index) && <Image src={project.screenshots.mobile} alt="" fill draggable={false} sizes="150px" loading="eager" className="object-cover object-top" />}
                </div>
              </div>
            </button>
          );
        })}

        {/* Under the deck on a phone, where they would cover the cards; either side of it from a tablet up. */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-4 z-[200] flex justify-center gap-3 md:inset-y-0 md:justify-between md:px-4 lg:px-10">
          {[-1, 1].map((by) => (
            <button data-analytics-id={by < 0 ? "Previous demo" : "Next demo"}
              key={by}
              type="button"
              onClick={() => motion.step(by)}
              aria-label={by < 0 ? "Previous demo site" : "Next demo site"}
              className="pointer-events-auto grid h-11 w-11 place-items-center self-end rounded-full bg-night/70 text-white ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-white hover:text-ink-deep md:h-12 md:w-12 md:self-center"
            >
              <Icon name="arrow" size={18} className={by < 0 ? "rotate-180" : undefined} aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div className="container-page mt-18 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
        <div aria-live="polite">
          <p className="text-sm font-medium text-muted-invert">{current.industry}</p>
          <h3 className="mt-1 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-none font-bold tracking-[-0.03em]">
            {current.name}
          </h3>
          <p className="mt-3 max-w-xl text-muted-invert">{current.description}</p>
          {current.siteUrl ? (
            <a data-analytics-id={analyticsName(`Open ${current.name} live site`)}
              href={current.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-semibold text-link-invert underline-offset-4 hover:underline"
            >
              Open the live site
              <Icon name="arrow" size={15} className="-rotate-45" />
            </a>
          ) : null}
        </div>
        <div role="group" aria-label="Choose a demo site" className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
          {projects.map((project, index) => (
            <button data-analytics-id={analyticsName(`Select ${project.name}`)}
              key={project.slug}
              type="button"
              aria-pressed={index === active}
              onClick={() => motion.show(index)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                index === active ? "bg-white text-ink-deep" : "bg-white/6 text-muted-invert hover:text-white",
              )}
            >
              {project.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
