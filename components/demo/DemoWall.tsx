"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { heroScrollProgress } from "@/lib/demoWall";
import type { Project } from "@/lib/site";
import { DemoSiteModal } from "./DemoSiteModal";
import { DemoWallTiles, wallProjects } from "./DemoWallTiles";
import demo from "./demo.module.css";

/**
 * The real demos on /free-demo/ and /demo/ as a tilted wall of their
 * screenshots (DemoWallTiles), each column drifting its own way. Scrolling
 * the hero away tips the wall back into the page and lifts its columns at
 * different speeds. Beside the intro it lies behind the whole hero; stacked,
 * it fills the space under the intro. A tile opens its live site in the dialog.
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
    const project = wallProjects.get(slug);
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
        <DemoWallTiles className={demo.wallView} onOpen={open} />
        <p className={demo.wallTag} aria-hidden="true">
          Real demos we’ve designed
        </p>
      </div>

      <DemoSiteModal project={opened} onClose={() => setOpened(null)} />
    </>
  );
}
