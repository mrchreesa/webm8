"use client";

import { useEffect, useRef } from "react";
import { nearestTurn, springStep } from "@/lib/demoDeck";
import type { DemoRingScene } from "./ring3d";
import demo from "./demo.module.css";

/** Interactions that mean the visitor is here: start the 3D at once. */
const FIRST_TOUCH = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;
/** Otherwise the 3D starts this long after the page has loaded, once the browser is idle. */
const SCENE_DELAY_MS = 2500;
/** How briskly the ring glides to the next demo (radians per second of the spring). */
const STIFFNESS = 7;

function whenIdle(callback: () => void) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  // Safari has no requestIdleCallback.
  const id = globalThis.setTimeout(callback, 300);
  return () => globalThis.clearTimeout(id);
}

/** Whether this browser can draw the 3D ring at all. */
export function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type DemoRingProps = {
  /** The deck's front card; the ring glides to it. */
  active: number;
  slugs: readonly string[];
  /** Called once the ring is ready to replace the card deck. */
  onReady: () => void;
};

/**
 * The 3D ring of demos behind the card deck (DemoDeck), on a canvas filling
 * the deck's stage. The deck keeps every control, link and label; this only
 * draws. It is never mounted under prefers-reduced-motion.
 */
export function DemoRing({ active, slugs, onReady }: DemoRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const kickRef = useRef<() => void>(() => {});
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    activeRef.current = active;
    kickRef.current();
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const stage = canvas.parentElement!;
    if (!webglAvailable()) return;
    let scene: DemoRingScene | null = null;
    let disposed = false;
    let raf = 0;
    let running = true;
    let position = activeRef.current;
    let velocity = 0;
    let last = 0;
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const wideQuery = window.matchMedia("(min-width: 1024px)");

    const frame = (now: number) => {
      raf = 0;
      if (!scene || !running) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      // A critically damped spring towards the front card, the short way round.
      const target = nearestTurn(position, activeRef.current, slugs.length);
      [position, velocity] = springStep(position - target, velocity, STIFFNESS, dt);
      position += target;
      tilt.x += (tilt.tx - tilt.x) * 0.08;
      tilt.y += (tilt.ty - tilt.y) * 0.08;
      const box = stage.getBoundingClientRect();
      const lift = Math.min(1, Math.max(0, -box.top / Math.max(1, window.innerHeight)));
      scene.render(position, tilt, lift);
      const moving = Math.abs(position - target) > 1e-4 || Math.abs(velocity) > 1e-4;
      const settling = Math.abs(tilt.tx - tilt.x) > 0.002 || Math.abs(tilt.ty - tilt.y) > 0.002;
      if (moving || settling) kick();
      else {
        position = target;
        velocity = 0;
        last = 0;
      }
    };
    const kick = () => {
      if (running && !raf) raf = window.requestAnimationFrame(frame);
    };
    kickRef.current = () => {
      scene?.loadAround(activeRef.current);
      kick();
    };

    const resize = () => {
      scene?.resize(canvas.clientWidth, canvas.clientHeight, wideQuery.matches, window.devicePixelRatio || 1);
      kick();
    };
    const observer = new ResizeObserver(resize);
    const onScreen = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !document.hidden;
      if (running) kick();
    });
    const pointer = (event: PointerEvent) => {
      if (!finePointer) return;
      tilt.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      tilt.ty = (event.clientY / window.innerHeight - 0.5) * 2;
      kick();
    };

    let started = false;
    let cancelIdle = () => {};
    const start = () => {
      if (started || disposed) return;
      started = true;
      cancelIdle();
      for (const type of FIRST_TOUCH) window.removeEventListener(type, start);
      void import("./ring3d")
        .then(({ createDemoRing }) => {
          if (disposed) return;
          scene = createDemoRing(canvas, slugs, kick);
          resize();
          scene.loadAround(activeRef.current);
          void scene.ready.then(() => {
            if (disposed) return;
            position = activeRef.current;
            readyRef.current();
            kick();
          });
          observer.observe(canvas);
          onScreen.observe(stage);
          window.addEventListener("pointermove", pointer, { passive: true });
          window.addEventListener("scroll", kick, { passive: true });
        })
        .catch(() => {
          // No 3D (a failed download): the card deck stays as it is.
        });
    };
    for (const type of FIRST_TOUCH) window.addEventListener(type, start, { passive: true });
    const afterLoad = () => {
      const timer = globalThis.setTimeout(() => (cancelIdle = whenIdle(start)), SCENE_DELAY_MS);
      cancelIdle = () => globalThis.clearTimeout(timer);
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    return () => {
      disposed = true;
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      cancelIdle();
      observer.disconnect();
      onScreen.disconnect();
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("load", afterLoad);
      for (const type of FIRST_TOUCH) window.removeEventListener(type, start);
      scene?.dispose();
    };
  }, [slugs]);

  return <canvas ref={canvasRef} className={demo.ringCanvas} aria-hidden="true" />;
}
