import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import {
  shareCards,
  shareImageSize,
  shareImageType,
  titleWords,
  type ShareCard,
  type ShareCardName,
  type ShareVisual,
} from "@/lib/shareCards";
import { projects } from "@/lib/site";

/**
 * Draws a share card (lib/shareCards.ts). Satori renders it as a PNG, which
 * is re-encoded as a JPEG to keep it small enough for WhatsApp.
 */

const color = {
  night: "#061429",
  inkDeep: "#071a33",
  ink: "#0e2f56",
  brand: "#d4ff35",
  brandInk: "#071a33",
  mutedInvert: "#9db4cd",
  muted: "#5b6b7e",
  white: "#ffffff",
  frame: "#0a1322",
};

export async function renderShareImage(name: ShareCardName) {
  const card: ShareCard = shareCards[name];
  const [fonts, mascot, visual] = await Promise.all([
    loadFonts(),
    picture("/mascot.png", 112, 112, "png"),
    renderVisual(card.visual),
  ]);

  const png = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: color.night,
          backgroundImage: `radial-gradient(circle at 78% 46%, rgba(43, 108, 252, 0.5) 0%, rgba(43, 108, 252, 0) 46%), linear-gradient(155deg, ${color.ink} 0%, ${color.inkDeep} 48%, ${color.night} 100%)`,
          fontFamily: "Geist",
          color: color.white,
        }}
      >
        {visual}
        <Copy card={card} mascot={mascot} />
      </div>
    ),
    { ...shareImageSize, fonts },
  );

  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": shareImageType },
  });
}

function Copy({ card, mascot }: { card: ShareCard; mascot: string }) {
  const narrow = card.visual.kind === "browser";
  // A long title steps down a size so it keeps to three lines.
  const long = card.title.length > 48;
  const titleSize = narrow ? (long ? 52 : 58) : long ? 60 : 66;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: narrow ? 540 : 640,
        height: "100%",
        padding: "48px 0 46px 64px",
      }}
    >
      <Wordmark mascot={mascot} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 10,
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid rgba(157, 180, 205, 0.28)",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            color: color.brand,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 1.6,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: color.brand,
            }}
          />
          {card.eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 24,
            fontFamily: "Funnel Display",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: -titleSize * 0.035,
          }}
        >
          {titleWords(card.title).map(({ word, neon }, index) => (
            <span
              key={index}
              style={{
                marginRight: titleSize * 0.24,
                color: neon ? color.brand : color.white,
              }}
            >
              {word}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            maxWidth: narrow ? 450 : 540,
            color: color.mutedInvert,
            fontSize: 25,
            lineHeight: 1.4,
          }}
        >
          {card.subtitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          color: color.mutedInvert,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: 0.2,
        }}
      >
        webm8agency.com
      </div>
    </div>
  );
}

function Wordmark({ mascot }: { mascot: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori, not the DOM */}
      <img src={mascot} width={56} height={56} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: -2.2,
        }}
      >
        <span>Web</span>
        <span
          style={{
            marginLeft: 5,
            padding: "3px 7px 4px",
            borderRadius: 8,
            backgroundColor: color.brand,
            color: color.brandInk,
            fontSize: 25,
            letterSpacing: -1,
            boxShadow: "0 4px 14px -5px rgba(212, 255, 53, 0.75)",
          }}
        >
          M8
        </span>
      </div>
    </div>
  );
}

async function renderVisual(visual: ShareVisual) {
  switch (visual.kind) {
    case "phone":
      return renderPhoneVisual(visual.project);
    case "deck":
      return renderDeckVisual(visual.projects);
    case "browser":
      return renderBrowserVisual(visual.project);
    case "mascot":
      return renderMascotVisual();
  }
}

async function renderPhoneVisual(slug: string) {
  const shot = project(slug).screenshots.phone;
  if (!shot) throw new Error(`${slug} has no phone capture for its share image`);

  const width = 300;
  const height = 640;
  const statusBar = 40;
  const screenWidth = width - frameInset(10);
  const screenHeight = height - frameInset(10);
  const screen = await picture(shot.src, screenWidth, screenHeight - statusBar);

  return (
    <div style={{ display: "flex", position: "absolute", inset: 0 }}>
      <PhoneFrame left={790} top={56} width={width} height={height} radius={50} padding={10}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: screenWidth,
            height: screenHeight,
            borderRadius: 40,
            overflow: "hidden",
            backgroundColor: shot.top,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", height: statusBar, paddingTop: 12 }}>
            <div style={{ width: 90, height: 24, borderRadius: 999, backgroundColor: "#000" }} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori, not the DOM */}
          <img src={screen} width={screenWidth} height={screenHeight - statusBar} />
        </div>
      </PhoneFrame>
      <CallToast />
    </div>
  );
}

function CallToast() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        position: "absolute",
        left: 640,
        top: 392,
        padding: "16px 24px 16px 16px",
        borderRadius: 24,
        backgroundColor: color.white,
        color: color.brandInk,
        boxShadow: "0 30px 60px -18px rgba(0, 0, 0, 0.65)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 54,
          height: 54,
          borderRadius: 999,
          backgroundColor: color.brand,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
            stroke={color.brandInk}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4 }}>New customer calling</div>
        <div style={{ marginTop: 2, fontSize: 17, color: color.muted }}>Found you on Google</div>
      </div>
    </div>
  );
}

async function renderDeckVisual(slugs: [string, string, string]) {
  const side = { width: 236, height: 492 };
  const centre = { width: 276, height: 576 };
  const [left, middle, right] = await Promise.all([
    picture(project(slugs[0]).screenshots.mobile, side.width - frameInset(), side.height - frameInset()),
    picture(project(slugs[1]).screenshots.mobile, centre.width - frameInset(), centre.height - frameInset()),
    picture(project(slugs[2]).screenshots.mobile, side.width - frameInset(), side.height - frameInset()),
  ]);

  return (
    <div style={{ display: "flex", position: "absolute", inset: 0 }}>
      <PhoneFrame left={664} top={104} {...side} radius={36} rotate={-9} src={left} />
      <PhoneFrame left={938} top={104} {...side} radius={36} rotate={9} src={right} />
      <PhoneFrame left={790} top={46} {...centre} radius={40} src={middle} />
    </div>
  );
}

async function renderBrowserVisual(slug: string) {
  const { desktop, mobile } = project(slug).screenshots;
  const browser = { width: 700, chrome: 40 };
  const page = { width: browser.width, height: Math.round((browser.width * 9) / 16) };
  const phone = { width: 196, height: 412 };
  const [desktopShot, mobileShot] = await Promise.all([
    picture(desktop, page.width, page.height),
    picture(mobile, phone.width - frameInset(7), phone.height - frameInset(7)),
  ]);

  return (
    <div style={{ display: "flex", position: "absolute", inset: 0 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 586,
          top: 96,
          width: browser.width,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(157, 180, 205, 0.3)",
          backgroundColor: color.frame,
          boxShadow: "0 40px 90px -30px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: browser.chrome,
            padding: "0 16px",
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((dot) => (
            <div key={dot} style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: dot }} />
          ))}
          <div
            style={{
              marginLeft: 16,
              width: 300,
              height: 22,
              borderRadius: 999,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
          />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori, not the DOM */}
        <img src={desktopShot} width={page.width} height={page.height} />
      </div>
      <PhoneFrame left={548} top={262} {...phone} radius={32} padding={7} src={mobileShot} />
    </div>
  );
}

async function renderMascotVisual() {
  const mascot = await picture("/mascot.png", 840, 840, "png");

  return (
    <div style={{ display: "flex", position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 30,
          width: 580,
          height: 580,
          borderRadius: 999,
          backgroundImage:
            "radial-gradient(circle, rgba(43, 108, 252, 0.55) 0%, rgba(43, 108, 252, 0) 66%)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori, not the DOM */}
      <img
        src={mascot}
        width={420}
        height={420}
        style={{ position: "absolute", left: 720, top: 110, transform: "rotate(-6deg)" }}
      />
    </div>
  );
}

const defaultFramePadding = 8;
const frameBorder = 2;

/** How much narrower a phone's screen is than its frame (Yoga sizes boxes border-box). */
function frameInset(padding = defaultFramePadding) {
  return (padding + frameBorder) * 2;
}

function PhoneFrame({
  left,
  top,
  width,
  height,
  radius,
  padding = defaultFramePadding,
  rotate = 0,
  src,
  children,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
  padding?: number;
  rotate?: number;
  src?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        left,
        top,
        width,
        height,
        padding,
        borderRadius: radius,
        border: `${frameBorder}px solid rgba(157, 180, 205, 0.32)`,
        backgroundColor: color.frame,
        boxShadow: "0 40px 80px -24px rgba(0, 0, 0, 0.7)",
        ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori, not the DOM
        <img
          src={src}
          width={width - frameInset(padding)}
          height={height - frameInset(padding)}
          style={{ borderRadius: radius - padding }}
        />
      ) : (
        children
      )}
    </div>
  );
}

function project(slug: string) {
  const found = projects.find((item) => item.slug === slug);
  if (!found) throw new Error(`No project "${slug}" in lib/site.ts for a share image`);
  return found;
}

/**
 * Satori cannot read WebP, so each picture is decoded, cropped from the top to
 * the size it is drawn at (twice over, for sharpness) and handed over as a
 * data URL.
 */
async function picture(src: string, width: number, height: number, format: "jpeg" | "png" = "jpeg") {
  const image = sharp(join(process.cwd(), "public", src)).resize(width * 2, height * 2, {
    fit: "cover",
    position: "top",
  });
  const buffer = await (format === "png" ? image.png() : image.jpeg({ quality: 88 })).toBuffer();
  return `data:image/${format};base64,${buffer.toString("base64")}`;
}

let fontsLoading: Promise<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]> | undefined;

function loadFonts() {
  fontsLoading ??= Promise.all(
    (
      [
        ["Funnel Display", "FunnelDisplay-Bold.ttf", 700],
        ["Geist", "Geist-Regular.ttf", 400],
        ["Geist", "Geist-SemiBold.ttf", 600],
        ["Geist", "Geist-Black.ttf", 900],
      ] as const
    ).map(async ([name, file, weight]) => ({
      name,
      data: await readFile(join(process.cwd(), "assets/fonts", file)),
      weight,
      style: "normal" as const,
    })),
  );
  return fontsLoading;
}
