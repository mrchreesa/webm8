"use client";

import type { AnimationEvent, CSSProperties, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { parseTrade } from "@/lib/trades";
import { SketchBlueprint, SketchTemplate, sketchLooks, sketchRequest, type SketchId } from "./SketchTemplates";
import styles from "./sketch.module.css";

const tidy = (value: string) => value.replace(/\s+/g, " ").trim();

/** "Reyes Plumbing & Heating" reads as reyesplumbingandheating.com. */
function domainOf(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
  return `${slug || "yourbusiness"}.com`;
}

/** The build is called in three steps, then done. */
const READY = 3;
const STEP_MS = 550;

type DemoSketchProps = {
  trade: string;
  business: string;
  /** The town or area the visitor serves, for a template that shows it. */
  area?: string;
  /** A template that is not a trade's own, shown once a trade is chosen. */
  template?: SketchId;
  className?: string;
  caption?: string;
};

/**
 * Beside the /free-demo/ and /instant/ forms: a phone that builds a first
 * idea of the visitor's homepage from their answers. Choosing a type of
 * business builds that trade's template (SketchTemplates.tsx) over the last
 * one, lights the stage in its colour and brings out two cards behind the
 * phone; the business name goes on it as it is typed. The phone leans towards
 * a mouse. It is hidden from screen readers; the caption says it is a sketch.
 */
export function DemoSketch({ trade, business, area = "", template, className, caption: captionOverride }: DemoSketchProps) {
  const key = parseTrade(trade);
  const id: SketchId | null = key ? (template ?? key) : null;
  const name = tidy(business);
  const rig = useRef<HTMLDivElement>(null);

  // The last template stays underneath until the new one has faded in over it.
  const [layers, setLayers] = useState<{ top: SketchId | null; under: SketchId | null }>({ top: id, under: null });
  if (layers.top !== id) setLayers({ top: id, under: layers.top });

  function onBuilt(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setLayers((current) => ({ ...current, under: null }));
  }

  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!id) return;
    setStep(0);
    const timers = [1, 2, READY].map((next) => window.setTimeout(() => setStep(next), next * STEP_MS));
    return () => timers.forEach(window.clearTimeout);
  }, [id]);

  function lean(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !rig.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    rig.current.style.setProperty("--ry", `${((event.clientX - box.left) / box.width - 0.5) * 20}deg`);
    rig.current.style.setProperty("--rx", `${(0.5 - (event.clientY - box.top) / box.height) * 10}deg`);
  }

  function settle() {
    rig.current?.style.removeProperty("--ry");
    rig.current?.style.removeProperty("--rx");
  }

  const siteName = name || "Your business";
  const caption = id
    ? `A first sketch for ${name || "your business"}. Your real demo is designed after our call.`
    : "Choose your type of business to see a first sketch of your homepage.";
  const steps = ["Choosing a layout", "Setting your colours", `Adding ${name || "your name"}`, "First idea ready"];

  return (
    <div
      className={cn(styles.sketch, className)}
      data-state={!id ? "idle" : step < READY ? "building" : "ready"}
      style={id ? ({ "--glow": sketchLooks[id].glow } as CSSProperties) : undefined}
      onPointerMove={lean}
      onPointerLeave={settle}
    >
      <p className={styles.caption}>{captionOverride ?? caption}</p>
      <span className={styles.address} aria-hidden="true">
        <i className={styles.dot} />
        <span>{domainOf(name)}</span>
      </span>
      <div ref={rig} className={styles.rig} aria-hidden="true">
        {id ? (
          <>
            <div className={cn(styles.card, styles.cardA)}><i />{sketchRequest(id)}</div>
            <div className={cn(styles.card, styles.cardB)}><i>★★★★★</i>New review</div>
          </>
        ) : null}
        <div className={styles.phone}>
          <div className={styles.screen}>
            <span className={styles.island} />
            {layers.under ? <SketchTemplate key={layers.under} id={layers.under} name={siteName} area={area} /> : <SketchBlueprint name={name} />}
            {id ? <SketchTemplate key={id} id={id} name={siteName} area={area} onAnimationEnd={onBuilt} /> : null}
          </div>
        </div>
      </div>
      {id ? (
        <div className={styles.ticker} aria-hidden="true">
          <i />
          <span>{steps[step]}</span>
        </div>
      ) : null}
    </div>
  );
}
