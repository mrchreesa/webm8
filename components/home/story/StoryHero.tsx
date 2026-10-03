"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DemoCtaButton, useDemoPrefill } from "@/components/demo/DemoPrefill";
import { LinkButton } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  chapterAt,
  chapterProgress,
  chapterScrollTarget,
  easeInOutCubic,
  fieldFill,
  storyProgress,
  typedText,
  type StoryChapter,
  type StoryStep,
} from "@/lib/storyProgress";
import { defaultTrade, displayName, trades, type Trade } from "@/lib/trades";
import { LockScreen } from "./LockScreen";
import { RequestForm } from "./RequestForm";
import { SearchScreen } from "./SearchScreen";
import { StoryBackdrop } from "./StoryBackdrop";
import { TradePicker } from "./TradePicker";
import { TradeSite } from "./TradeSite";
import styles from "./story.module.css";

const RAIL: { chapter: StoryStep; label: string }[] = [
  { chapter: 1, label: "Search" },
  { chapter: 2, label: "Site" },
  { chapter: 3, label: "Request" },
  { chapter: 4, label: "Call" },
];

/** Below this height the story is not pinned (see story.module.css). */
const SHORT_SCREEN = "(max-height: 560px)";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function paletteStyle(trade: Trade): CSSProperties {
  const p = trade.palette;
  return {
    "--t-primary": p.primary,
    "--t-deep": p.deep,
    "--t-accent": p.accent,
    "--t-accent-ink": p.accentInk,
    "--t-soft": p.soft,
    "--t-ink": p.ink,
    "--t-font": p.serif ? 'Georgia, "Times New Roman", serif' : "var(--font-sans)",
  } as CSSProperties;
}

function screenFor(chapter: StoryChapter) {
  return chapter <= 1 ? "search" : chapter === 2 ? "site" : "form";
}

function Chapter({ index, current, children }: { index: StoryChapter; current: StoryChapter; children: ReactNode }) {
  const state = index === current ? "on" : index < current ? "past" : "next";
  return (
    <div className={styles.chapter} data-state={state} inert={index !== current}>
      {children}
    </div>
  );
}

/**
 * The homepage hero: one customer's journey, from a local search to the
 * owner's phone lighting up, told in five chapters as the visitor scrolls.
 * Must be rendered inside DemoPrefillProvider.
 */
export function StoryHero() {
  const prefill = useDemoPrefill();
  const tradeKey = prefill?.tradeKey ?? defaultTrade;
  const business = prefill?.business ?? "";
  const trade = trades[tradeKey];
  const name = displayName(trade, business);

  const sectionRef = useRef<HTMLElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const tradeRef = useRef(trade);
  const frameRef = useRef<() => void>(() => {});
  const chapterRef = useRef<StoryChapter>(0);
  const completedRef = useRef(false);
  const firstTradeRef = useRef(true);
  const [chapter, setChapter] = useState<StoryChapter>(0);

  // The scroll loop: one rAF-throttled frame writes every per-frame state.
  useEffect(() => {
    const section = sectionRef.current;
    const phone = phoneRef.current;
    if (!section || !phone) return;
    const reduce = prefersReducedMotion();
    const find = (name: string) => section.querySelector<HTMLElement>(`[data-story="${name}"]`);
    const flag = (element: Element | null, name: string, on: boolean) => element?.toggleAttribute(`data-${name}`, on);
    // Too short to pin the story (a phone held sideways): CSS lays out the
    // first chapter as a normal hero, and the story stays on it.
    const shortScreen = window.matchMedia(SHORT_SCREEN);
    let raf = 0;
    let completeTimer = 0;
    // Jumping past the story ("See our work") also lands on the last chapter,
    // so it counts as completed only once that chapter has stayed on screen.
    const atEnd = () => {
      const box = section.getBoundingClientRect();
      return chapterRef.current === 4 && box.top <= 0 && box.bottom >= window.innerHeight * 0.5;
    };

    const frame = () => {
      raf = 0;
      const box = section.getBoundingClientRect();
      const p = shortScreen.matches ? 0 : storyProgress(box.top, section.offsetHeight, window.innerHeight);
      const current = chapterAt(p);
      section.style.setProperty("--p", p.toFixed(4));
      if (current !== chapterRef.current) {
        chapterRef.current = current;
        setChapter(current);
      }
      if (atEnd()) {
        if (!completedRef.current && !completeTimer) {
          completeTimer = window.setTimeout(() => {
            completeTimer = 0;
            if (!atEnd()) return;
            completedRef.current = true;
            trackEvent("home_story_completed", { trade: tradeRef.current.key });
          }, 1500);
        }
      } else if (completeTimer) {
        window.clearTimeout(completeTimer);
        completeTimer = 0;
      }
      section.querySelectorAll<HTMLElement>("[data-rail-step]").forEach((element, index) => {
        element.style.setProperty("--f", chapterProgress(p, (index + 1) as StoryStep).toFixed(3));
      });

      const t = tradeRef.current;

      // 1. The search types itself, results appear, the top one is chosen.
      const l1 = chapterProgress(p, 1);
      const query = find("query");
      if (query) query.textContent = typedText(t.query, l1 / 0.4);
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
        const value = field.querySelector('[data-story="field-value"]');
        if (value) value.textContent = typedText(t.form.fields[index]?.value ?? "", amount);
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
      flag(find("shake"), "buzz", !reduce && l4 > 0.38 && l4 < 0.9);
    };
    frameRef.current = frame;

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(frame);
    };
    let listening = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !listening) {
        listening = true;
        window.addEventListener("scroll", schedule, { passive: true });
        schedule();
      } else if (!entry.isIntersecting && listening) {
        listening = false;
        window.removeEventListener("scroll", schedule);
      }
    });
    observer.observe(section);
    window.addEventListener("resize", schedule);
    frame();

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
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (onPointer) window.removeEventListener("pointermove", onPointer);
      window.cancelAnimationFrame(raf);
      window.clearTimeout(completeTimer);
    };
  }, []);

  // A new trade or name re-renders the screens; redraw the typed text at once.
  useEffect(() => {
    tradeRef.current = trade;
    frameRef.current();
  }, [trade, name]);

  // A small nudge on the phone when the trade changes.
  useEffect(() => {
    if (firstTradeRef.current) {
      firstTradeRef.current = false;
      return;
    }
    const shake = shakeRef.current;
    if (!shake || prefersReducedMotion()) return;
    shake.removeAttribute("data-nudge");
    void shake.offsetWidth;
    shake.setAttribute("data-nudge", "");
  }, [tradeKey]);

  // On phones, push the phone below a chapter whose copy reaches into its space.
  useEffect(() => {
    const place = () => {
      const device = deviceRef.current;
      const list = chaptersRef.current;
      if (!device || !list) return;
      if (window.innerWidth >= 960) {
        device.style.removeProperty("--push");
        return;
      }
      const active = list.children[chapter] as HTMLElement | undefined;
      if (!active) return;
      const bottom = list.offsetTop + active.offsetHeight;
      device.style.setProperty("--push", `${Math.max(0, bottom + 18 - device.offsetTop)}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [chapter]);

  const goTo = (target: StoryStep) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: chapterScrollTarget(top, section.offsetHeight, window.innerHeight, target),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="An example of how a website turns a local search into a new customer"
      data-chapter={chapter}
      className={cn("surface-dark", styles.story)}
      style={paletteStyle(trade)}
    >
      <div className={styles.pin}>
        <StoryBackdrop />
        <div className={cn("container-page", styles.grid)}>
          <div ref={chaptersRef} className={styles.chapters}>
            <Chapter index={0} current={chapter}>
              <h1 className={styles.heroTitle}>
                Websites that make your phone ring.
              </h1>
              <p className={cn(styles.lede, styles.ledeFirst)}>
                WebM8 designs, builds and looks after websites for local businesses in the US and UK. Pick your trade, then scroll to see how one turns a search into a new customer.
              </p>
              {prefill ? (
                <TradePicker
                  tradeKey={tradeKey}
                  business={business}
                  onTradeChange={prefill.selectTrade}
                  onBusinessChange={prefill.setBusiness}
                />
              ) : null}
              <div className={styles.ctas}>
                <DemoCtaButton placement="hero" size="lg">
                  Get my free personalised demo
                </DemoCtaButton>
                <LinkButton href="#work" variant="ghost-invert" size="lg" className={styles.secondaryCta}>
                  See our work
                </LinkButton>
              </div>
            </Chapter>
            <Chapter index={1} current={chapter}>
              <p className={styles.title}>{trade.need}</p>
              <p className={styles.lede}>Right now, people in your area are searching for exactly what you do. Most of them are on a phone.</p>
            </Chapter>
            <Chapter index={2} current={chapter}>
              <p className={styles.title}>They find a site that looks the part.</p>
              <p className={styles.lede}>Clear, quick and built for the small screen. Within seconds they know they&apos;re in the right place.</p>
            </Chapter>
            <Chapter index={3} current={chapter}>
              <p className={styles.title}>Saying yes takes one tap.</p>
              <p className={styles.lede}>A booking or quote form right where they need it, or a button that calls you. No hunting for a phone number.</p>
            </Chapter>
            <Chapter index={4} current={chapter}>
              <p className={styles.title}>And your phone lights up.</p>
              <p className={styles.lede}>That&apos;s the whole job of a website. We build it, host it and keep it working, so you can get on with yours.</p>
              <div className={styles.ctas}>
                <DemoCtaButton placement="story_end" size="lg">
                  Get my free personalised demo
                </DemoCtaButton>
              </div>
            </Chapter>
          </div>

          <div ref={deviceRef} className={styles.device} aria-hidden="true">
            <div className={styles.enter}>
              <div ref={shakeRef} data-story="shake" className={styles.shake}>
                <div ref={phoneRef} className={styles.phone}>
                  <div className={styles.face}>
                    <div data-screen={screenFor(chapter)} className={styles.screen}>
                      <span className={styles.island} />
                      <SearchScreen trade={trade} name={name} />
                      <TradeSite trade={trade} name={name} />
                      <RequestForm trade={trade} name={name} />
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
        </div>

        <div className={styles.railWrap}>
          <div className={cn("container-page", styles.rail)}>
            {RAIL.map((step) => (
              <button
                key={step.label}
                type="button"
                data-rail-step
                className={styles.railButton}
                aria-current={chapter === step.chapter ? "step" : undefined}
                onClick={() => goTo(step.chapter)}
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
    </section>
  );
}
