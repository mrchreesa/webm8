/**
 * The homepage story (components/home/story3d/): scroll progress through the
 * story, from 0 to 1, turned into the numbers every layer is drawn from. Pure,
 * so the timings are tested here and the page and the 3D scene read the same
 * values. Design: docs/superpowers/specs/2026-10-28-homepage-3d-scroll-design.md.
 */

export type StoryChapter = "search" | "dive" | "work" | "steps" | "finale";

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
/** How far `p` is through the range `from`–`to`, from 0 to 1. */
export const seg = (p: number, from: number, to: number) => clamp((p - from) / (to - from));
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const out3 = (t: number) => 1 - Math.pow(1 - t, 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The demos on the ring, in order, labelled as the demo deck labels them. */
export const ringDemos = [
  { slug: "stitch-house", label: "Tailor, London" },
  { slug: "boniface-salon", label: "Hair salon, Kent" },
  { slug: "allen-fitness", label: "Activewear" },
  { slug: "waffles-bubbles", label: "Desserts, Orpington" },
  { slug: "fcg-painting", label: "Painter, Margate" },
  { slug: "aesthetic-nacre", label: "Aesthetic clinic" },
  { slug: "dps-gasworks", label: "Heating, Bedford" },
] as const;

/** What lands on the phone at the end, one from each of three demos just seen. */
export const finaleNotifications = [
  { icon: "💬", title: "New quote request", detail: "Kitchen repaint, Margate" },
  { icon: "📅", title: "New booking", detail: "Cut and colour, Thursday 10:00" },
  { icon: "🛍️", title: "New order", detail: "Sculpt leggings, size M" },
] as const;

/** The ring turns over this stretch of the story, after it has arrived: about a third of a screen's scroll per demo. */
export const RING_TURN = { from: 0.45, to: 0.71 } as const;
/** Where `#work` and `#how-it-works` land: their chapters, settled. */
export const STORY_ANCHORS = { work: 0.455, steps: 0.86 } as const;
/** How long the shown story takes to catch up with the scroll, in milliseconds. */
const FOLLOW_MS = 110;

/**
 * Where the story should be drawn this frame: it glides after the scroll
 * position, so a mouse wheel's steps become one smooth movement. The page
 * itself scrolls natively. A jump of more than a few screens (a link to a
 * chapter, a restored scroll) lands at once.
 */
export function followScroll(shown: number, target: number, dtMs: number): number {
  if (Math.abs(target - shown) > 0.15) return target;
  // At most two frames' worth: after a pause in drawing, the glide starts from the beginning.
  const dt = clamp(dtMs, 0, 34);
  const next = shown + (target - shown) * (1 - Math.exp(-dt / FOLLOW_MS));
  return Math.abs(target - next) < 1e-4 ? target : next;
}

export type StoryLayout = { wide: boolean; W: number; H: number; phoneH: number; anchorX: number; anchorY: number };

/** Beside the words on a laptop; under them on a phone. Pixels from the stage centre. */
export function storyLayout(W: number, H: number): StoryLayout {
  const wide = W >= 900;
  return {
    wide,
    W,
    H,
    phoneH: wide ? clamp(H * 0.49, 260, 440) : clamp(H * 0.34, 200, 300),
    anchorX: wide ? W * 0.22 : 0,
    anchorY: wide ? H * 0.02 : H * 0.2,
  };
}

export type StoryFrame = {
  chapter: StoryChapter;
  /** The hero words. */
  copy: number;
  dive: number;
  straighten: number;
  grow: number;
  /** The sharp HTML copy of the phone's screen. */
  zoom: number;
  /** Its crossfade to the desktop site, on a laptop. */
  desktop: number;
  ringAppear: number;
  ringLeave: number;
  /** Radians; the demo at angle 0 faces the viewer. */
  ringSpin: number;
  ringFront: number;
  /** The work chapter's heading and the front demo's name and link. */
  workOn: number;
  stepIn: number[];
  stepOut: number;
  stepsTitle: number;
  /** The glow behind the hero phone. */
  glow: number;
  waves: number;
  notifications: number[];
  /** The phone flying back for the finale. */
  back: number;
  ringing: boolean;
  finale: number;
  finaleReached: boolean;
};

export function storyFrame(p: number, demoCount: number): StoryFrame {
  const turn = (Math.PI * 2) / demoCount;
  // The ring rests on each demo for the first 40 % of its step, then turns gently to the next.
  const u = seg(p, RING_TURN.from, RING_TURN.to) * (demoCount - 1);
  const step = Math.min(demoCount - 1, Math.floor(u));
  const ringSpin = -(step + ease(clamp((u - step - 0.4) / 0.6))) * turn;
  const ringFront = (((Math.round(-ringSpin / turn) % demoCount) + demoCount) % demoCount);

  const chapter: StoryChapter = p < 0.2 ? "search" : p < 0.36 ? "dive" : p < 0.74 ? "work" : p < 0.885 ? "steps" : "finale";
  const stepOut = ease(seg(p, 0.875, 0.905));
  const back = out3(seg(p, 0.87, 0.94));
  return {
    chapter,
    copy: 1 - seg(p, 0.1, 0.2),
    dive: ease(seg(p, 0.2, 0.36)),
    straighten: ease(seg(p, 0.2, 0.24)),
    grow: ease(seg(p, 0.24, 0.34)),
    zoom: p < 0.5 ? seg(p, 0.238, 0.244) * (1 - seg(p, 0.37, 0.43)) : 0,
    desktop: seg(p, 0.3, 0.36),
    ringAppear: ease(seg(p, 0.34, 0.44)),
    ringLeave: ease(seg(p, 0.71, 0.77)),
    ringSpin,
    ringFront,
    workOn: seg(p, 0.4, 0.45) * (1 - seg(p, 0.69, 0.73)),
    stepIn: [0, 1, 2, 3].map((i) => out3(seg(p, 0.75 + i * 0.018, 0.795 + i * 0.018))),
    stepOut,
    stepsTitle: seg(p, 0.74, 0.77) * (1 - stepOut),
    glow: (p < 0.5 ? 1 - seg(p, 0.2, 0.26) : back) * 0.9,
    waves: p > 0.6 ? seg(p, 0.94, 0.97) : 0,
    notifications: [0, 1, 2].map((i) => out3(seg(p, 0.925 + i * 0.02, 0.955 + i * 0.02))),
    back,
    ringing: p > 0.955,
    finale: seg(p, 0.945, 0.985),
    finaleReached: p >= 0.94,
  };
}

/** Pixels from the stage centre and degrees; `scale` multiplies `phoneH`. */
export type PhonePose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; visible: boolean; scroll: number; lock: number };

export function heroPhonePose(p: number, layout: StoryLayout): PhonePose {
  const t = ease(seg(p, 0, 0.2));
  const straight = ease(seg(p, 0.2, 0.24));
  const back = out3(seg(p, 0.87, 0.94));
  // A peek down the page, then back up to its hero before the dive.
  const scroll = Math.sin(Math.PI * seg(p, 0.03, 0.2)) * 0.14;
  if (p < 0.6) {
    return {
      x: lerp(layout.anchorX, 0, straight),
      y: lerp(layout.anchorY, 0, straight),
      z: 0,
      rx: lerp(14, 5, t) * (1 - straight) || 0,
      ry: lerp(-34, -12, t) * (1 - straight) || 0,
      rz: 0,
      scale: lerp(1, 1.12, straight),
      visible: p < 0.246,
      scroll,
      lock: 0,
    };
  }
  return {
    x: layout.anchorX,
    y: layout.anchorY,
    z: lerp(-1500, 0, back),
    rx: lerp(-10, 4, back),
    ry: lerp(60, -10, back),
    rz: lerp(-16, 0, back),
    scale: 1,
    visible: p > 0.87,
    scroll: 0,
    lock: seg(p, 0.9, 0.93),
  };
}

/** The phone model's proportions (components/home/story3d/devices.ts): body, screen and corner. */
export const PHONE = { width: 0.71, height: 1.46, screenWidth: 0.65, screenHeight: 1.4, screenRadius: 0.085 } as const;

/** Where the straight phone's screen is, in stage pixels: where the sharp copy starts. */
export function phoneScreenRect(pose: PhonePose, layout: StoryLayout) {
  const pxPerUnit = (layout.phoneH * pose.scale) / PHONE.height;
  const width = PHONE.screenWidth * pxPerUnit;
  const height = PHONE.screenHeight * pxPerUnit;
  const cx = layout.W / 2 + pose.x;
  const cy = layout.H / 2 + pose.y;
  return { left: cx - width / 2, top: cy - height / 2, width, height, radius: PHONE.screenRadius * pxPerUnit };
}
