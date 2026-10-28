import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { layoutFor } from "./layout.ts";
import { Header } from "./parts/Header.tsx";
import { reelProjects } from "./reel.ts";
import { DeckBeat } from "./scenes/DeckBeat.tsx";
import { EndCard } from "./scenes/EndCard.tsx";
import { Hook } from "./scenes/Hook.tsx";
import { SiteScene } from "./scenes/SiteScene.tsx";
import { color, navyGround } from "./theme.ts";
import { DECK, END, HOOK, SITE_COUNT, SITES, length, siteSlot, siteSpan } from "./timeline.ts";

const projects = reelProjects();

/** The whole reel. Every beat's timing comes from timeline.ts; the format picks the layout. */
export function Showreel() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const layout = layoutFor(width, height);
  const onSites = frame >= SITES.from && frame < DECK.to;
  const current = Array.from({ length: SITE_COUNT }, (_, i) => i).find((i) => frame < siteSlot(i).to && frame >= siteSlot(i).from);

  return (
    <AbsoluteFill style={{ background: color.night }}>
      <Sequence from={HOOK.from} durationInFrames={length(HOOK)}>
        <Hook layout={layout} />
      </Sequence>

      {onSites ? (
        <AbsoluteFill style={{ background: navyGround }}>
          <div
            style={{
              position: "absolute",
              left: layout.browser.x + layout.browser.width * 0.2,
              top: layout.browser.y,
              width: layout.browser.width,
              height: layout.browser.width,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color.electric}55 0%, transparent 65%)`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {projects.map((project, i) => (
        <Sequence key={project.slug} from={siteSpan(i).from} durationInFrames={length(siteSpan(i))} premountFor={20}>
          <SiteScene index={i} project={project} layout={layout} />
        </Sequence>
      ))}

      <Sequence from={DECK.from} durationInFrames={length(DECK)} premountFor={20}>
        <DeckBeat projects={projects} layout={layout} />
      </Sequence>

      {onSites ? (
        <Header
          margin={layout.margin}
          size={layout.headerSize}
          count={current === undefined ? undefined : `${String(current + 1).padStart(2, "0")} / ${String(SITE_COUNT).padStart(2, "0")}`}
        />
      ) : null}

      <Sequence from={END.from} durationInFrames={length(END)}>
        <EndCard layout={layout} />
      </Sequence>
    </AbsoluteFill>
  );
}
