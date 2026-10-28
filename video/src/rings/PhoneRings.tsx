import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { mix, punch } from "../motion.ts";
import { PhoneFrame, type Screen } from "../parts/PhoneFrame.tsx";
import { color, font, navyGround } from "../theme.ts";
import { easeInOut } from "../timeline.ts";
import { cameraAt, cameraKeys, viewOf } from "./camera.ts";
import { phoneCaptureOf } from "./images.ts";
import { ringsLayoutFor, type RingsLayout } from "./layout.ts";
import { FormSheet, sendButtonAt } from "./screens/FormScreen.tsx";
import { LockScreen, NotificationCard } from "./screens/LockScreen.tsx";
import { SEARCH_TEXT, SearchScreen, WEBSITE_CHIP } from "./screens/SearchScreen.tsx";
import { SiteScreen, siteButtonAt, siteScrollAt } from "./screens/SiteScreen.tsx";
import { SCREEN_CSS_WIDTH, Scaled, Tap } from "./screens/ui.tsx";
import { copy, enquiryOf, pile, roundStories, type RoundStory } from "./story.ts";
import {
  CLOSE,
  CLOSE_CUES,
  STACK,
  captions,
  rounds,
  shakeAt,
  stackCardLands,
  type Round,
  type Span,
} from "./timeline.ts";

const stories = roundStories();
const cards = pile();
const inside = (frame: number, span: Span) => frame >= span.from && frame < span.to;

/** "The phone rings": three customers find a business and ask for a quote, each faster, then the enquiries pile up. */
export function PhoneRings() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const layout = ringsLayoutFor(width, height);
  if (frame >= CLOSE.from) return <Close frame={frame} layout={layout} />;

  const index = rounds.findIndex((round) => inside(frame, round.span));
  const round = rounds[index];
  // The ground turns neon as the phone turns round to the owner, and stays neon for the pile.
  const neon = round ? frame >= round.flip.from + 3 : inside(frame, STACK);
  const shake = shakeAt(frame);

  return (
    <AbsoluteFill style={{ background: neon ? color.brand : navyGround }}>
      <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}>
        {round ? <RoundPhone round={round} story={stories[index]} frame={frame} layout={layout} /> : <Pile frame={frame} layout={layout} />}
        <Caption frame={frame} layout={layout} neon={neon} />
        {round && frame >= round.lands ? <BigCard round={round} story={stories[index]} frame={frame} layout={layout} /> : null}
      </AbsoluteFill>
      <Footnote layout={layout} neon={neon} />
    </AbsoluteFill>
  );
}

function RoundPhone({ round, story, frame, layout }: { round: Round; story: RoundStory; frame: number; layout: RingsLayout }) {
  const { phone } = layout;
  const flipping = inside(frame, round.flip);
  const turned = frame >= round.flip.from + 3;
  const angle = flipping ? (turned ? 90 * (1 - (frame - round.flip.from - 3) / 3) : 90 * ((frame - round.flip.from + 1) / 3)) : 0;
  return (
    <div style={{ position: "absolute", left: phone.x, top: phone.y, perspective: 1800 }}>
      <div style={{ transform: `rotateY(${angle}deg)` }}>
        <PhoneFrame width={phone.width} height={phone.height}>
          {(screen) =>
            turned ? (
              <Scaled screenWidth={screen.width} screenHeight={screen.height}>
                <LockScreen enquiry={enquiryOf(story.trade.key)} frame={frame} lands={round.lands} />
              </Scaled>
            ) : (
              <CustomerScreen round={round} story={story} frame={frame} screen={screen} />
            )
          }
        </PhoneFrame>
      </div>
    </div>
  );
}

/** What the customer sees, with the camera (camera.ts) following what they do. */
function CustomerScreen({ round, story, frame, screen }: { round: Round; story: RoundStory; frame: number; screen: Screen }) {
  const k = screen.width / SCREEN_CSS_WIDTH;
  const cssHeight = screen.height / k;
  const image = phoneCaptureOf(story.project);
  const onSearch = frame < round.site.from;
  const onSite = !onSearch && frame < round.form.from;
  const scrollY = siteScrollAt(story, round, frame);
  const tap = onSearch
    ? { at: round.tapResult, ...WEBSITE_CHIP }
    : onSite
      ? { at: round.tapButton, ...siteButtonAt(story, scrollY) }
      : { at: round.tapSend, ...sendButtonAt(cssHeight) };
  const keys = cameraKeys(
    round,
    {
      searchBar: SEARCH_TEXT,
      topResult: { x: 150, y: WEBSITE_CHIP.y - 35 },
      websiteChip: WEBSITE_CHIP,
      siteButton: siteButtonAt(story, story.shot.scroll),
      sheet: { x: 195, y: cssHeight - 250 },
      sendButton: sendButtonAt(cssHeight),
    },
    cssHeight,
  );
  const view = viewOf(cameraAt(frame, keys), SCREEN_CSS_WIDTH, cssHeight);

  return (
    <Scaled screenWidth={screen.width} screenHeight={screen.height}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`, transformOrigin: "0 0" }}>
        {onSearch ? (
          <SearchScreen story={story} round={round} frame={frame} />
        ) : (
          <SiteScreen story={story} image={image} scrollY={scrollY} />
        )}
        {!onSearch && !onSite ? <FormSheet story={story} round={round} frame={frame} /> : null}
        <Tap x={tap.x} y={tap.y} frame={frame} at={tap.at} />
      </div>
    </Scaled>
  );
}

function Caption({ frame, layout, neon }: { frame: number; layout: RingsLayout; neon: boolean }) {
  const caption = captions().find((c) => inside(frame, c.span));
  if (!caption) return null;
  const text = caption.key === "need" ? stories[caption.round ?? 0].trade.need : copy[caption.key];
  const landed = punch(frame, caption.span.from, 8, 11);
  const box = caption.key === "stack" ? layout.stackCaption : layout.caption;
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
        display: "flex",
        alignItems: "center",
        justifyContent: box.align === "center" ? "center" : "flex-start",
      }}
    >
      <div
        style={{
          color: neon ? color.brandInk : color.white,
          fontFamily: font.display,
          fontWeight: 700,
          fontSize: box.size,
          lineHeight: 0.95,
          letterSpacing: "-0.035em",
          textAlign: box.align,
          transform: `scale(${mix(1.22, 1, landed)})`,
          transformOrigin: box.align === "center" ? "50% 50%" : "0 50%",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** The enquiry bursting out of the phone, big enough to read in a feed. */
function BigCard({ round, story, frame, layout }: { round: Round; story: RoundStory; frame: number; layout: RingsLayout }) {
  const { x, y, width } = layout.bigCard;
  const landed = punch(frame, round.lands, 10, 9);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 358,
        transform: `translateY(${mix(-120, 0, landed)}px) rotate(${mix(-8, -2, landed)}deg) scale(${(width / 358) * mix(1.4, 1, landed)})`,
        transformOrigin: "0 0",
        filter: "drop-shadow(0 30px 40px rgba(7, 26, 51, 0.35))",
      }}
    >
      <NotificationCard enquiry={enquiryOf(story.trade.key)} />
    </div>
  );
}

/** Where each card settles on the pile: a little to one side, a little turned, each higher than the last. */
const CARD_JITTER = [
  { x: -40, r: -5 },
  { x: 45, r: 4 },
  { x: -15, r: -2 },
  { x: 30, r: 6 },
  { x: -50, r: -4 },
  { x: 20, r: 2 },
  { x: -25, r: -6 },
  { x: 40, r: 3 },
  { x: 0, r: -1 },
];

function Pile({ frame, layout }: { frame: number; layout: RingsLayout }) {
  const { phone, pile: at } = layout;
  const last = rounds[rounds.length - 1];
  const falling = easeInOut(Math.min(1, (frame - STACK.from) / 10));
  const scale = at.cardWidth / 358;
  const rise = at.cardRise;
  return (
    <>
      {falling < 1 ? (
        <div style={{ position: "absolute", left: phone.x, top: phone.y, transform: `translateY(${falling * layout.height}px) rotate(${falling * 12}deg)` }}>
          <PhoneFrame width={phone.width} height={phone.height}>
            {(screen) => (
              <Scaled screenWidth={screen.width} screenHeight={screen.height}>
                <LockScreen enquiry={enquiryOf(stories[stories.length - 1].trade.key)} frame={frame} lands={last.lands} />
              </Scaled>
            )}
          </PhoneFrame>
        </div>
      ) : null}
      {cards.map((card, k) => {
        if (frame < stackCardLands(k)) return null;
        const landed = punch(frame, stackCardLands(k), 8, 10);
        const { x, r } = CARD_JITTER[k];
        const from = k % 2 === 0 ? -1 : 1;
        return (
          <div
            key={card.key}
            style={{
              position: "absolute",
              left: at.centreX - 179,
              top: at.centreY + (cards.length / 2 - k) * rise - 60,
              width: 358,
              transform: `translate(${x + mix(from * layout.width, 0, landed)}px, 0) rotate(${mix(r * 4, r, landed)}deg) scale(${scale})`,
            }}
          >
            <NotificationCard enquiry={card} />
          </div>
        );
      })}
    </>
  );
}

/** Hard cut to navy: "Your phone could be next.", the button, the address. Still from CLOSE_STILL_FROM. */
function Close({ frame, layout }: { frame: number; layout: RingsLayout }) {
  const { headlineSize, buttonSize, addressSize } = layout.close;
  const headline = punch(frame, CLOSE_CUES.headline.from, 18, 8);
  const button = punch(frame, CLOSE_CUES.button.from, 16, 9);
  const address = easeInOut(Math.min(1, Math.max(0, (frame - CLOSE_CUES.address.from) / 12)));
  const pulse = Math.min(1, Math.max(0, (frame - CLOSE_CUES.pulse.from) / 10));
  const pulsing = inside(frame, CLOSE_CUES.pulse);
  const lines = copy.closeHeadline;
  return (
    <AbsoluteFill style={{ background: navyGround, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: font.display,
          fontWeight: 700,
          fontSize: headlineSize,
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          textAlign: "center",
          transform: `scale(${mix(1.4, 1, headline)})`,
        }}
      >
        {lines.map((line, i) => (
          <div key={line} style={{ color: i === lines.length - 1 ? color.brand : color.white }}>
            {line}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "relative",
          marginTop: buttonSize * 1.1,
          opacity: frame >= CLOSE_CUES.button.from ? 1 : 0,
          transform: `scale(${mix(0.5, 1, button) * (1 + 0.08 * Math.sin(Math.PI * pulse))})`,
        }}
      >
        {pulsing ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: buttonSize * 2,
              border: `3px solid ${color.brand}`,
              opacity: 0.8 * (1 - pulse),
              transform: `scale(${1 + 0.35 * pulse})`,
            }}
          />
        ) : null}
        <div
          style={{
            padding: `${buttonSize * 0.6}px ${buttonSize * 1.2}px`,
            borderRadius: buttonSize * 2,
            background: color.brand,
            color: color.brandInk,
            fontFamily: font.sans,
            fontWeight: 600,
            fontSize: buttonSize,
            boxShadow: "0 20px 50px rgba(212, 255, 53, 0.25)",
          }}
        >
          {copy.button}
        </div>
      </div>
      <div
        style={{
          marginTop: addressSize * 0.9,
          color: color.brand,
          fontFamily: font.sans,
          fontWeight: 600,
          fontSize: addressSize,
          opacity: address,
          transform: `translateY(${mix(20, 0, address)}px)`,
        }}
      >
        {copy.address}
      </div>
    </AbsoluteFill>
  );
}

function Footnote({ layout, neon }: { layout: RingsLayout; neon: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        left: layout.margin,
        right: layout.margin,
        bottom: layout.margin * 0.45,
        textAlign: layout.caption.align === "center" ? "center" : "left",
        color: neon ? color.brandInk : color.mutedInvert,
        opacity: neon ? 0.7 : 1,
        fontFamily: font.sans,
        fontSize: layout.footnoteSize,
      }}
    >
      {copy.footnote}
    </div>
  );
}
