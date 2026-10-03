"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { teamArms, type TeamArm } from "@/lib/site";

/** Tentacle tips of /mascot.png as fractions of its box, left side (right is mirrored). */
const TIPS = [
  [0.1, 0.47],
  [0.08, 0.65],
  [0.25, 0.81],
  [0.37, 0.87],
] as const;

export function EightArms() {
  const stageRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [lit, setLit] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const mascot = mascotRef.current;
    if (!stage || !mascot || window.innerWidth < 1024) {
      setPaths([]);
      return;
    }
    const s = stage.getBoundingClientRect();
    const m = mascot.getBoundingClientRect();
    setBox({ width: s.width, height: s.height });
    setPaths(
      teamArms.map((_, index) => {
        const item = itemRefs.current[index];
        if (!item) return "";
        const r = item.getBoundingClientRect();
        const left = index < 4;
        const [tx, ty] = TIPS[index % 4];
        const sx = m.left - s.left + m.width * (left ? tx : 1 - tx);
        const sy = m.top - s.top + m.height * ty;
        const ex = left ? r.right - s.left + 6 : r.left - s.left - 6;
        const ey = r.top - s.top + r.height / 2;
        const dir = left ? -1 : 1;
        return `M${sx.toFixed(1)} ${sy.toFixed(1)} C ${(sx + dir * 70).toFixed(1)} ${sy.toFixed(1)}, ${(ex - dir * 70).toFixed(1)} ${ey.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      }),
    );
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          reveal.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    reveal.observe(stage);
    return () => {
      resize.disconnect();
      reveal.disconnect();
    };
  }, [measure]);

  const list = (items: TeamArm[], offset: number) => (
    <ul className="relative z-10 grid gap-3.5 lg:gap-8">
      {items.map((arm, j) => {
        const index = offset + j;
        return (
          <li
            key={arm.title}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            onPointerEnter={() => setLit(index)}
            onPointerLeave={() => setLit(null)}
            className={cn(
              "rounded-2xl px-4.5 py-4 ring-1 ring-inset transition-colors",
              offset === 0 && "lg:text-right",
              lit === index ? "bg-brand/6 ring-brand/40" : "bg-white/[0.03] ring-white/6",
            )}
          >
            <h3 className="text-[1.06rem] font-semibold">{arm.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-invert">{arm.body}</p>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section id="included" aria-labelledby="arms-title" className="surface-dark bg-ink-deep py-28 text-white md:py-36">
      <div className="container-page">
        <header className="mx-auto mb-14 max-w-2xl text-center">
          <h2 id="arms-title" className="text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] font-bold">
            Eight arms. One team.
          </h2>
          <p className="mt-4 text-lg text-muted-invert">
            Everything your website needs, handled by the same people for as long as you&apos;re with us. You never have to chase three different companies.
          </p>
        </header>

        <div ref={stageRef} className="relative grid gap-7 lg:grid-cols-[1fr_340px_1fr] lg:items-center lg:gap-10">
          {paths.length > 0 && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible lg:block"
              viewBox={`0 0 ${box.width} ${box.height}`}
            >
              {paths.map((d, index) =>
                d ? (
                  <path
                    key={index}
                    d={d}
                    pathLength={1}
                    fill="none"
                    strokeLinecap="round"
                    style={{
                      stroke: lit === index ? "var(--color-brand)" : "rgb(111 155 255 / 0.42)",
                      strokeWidth: lit === index ? 2.5 : 2,
                      filter: lit === index ? "drop-shadow(0 0 6px rgb(212 255 53 / 0.7))" : undefined,
                      strokeDasharray: 1,
                      strokeDashoffset: drawn ? 0 : 1,
                      transition: `stroke-dashoffset 1.4s var(--ease-brand) ${index * 90}ms, stroke 0.3s, stroke-width 0.3s`,
                    }}
                  />
                ) : null,
              )}
            </svg>
          )}
          {list(teamArms.slice(0, 4), 0)}
          <div ref={mascotRef} className="relative z-10 mx-auto w-44 max-lg:order-first lg:w-[300px]">
            <Image
              src="/mascot.png"
              alt="The WebM8 octopus"
              width={1254}
              height={1254}
              sizes="(min-width: 1024px) 300px, 176px"
              className="animate-float h-auto w-full drop-shadow-[0_30px_60px_rgb(43_108_252/0.45)]"
            />
          </div>
          {list(teamArms.slice(4), 4)}
        </div>
      </div>
    </section>
  );
}
