"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { trackEvent } from "@/lib/analytics";
import { analyticsName } from "@/lib/analyticsNames";
import { cn } from "@/lib/cn";
import { heroScrollProgress, wallColumns, wallDemos } from "@/lib/demoWall";
import { projects, type Project } from "@/lib/site";
import { DemoSiteModal } from "./DemoSiteModal";
import demo from "./demo.module.css";

const demos = new Map(
  wallDemos.flatMap(({ slug, label }, index) => {
    const project = projects.find((item) => item.slug === slug);
    return project ? [[slug, { ...project, label, position: index + 1 }] as const] : [];
  }),
);

/** Each column repeats its tiles this many times, so its drift loops without a gap. */
const COPIES = 3;

/**
 * Only the first tile of each demo is a link for the keyboard and screen
 * readers; its repeats are the same link for the mouse and touch alone.
 */
const firstTiles = (() => {
  const seen = new Set<string>();
  const first = new Set<string>();
  wallColumns.forEach((column, c) =>
    column.slugs.forEach((slug, row) => {
      if (seen.has(slug)) return;
      seen.add(slug);
      first.add(`${c}-${row}`);
    }),
  );
  return first;
})();

/**
 * The real demos on /free-demo/ and /demo/ as a tilted wall of their
 * screenshots, each column drifting its own way. Scrolling the hero away
 * tips the wall back into the page and lifts its columns at different
 * speeds. Beside the intro it lies behind the whole hero; stacked, it fills
 * the space under the intro. A tile opens its live site in the dialog.
 */
export function DemoWall() {
  const pathname = usePathname();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState<Project | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const hero = scene?.closest("section");
    if (!scene || !hero) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const draw = () => {
      raf = 0;
      const box = hero.getBoundingClientRect();
      scene.style.setProperty("--scroll", heroScrollProgress(box.top, box.height).toFixed(4));
    };
    const update = () => {
      if (!raf && !motion.matches) raf = window.requestAnimationFrame(draw);
    };
    // The drift rests while the wall is off screen.
    const observer = new IntersectionObserver(([entry]) => scene.toggleAttribute("data-off", !entry.isIntersecting));
    observer.observe(scene);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // A plain click opens the live site in the dialog; a modified click opens a new tab, as any link would.
  function open(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const project = demos.get(slug);
    if (!project) return;
    event.preventDefault();
    setOpened(project);
    trackEvent("portfolio_example_clicked", {
      example: slug,
      position: project.position,
      placement: "demo_deck",
      page: pathname ?? "",
    });
  }

  return (
    <>
      <div ref={sceneRef} className={demo.wallScene} data-analytics-section="Demo examples">
        <div className={demo.wallView}>
          <div role="region" aria-label="Real demo websites" className={demo.wall}>
            {wallColumns.map((column, c) => (
              <div
                key={c}
                className={cn(demo.wallColumn, column.shot === "mobile" && demo.wallColumnPhone)}
                style={{ "--lift": column.lift } as CSSProperties}
              >
                <div className={demo.wallTrack} data-drift={column.drift} style={{ animationDuration: `${column.seconds}s` }}>
                  {Array.from({ length: COPIES }, (_, copy) =>
                    column.slugs.map((slug, row) => {
                      const project = demos.get(slug);
                      if (!project) return null;
                      const first = copy === 0 && firstTiles.has(`${c}-${row}`);
                      const desktop = column.shot === "desktop";
                      return (
                        <a
                          key={`${copy}-${row}`}
                          href={project.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          draggable={false}
                          tabIndex={first ? undefined : -1}
                          aria-hidden={first ? undefined : true}
                          aria-label={first ? `View ${project.name}, a real demo website` : undefined}
                          data-analytics-id={analyticsName(`Open ${project.name} demo`)}
                          onClick={(event) => open(event, slug)}
                          className={cn(demo.tile, !desktop && demo.tilePhone)}
                        >
                          <Image
                            src={desktop ? project.screenshots.desktop : project.screenshots.mobile}
                            alt=""
                            width={desktop ? 1600 : 420}
                            height={900}
                            sizes={desktop ? "(min-width: 1024px) 22vw, 42vw" : "(min-width: 1024px) 10vw, 20vw"}
                            draggable={false}
                          />
                          <span className={demo.tileLabel} aria-hidden="true">
                            <span>{project.label}</span>
                            <b>
                              <Icon name="expand" size={10} />
                              View
                            </b>
                          </span>
                        </a>
                      );
                    }),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className={demo.wallTag} aria-hidden="true">
          Real demos we’ve designed
        </p>
      </div>

      <DemoSiteModal project={opened} onClose={() => setOpened(null)} />
    </>
  );
}
