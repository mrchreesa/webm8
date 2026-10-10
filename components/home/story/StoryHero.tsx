"use client";

import { analyticsName } from "@/lib/analyticsNames";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DemoCtaButton } from "@/components/demo/DemoCtaButton";
import { LinkButton } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  STORY_TURN_MS,
  chapterAt,
  chapterProgress,
  chapterTime,
  clamp01,
  easeInOutCubic,
  fieldFill,
  playProgress,
  typedText,
  type StoryChapter,
  type StoryStep,
} from "@/lib/storyProgress";
import { defaultTrade, nextHeroTrade, trades, type Trade, type TradeKey } from "@/lib/trades";
import { PauseIcon, PlayIcon } from "./icons";
import { siteFonts } from "./fonts";
import { LockScreen } from "./LockScreen";
import { looks } from "./looks";
import { RequestForm } from "./RequestForm";
import { SearchScreen } from "./SearchScreen";
import { StoryBackdrop } from "./StoryBackdrop";
import { TradeChips } from "./TradeChips";
import { TradeSite } from "./TradeSite";
import styles from "./story.module.css";

const RAIL: { chapter: StoryStep; label: string }[] = [
  { chapter: 1, label: "Search" },
  { chapter: 2, label: "Site" },
  { chapter: 3, label: "Request" },
  { chapter: 4, label: "Call" },
];

/** The phone fades out over the end of a turn, and stays hidden this far into the next while it resets. */
const SWAP_OUT_MS = 380;
const SWAP_IN_MS = 260;

/** Paused, or with reduced motion, a step is shown this far through. */
const STILL_AT = 0.72;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type StoryControl = {
  setPlaying: (on: boolean) => void;
  seek: (step: StoryStep) => void;
  /** Plays a trade from the start. Returns false when it is shown still instead (reduced motion, paused). */
  pick: (key: TradeKey) => boolean;
};

function paletteStyle(trade: Trade): CSSProperties {
  const p = trade.palette;
  return {
    "--t-primary": p.primary,
    "--t-deep": p.deep,
    "--t-accent": p.accent,
    "--t-accent-ink": p.accentInk,
    "--t-soft": p.soft,
    "--t-ink": p.ink,
    "--t-font": siteFonts[looks[trade.key]?.font ?? "bricolage"],
  } as CSSProperties;
}

function screenFor(chapter: StoryChapter) {
  return chapter <= 1 ? "search" : chapter === 2 ? "site" : "form";
}

/**
 * The homepage hero: one customer's journey, from a local search to the
 * owner's phone lighting up, played on a loop. Each turn shows the next
 * trade, or the one a visitor picks from the chips.
 */
export function StoryHero() {
  const [tradeKey, setTradeKey] = useState<TradeKey>(defaultTrade);
  // A picked trade lights its chip at once; the phone swaps once it has faded out.
  const [pickedKey, setPickedKey] = useState<TradeKey | null>(null);
  const trade = trades[tradeKey];

  const sectionRef = useRef<HTMLElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const tradeRef = useRef(trade);
  const frameRef = useRef<() => void>(() => {});
  const controlRef = useRef<StoryControl | null>(null);
  const chapterRef = useRef<StoryChapter>(0);
  const [chapter, setChapter] = useState<StoryChapter>(0);
  const [playing, setPlaying] = useState(true);

  // The clock: while the story is playing and on screen, one rAF loop moves
  // it on and writes every per-frame state.
  useEffect(() => {
    const section = sectionRef.current;
    const device = deviceRef.current;
    const phone = phoneRef.current;
    if (!section || !device || !phone) return;
    const reduce = prefersReducedMotion();
    const find = (name: string) => section.querySelector<HTMLElement>(`[data-story="${name}"]`);
    const flag = (element: Element | null, name: string, on: boolean) => element?.toggleAttribute(`data-${name}`, on);
    const write = (element: Element | null, text: string) => {
      if (element && element.textContent !== text) element.textContent = text;
    };

    let elapsed = reduce ? chapterTime(2, STILL_AT) : 0;
    let swapInUntil = 0;
    let running = false;
    let onScreen = false;
    let raf = 0;
    let last = 0;
    let completed = false;
    let picked: TradeKey | null = null;
    let fadeLeft = 0;

    /** Puts a trade on the phone, at the start of its turn. */
    const begin = (key: TradeKey) => {
      picked = null;
      elapsed = 0;
      swapInUntil = SWAP_IN_MS;
      setPickedKey(null);
      setTradeKey(key);
    };

    const draw = () => {
      const p = playProgress(elapsed);
      const current = chapterAt(p);
      if (current !== chapterRef.current) {
        chapterRef.current = current;
        setChapter(current);
      }
      section.querySelectorAll<HTMLElement>("[data-rail-step]").forEach((element, index) => {
        element.style.setProperty("--f", chapterProgress(p, (index + 1) as StoryStep).toFixed(3));
      });
      find("chips")?.style.setProperty("--turn", picked ? "0" : clamp01(elapsed / STORY_TURN_MS).toFixed(3));
      flag(
        device,
        "swapping",
        running && (picked !== null || elapsed < swapInUntil || elapsed > STORY_TURN_MS - SWAP_OUT_MS),
      );

      const t = tradeRef.current;

      // 1. The search types itself, results appear, the top one is chosen.
      const l1 = chapterProgress(p, 1);
      write(find("query"), typedText(t.query, l1 / 0.4));
      const search = find("search");
      flag(search, "typing", l1 > 0.02);
      flag(search, "results", l1 > 0.45);
      flag(find("top-result"), "hl", l1 > 0.7);
      flag(find("tap-1"), "go", current === 1 && l1 > 0.82);

      // 2. Their site scrolls a little, then the main button is tapped.
      const l2 = chapterProgress(p, 2);
      find("site")?.style.setProperty("--s2", easeInOutCubic(l2).toFixed(3));
      flag(find("tap-2"), "go", current === 2 && l2 > 0.74);

      // 3. The form fills itself in and is sent.
      const l3 = chapterProgress(p, 3);
      section.querySelectorAll<HTMLElement>('[data-story="field"]').forEach((field, index) => {
        const amount = fieldFill(l3, index);
        write(field.querySelector('[data-story="field-value"]'), typedText(t.form.fields[index]?.value ?? "", amount));
        flag(field, "active", amount > 0 && amount < 1);
      });
      flag(find("form-button"), "pressed", l3 > 0.76 && l3 < 0.86);
      flag(find("tap-3"), "go", current === 3 && l3 > 0.74);
      flag(find("done"), "on", l3 > 0.86);

      // 4. The phone turns around: it is the owner's, and the request lands.
      const l4 = chapterProgress(p, 4);
      const flip = easeInOutCubic(l4 / 0.3);
      phone.style.setProperty("--flip", `${(reduce ? (flip > 0.5 ? 180 : 0) : flip * 180).toFixed(1)}deg`);
      flag(find("note-0"), "on", l4 > 0.36);
      flag(find("note-1"), "on", l4 > 0.62);
      flag(find("shake"), "buzz", running && !reduce && l4 > 0.38 && l4 < 0.9);
    };
    frameRef.current = draw;

    const tick = (now: number) => {
      raf = 0;
      if (!running || !onScreen || document.hidden) return;
      const step = Math.min(Math.max(0, now - last), 100);
      last = now;
      if (picked) {
        // The story holds still while the phone fades out for the picked trade.
        fadeLeft -= step;
        if (fadeLeft <= 0) begin(picked);
      } else {
        elapsed += step;
        if (elapsed >= STORY_TURN_MS) {
          if (!completed) {
            completed = true;
            trackEvent("home_story_completed", { trade: tradeRef.current.key });
          }
          begin(nextHeroTrade(tradeRef.current.key));
        }
      }
      draw();
      raf = window.requestAnimationFrame(tick);
    };

    const resume = () => {
      if (raf || !running || !onScreen || document.hidden) return;
      last = performance.now();
      raf = window.requestAnimationFrame(tick);
    };

    controlRef.current = {
      setPlaying(on) {
        running = on;
        // Never leave the phone faded out: a pause mid-swap shows the picked trade's search, still.
        if (!on && picked) {
          begin(picked);
          elapsed = chapterTime(1, STILL_AT);
          swapInUntil = 0;
        }
        if (on) resume();
        draw();
      },
      seek(step) {
        if (picked) begin(picked);
        elapsed = chapterTime(step, running ? 0 : STILL_AT);
        swapInUntil = 0;
        draw();
      },
      pick(key) {
        if (reduce && !running) {
          begin(key);
          elapsed = chapterTime(2, STILL_AT);
          swapInUntil = 0;
          draw();
          return false;
        }
        if (!picked) fadeLeft = SWAP_OUT_MS;
        picked = key;
        setPickedKey(key);
        running = true;
        resume();
        draw();
        return true;
      },
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      resume();
    });
    observer.observe(section);
    document.addEventListener("visibilitychange", resume);
    if (reduce) setPlaying(false);
    draw();

    let onPointer: ((event: PointerEvent) => void) | null = null;
    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
      onPointer = (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        phone.style.setProperty("--tilt-x", `${(4 - y * 8).toFixed(2)}deg`);
        phone.style.setProperty("--tilt-z", `${(-2 + x * 4).toFixed(2)}deg`);
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    return () => {
      controlRef.current = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
      if (onPointer) window.removeEventListener("pointermove", onPointer);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    controlRef.current?.setPlaying(playing);
  }, [playing]);

  // A new trade re-renders the screens; redraw the typed text at once.
  useEffect(() => {
    tradeRef.current = trade;
    frameRef.current();
  }, [trade]);

  const captions = [
    trade.need,
    "They find a site that looks the part.",
    "Saying yes takes one tap.",
    "And your phone lights up.",
  ];
  const caption = Math.max(1, chapter);

  const pickTrade = (key: TradeKey) => {
    trackEvent("home_story_trade_picked", { trade: key });
    if (controlRef.current?.pick(key)) setPlaying(true);
  };

  return (
    <section data-analytics-section="Homepage hero"
      ref={sectionRef}
      aria-label="An example of how a website turns a local search into a new customer"
      data-chapter={chapter}
      className={cn("surface-dark", styles.story)}
      style={paletteStyle(trade)}
    >
      <StoryBackdrop />
      <div className={cn("container-page", styles.grid)}>
        <div className={styles.copy}>
          <h1 className={styles.heroTitle}>Websites that make your phone ring.</h1>
          <p className={styles.lede}>
            WebM8 designs, builds and looks after websites for local businesses in the US and UK. Watch how one turns a local search into a new customer.
          </p>
          <div className={styles.ctas}>
            <DemoCtaButton placement="hero" size="lg">
              Get my free personalised demo
            </DemoCtaButton>
            <LinkButton data-analytics-id="See our work" href="#work" variant="ghost-invert" size="lg" className={styles.secondaryCta}>
              See our work
            </LinkButton>
          </div>
          <TradeChips shownKey={pickedKey ?? tradeKey} onPick={pickTrade} />
        </div>

        <div className={styles.stage}>
          <div ref={deviceRef} className={styles.device} aria-hidden="true">
            <div className={styles.enter}>
              <div data-story="shake" className={styles.shake}>
                <div ref={phoneRef} className={styles.phone}>
                  <div className={styles.face}>
                    <div data-screen={screenFor(chapter)} className={styles.screen}>
                      <span className={styles.island} />
                      <SearchScreen trade={trade} />
                      <TradeSite trade={trade} />
                      <RequestForm trade={trade} />
                    </div>
                  </div>
                  <div className={cn(styles.face, styles.back)}>
                    <div className={styles.screen}>
                      <span className={styles.island} />
                      <LockScreen trade={trade} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.captions}>
            {captions.map((text, index) => {
              const step = index + 1;
              const state = step === caption ? "on" : step < caption ? "past" : "next";
              return (
                <p key={step} className={styles.caption} data-state={state} inert={step !== caption}>
                  {text}
                </p>
              );
            })}
          </div>

          <div className={styles.controls}>
            <button data-analytics-id={playing ? "Pause example" : "Play example"}
              type="button"
              className={styles.playButton}
              aria-label={playing ? "Pause the example" : "Play the example"}
              onClick={() => setPlaying((on) => !on)}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className={styles.rail}>
              {RAIL.map((step) => (
                <button data-analytics-id={analyticsName(`Show ${step.label} step`)}
                  key={step.label}
                  type="button"
                  data-rail-step
                  className={styles.railButton}
                  aria-current={chapter === step.chapter ? "step" : undefined}
                  onClick={() => controlRef.current?.seek(step.chapter)}
                >
                  <span className={styles.railTrack}>
                    <span className={styles.railFill} />
                  </span>
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
