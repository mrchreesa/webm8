import { Img } from "remotion";
import { easeInOut } from "../../timeline.ts";
import type { RoundStory } from "../story.ts";
import { length, type Round } from "../timeline.ts";
import { StatusBar } from "./ui.tsx";

const STATUS = 46;

/** How far the site has scrolled at a frame, in CSS px. */
export function siteScrollAt(story: RoundStory, round: Round, frame: number): number {
  const t = Math.min(1, Math.max(0, (frame - round.scroll.from) / length(round.scroll)));
  return story.shot.scroll * easeInOut(t);
}

/** Where the site's main button sits on screen at a scroll, in CSS px. */
export function siteButtonAt(story: RoundStory, scrollY: number): { x: number; y: number } {
  return { x: story.shot.button.x, y: STATUS + story.shot.button.y - scrollY };
}

/** The business's real site, from its tall phone capture: it scrolls under its own pinned header. */
export function SiteScreen({ story, image, scrollY }: { story: RoundStory; image: string; scrollY: number }) {
  const { shot } = story;
  const width = shot.width / 2;
  return (
    <div style={{ position: "absolute", inset: 0, background: shot.top }}>
      <StatusBar time="9:41" color="#fff" />
      <div style={{ position: "absolute", top: STATUS, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <Img src={image} style={{ position: "absolute", top: -scrollY, left: 0, width }} />
        {shot.header ? (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: shot.header, overflow: "hidden" }}>
            <Img src={image} style={{ position: "absolute", top: 0, left: 0, width }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
