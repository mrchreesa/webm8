"use client";

import type { AnimationEvent } from "react";
import { useState } from "react";
import { StatusBar } from "@/components/home/story/StatusBar";
import { SketchSite } from "@/components/home/story/TradeSite";
import { cn } from "@/lib/cn";
import { initialOf, parseTrade, trades, type TradeKey } from "@/lib/trades";
import styles from "./demo.module.css";

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

/** The empty page the phone shows until a type of business is chosen. */
function Wireframe({ name }: { name: string }) {
  return (
    <div className={styles.wire}>
      <StatusBar time="9:41" />
      <div className={styles.wireNav}>
        <i className={styles.wireMark}>{name ? initialOf(name) : null}</i>
        {name ? <b>{name}</b> : <span className={styles.wireBar} style={{ width: "34cqi" }} />}
      </div>
      <div className={styles.wireBody}>
        <span className={styles.wirePicture} />
        <span className={styles.wireBar} style={{ width: "80cqi", height: "7cqi" }} />
        <span className={styles.wireBar} style={{ width: "56cqi", height: "7cqi" }} />
        <span className={styles.wireBar} style={{ width: "84cqi" }} />
        <span className={styles.wireBar} style={{ width: "64cqi" }} />
        <span className={styles.wireButton} />
      </div>
    </div>
  );
}

type DemoSketchProps = { trade: string; business: string; className?: string };

/**
 * Beside the /free-demo/ form, and between its two parts on a phone: a phone
 * that sketches the visitor's homepage from their answers. Choosing a type of
 * business draws that trade's example site (components/home/story) over the
 * last one; the business name goes on it as it is typed. The phone
 * is hidden from screen readers; the caption says it is a sketch, not the demo.
 */
export function DemoSketch({ trade, business, className }: DemoSketchProps) {
  const key = parseTrade(trade);
  const name = tidy(business);

  // The last trade stays underneath until the new one has drawn over it.
  const [layers, setLayers] = useState<{ top: TradeKey | null; under: TradeKey | null }>({ top: key, under: null });
  if (layers.top !== key) setLayers({ top: key, under: layers.top });

  function onDrawn(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setLayers((current) => ({ ...current, under: null }));
  }

  const siteName = name || "Your business";
  const caption = key
    ? `A first sketch for ${name || "your business"}. Your real demo is designed after our call.`
    : "Choose your type of business to see a first sketch of your homepage.";

  return (
    <div className={cn(styles.sketch, className)}>
      <p className={styles.caption}>{caption}</p>
      <span className={styles.address} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <span>{domainOf(name)}</span>
      </span>
      <div className={styles.phone} aria-hidden="true">
        <div className={styles.screen}>
          <span className={styles.island} />
          {layers.under ? (
            <SketchSite key={layers.under} trade={trades[layers.under]} name={siteName} className={styles.sketchSite} />
          ) : (
            <Wireframe name={name} />
          )}
          {key ? (
            <>
              <SketchSite
                key={key}
                trade={trades[key]}
                name={siteName}
                className={cn(styles.sketchSite, styles.draw)}
                onAnimationEnd={onDrawn}
              />
              <i key={`scan-${key}`} className={styles.scan} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
