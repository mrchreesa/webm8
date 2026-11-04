import Image from "next/image";
import type { CSSProperties, MouseEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { analyticsName } from "@/lib/analyticsNames";
import { cn } from "@/lib/cn";
import { wallColumns, wallDemos } from "@/lib/demoWall";
import { projects } from "@/lib/site";
import wall from "./wall.module.css";

export const wallProjects = new Map(
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

type DemoWallTilesProps = {
  /** Places the view on its page. */
  className?: string;
  /** Makes each tile a link to its live site, handed here when clicked. Without it the wall is only a picture. */
  onOpen?: (event: MouseEvent<HTMLAnchorElement>, slug: string) => void;
};

/**
 * The tilted wall of real demos (styled by wall.module.css): on /free-demo/
 * and /demo/ a way into each live site (DemoWall), and behind the homepage
 * hero a backdrop (HomeStory).
 */
export function DemoWallTiles({ className, onOpen }: DemoWallTilesProps) {
  return (
    <div className={cn(wall.view, className)} aria-hidden={onOpen ? undefined : true}>
      <div role={onOpen ? "region" : undefined} aria-label={onOpen ? "Real demo websites" : undefined} className={wall.wall}>
        {wallColumns.map((column, c) => (
          <div key={c} className={cn(wall.column, column.shot === "mobile" && wall.columnPhone)} style={{ "--lift": column.lift } as CSSProperties}>
            <div className={wall.track} data-drift={column.drift} style={{ animationDuration: `${column.seconds}s` }}>
              {Array.from({ length: COPIES }, (_, copy) =>
                column.slugs.map((slug, row) => {
                  const project = wallProjects.get(slug);
                  if (!project) return null;
                  const desktop = column.shot === "desktop";
                  const className = cn(wall.tile, !desktop && wall.tilePhone);
                  const image = (
                    <Image
                      src={desktop ? project.screenshots.desktop : project.screenshots.mobile}
                      alt=""
                      width={desktop ? 1600 : 420}
                      height={900}
                      sizes={desktop ? "(min-width: 1024px) 22vw, 42vw" : "(min-width: 1024px) 10vw, 20vw"}
                      fetchPriority="low"
                      draggable={false}
                    />
                  );
                  if (!onOpen) return <span key={`${copy}-${row}`} className={className}>{image}</span>;
                  const first = copy === 0 && firstTiles.has(`${c}-${row}`);
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
                      onClick={(event) => onOpen(event, slug)}
                      className={className}
                    >
                      {image}
                      <span className={wall.tileLabel} aria-hidden="true">
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
  );
}
