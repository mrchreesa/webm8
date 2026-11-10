"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { DeviceStage } from "./deviceStage";

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * A Work page demo as a real 3D laptop and phone. On a laptop with a mouse,
 * the lid opens as the demo scrolls into view and the pair turns with the
 * pointer. Everywhere else (phones, reduced motion, no WebGL) the flat
 * mockup passed as children is what shows.
 *
 * Where the 3D will show, the mockup is hidden by CSS from the first paint,
 * so its picture is never seen first; it still holds the space and the link
 * to the live site. The laptop appears only once it is built and both of its
 * screenshots have arrived, and its lid opens from there.
 */
const WILL_BE_3D = "[@media(min-width:1024px)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:opacity-0";

export function WorkDevices({ desktop, mobile, children }: { desktop: string; mobile: string; children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawn, setDrawn] = useState(false);
  /** No 3D after all (no WebGL, or it failed to load): show the mockup. */
  const [flat, setFlat] = useState(false);

  useEffect(() => {
    const box = boxRef.current!, canvas = canvasRef.current!;
    // The same test as WILL_BE_3D: outside it the mockup is already showing.
    if (!window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    if (!webglAvailable()) {
      setFlat(true);
      return;
    }

    let stage: DeviceStage | null = null;
    let stopListening = () => {};
    let disposed = false;
    let raf = 0;
    let last = 0;
    let inView = false;
    let ready = false;
    let wantOpen = false;
    const now = { open: 0, x: 0, y: 0 };
    const goal = { open: 0, x: 0, y: 0 };

    // Draw only while something is still moving: the lid, the turn, or a screenshot arriving.
    const kick = () => {
      if (!raf && stage && inView) raf = window.requestAnimationFrame(frame);
    };
    const frame = (time: number) => {
      raf = 0;
      if (disposed || !stage) return;
      const step = Math.min(1, (last ? Math.min(50, time - last) : 16) / 220);
      last = time;
      now.open += (goal.open - now.open) * step * 0.6;
      now.x += (goal.x - now.x) * step;
      now.y += (goal.y - now.y) * step;
      const shown = stage.draw({ canvas, desktop, mobile, open: now.open, tiltX: now.x, tiltY: now.y });
      if (shown && !ready) {
        // First sight of the laptop: it starts shut, and opens if it is properly on screen.
        ready = true;
        setDrawn(true);
        if (wantOpen) goal.open = 1;
      }
      const moving = Math.abs(goal.open - now.open) > 0.002 || Math.abs(goal.x - now.x) > 0.002 || Math.abs(goal.y - now.y) > 0.002;
      if (moving) kick();
      else last = 0;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (!inView) return;
        // Open once it is properly on screen; the 3D itself loads a little before that.
        if (entry.intersectionRatio > 0.45) {
          wantOpen = true;
          if (ready) goal.open = 1;
        }
        if (stage) return kick();
        void import("./deviceStage").then(({ deviceStage }) => {
          if (disposed) return;
          stage = deviceStage();
          stopListening = stage.onLoad(kick);
          kick();
        }).catch(() => {
          // No 3D (a failed download): the flat mockup shows instead.
          if (!disposed) setFlat(true);
        });
      },
      { rootMargin: "200px 0px", threshold: [0, 0.45] },
    );
    observer.observe(box);

    const move = (event: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      goal.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      goal.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      kick();
    };
    const leave = () => {
      goal.x = goal.y = 0;
      kick();
    };
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", leave);
    window.addEventListener("resize", kick);

    return () => {
      disposed = true;
      if (raf) window.cancelAnimationFrame(raf);
      observer.disconnect();
      stopListening();
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", kick);
    };
  }, [desktop, mobile]);

  return (
    <div ref={boxRef} className="relative">
      <div className={flat ? undefined : WILL_BE_3D}>{children}</div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn("pointer-events-none absolute -inset-x-[10%] -inset-y-[14%] h-[128%] w-[120%] transition-opacity duration-500", drawn ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
