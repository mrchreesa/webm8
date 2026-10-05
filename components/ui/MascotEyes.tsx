"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";

/** Coordinates are in the 1254×1254 space of /mascot.png. */
const VIEW = 1254;
const EYES = [
  { cx: 470, rest: 18 },
  { cx: 780, rest: -18 },
] as const;
const EYE_Y = 506;

/** The mascot, with eyes that follow the pointer and blink. Decorative. */
export function MascotEyes({
  className,
  sizes = "200px",
  priority = false,
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const irises = [...root.querySelectorAll<SVGGElement>("[data-iris]")];
    const lids = [...root.querySelectorAll<SVGRectElement>("[data-lid]")];

    let blinkTimer = 0;
    let openTimer = 0;
    const blink = () => {
      lids.forEach((lid) => {
        lid.style.transition = "transform 90ms ease-in";
        lid.style.transform = "scaleY(1)";
      });
      openTimer = window.setTimeout(() => {
        lids.forEach((lid) => {
          lid.style.transition = "transform 140ms ease-out";
          lid.style.transform = "scaleY(0)";
        });
      }, 120);
      blinkTimer = window.setTimeout(blink, 2600 + Math.random() * 3200);
    };
    blinkTimer = window.setTimeout(blink, 2400);

    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const scale = box.width / VIEW;
      irises.forEach((iris, index) => {
        const dx = event.clientX - (box.left + EYES[index].cx * scale);
        const dy = event.clientY - (box.top + EYE_Y * scale);
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, distance / 220);
        iris.style.transform = `translate(${((dx / distance) * 26 * reach).toFixed(1)}px, ${((dy / distance) * 28 * reach).toFixed(1)}px)`;
      });
    };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(openTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)} aria-hidden="true">
      <Image src="/mascot.png" alt="" width={VIEW} height={VIEW} sizes={sizes} priority={priority} className="h-auto w-full" />
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`${uid}-white`} cx="50%" cy="62%" r="62%">
            <stop offset=".72" stopColor="#fff" />
            <stop offset="1" stopColor="#d9e3f7" />
          </radialGradient>
          <radialGradient id={`${uid}-iris`} cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#3f74ff" />
            <stop offset=".8" stopColor="#1f49d6" />
            <stop offset="1" stopColor="#16359f" />
          </radialGradient>
          <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2463f6" />
            <stop offset="1" stopColor="#3b7cfb" />
          </linearGradient>
          {EYES.map((eye) => (
            <clipPath key={eye.cx} id={`${uid}-clip-${eye.cx}`}>
              <ellipse cx={eye.cx} cy={EYE_Y} rx="86" ry="99" />
            </clipPath>
          ))}
        </defs>
        {EYES.map((eye) => (
          <g key={eye.cx} clipPath={`url(#${uid}-clip-${eye.cx})`}>
            <ellipse cx={eye.cx} cy={EYE_Y} rx="88" ry="101" fill={`url(#${uid}-white)`} />
            <g data-iris style={{ transform: `translate(${eye.rest}px, 4px)`, transition: "transform 180ms ease-out" }}>
              <ellipse cx={eye.cx} cy={EYE_Y + 8} rx="58" ry="65" fill={`url(#${uid}-iris)`} />
              <ellipse cx={eye.cx} cy={EYE_Y + 12} rx="39" ry="46" fill="#090f2d" />
              <circle cx={eye.cx + 17} cy={EYE_Y - 12} r="15" fill="#fff" />
            </g>
            <rect
              data-lid
              x={eye.cx - 90}
              y="400"
              width="180"
              height="214"
              fill={`url(#${uid}-lid)`}
              style={{ transform: "scaleY(0)", transformOrigin: `${eye.cx}px 405px` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
