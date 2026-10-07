"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { projects, workDeckStart } from "@/lib/site";

const hostOf = (url?: string) => (url ? new URL(url).hostname : "webm8agency.com");

const startIndex = Math.max(0, projects.findIndex((project) => project.slug === workDeckStart));

/** The demo sites as a 3D fan. Adding a project to lib/site.ts adds a card. */
export function WorkDeck() {
  const [active, setActive] = useState(startIndex);
  const [narrow, setNarrow] = useState(false);
  const startX = useRef<number | null>(null);
  // A drag that ends on a card must not also count as a click on it.
  const swiped = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 759px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const go = (index: number) => setActive((index + projects.length) % projects.length);
  const current = projects[active];

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    }
  };
  const onPointerDown = (event: PointerEvent) => {
    startX.current = event.clientX;
    swiped.current = false;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (startX.current === null) return;
    const dx = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 40) {
      swiped.current = true;
      go(active + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <section
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
        className="relative mt-12 h-[clamp(260px,44vw,520px)] touch-pan-y [perspective:2000px]"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {projects.map((project, index) => {
          const offset = index - active;
          const distance = Math.abs(offset);
          const isActive = offset === 0;
          return (
            <button
              key={project.slug}
              type="button"
              tabIndex={distance > 2 ? -1 : 0}
              disabled={isActive && !project.siteUrl}
              aria-label={isActive ? `Open the ${project.name} demo site` : `Show ${project.name}`}
              onClick={() => {
                if (swiped.current) {
                  swiped.current = false;
                  return;
                }
                if (!isActive) go(index);
                else if (project.siteUrl) window.open(project.siteUrl, "_blank", "noopener,noreferrer");
              }}
              className="absolute top-0 left-1/2 w-[min(76vw,760px)] cursor-pointer text-left transition-[transform,opacity,filter] duration-700 ease-brand [transform-style:preserve-3d] disabled:cursor-default"
              style={{
                transform: `translateX(${offset * (narrow ? 62 : 44) - 50}%) translateZ(${-distance * (narrow ? 260 : 220)}px) rotateY(${narrow ? 0 : -offset * 24}deg)`,
                opacity: distance > 2 ? 0 : 1 - distance * 0.22,
                filter: distance ? `brightness(${1 - distance * 0.25}) saturate(${1 - distance * 0.3})` : "none",
                zIndex: 10 - distance,
                pointerEvents: distance > 2 ? "none" : undefined,
              }}
            >
              <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_60px_100px_-40px_rgb(0_0_0/0.9)]">
                <div className="flex h-8 items-center gap-1.5 bg-[#e9edf3] px-3">
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <span className="mx-auto h-5 max-w-[280px] flex-1 truncate rounded-md bg-white text-center font-mono text-[10.5px] leading-5 text-[#6b7280]">
                    {hostOf(project.siteUrl)}
                  </span>
                </div>
                <div className="relative aspect-[16/9.2] overflow-hidden">
                  <Image
                    src={project.screenshots.desktop}
                    alt=""
                    fill
                    draggable={false}
                    sizes="(min-width: 1024px) 760px, 76vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="absolute right-[-3%] bottom-[-8%] w-[19%] rounded-2xl bg-[#0b1220] p-1 shadow-[0_30px_50px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10 [transform:translateZ(60px)]">
                <div className="relative aspect-[9/19] overflow-hidden rounded-xl">
                  <Image src={project.screenshots.mobile} alt="" fill draggable={false} sizes="150px" className="object-cover object-top" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="container-page mt-18 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
        <div aria-live="polite">
          <p className="text-sm font-medium text-muted-invert">{current.industry}</p>
          <h3 className="mt-1 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-none font-bold tracking-[-0.03em]">
            {current.name}
          </h3>
          <p className="mt-3 max-w-xl text-muted-invert">{current.description}</p>
          {current.siteUrl ? (
            <a
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
            <button
              key={project.slug}
              type="button"
              aria-pressed={index === active}
              onClick={() => go(index)}
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
