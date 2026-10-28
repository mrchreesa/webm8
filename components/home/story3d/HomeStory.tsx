"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DemoCtaButton } from "@/components/demo/DemoCtaButton";
import { LinkButton } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  STORY_ANCHORS,
  clamp,
  finaleNotifications,
  followScroll,
  heroPhonePose,
  lerp,
  out3,
  phoneScreenRect,
  ringDemos,
  seg,
  storyFrame,
  storyLayout,
  type StoryLayout,
} from "@/lib/homeStory";
import { processSteps, projects } from "@/lib/site";
import type { StoryScene } from "./scene";
import styles from "./HomeStory.module.css";

/**
 * The top of the homepage: one scroll-driven story in five chapters (the
 * search, into the screen, our work, how it works, your phone rings), with a
 * real 3D phone and laptops drawn by ./scene.ts and every word in HTML.
 * Design: docs/superpowers/specs/2026-10-28-homepage-3d-scroll-design.md.
 */

const demos = ringDemos.map(({ slug, label }) => {
  const project = projects.find((item) => item.slug === slug)!;
  return { slug, label, name: project.name, siteUrl: project.siteUrl!, desktop: project.screenshots.desktop, mobile: project.screenshots.mobile };
});

// Things floating around the phone, from Allen Fitness's world: [content, laptop [x, y, z, turn], phone [x, y, z, turn]].
// Pixels at a reference phone height (`REF_PHONE`); positive z sits in front of the phone.
const REF_PHONE = { wide: 307, narrow: 242 };
const floaters: { key: string; laptop: number[]; phone: number[] }[] = [
  { key: "search", laptop: [-235, -185, 60, 20], phone: [-92, -150, 40, 16] },
  { key: "product", laptop: [215, -120, -40, -18], phone: [104, -96, -40, -16] },
  { key: "rating", laptop: [-175, 175, 140, 14], phone: [-100, 72, 110, 12] },
  { key: "bag", laptop: [185, 150, 150, -12], phone: [100, 104, 120, -10] },
  { key: "review", laptop: [240, -255, -260, -10], phone: [112, -196, -260, -8] },
  { key: "trainer", laptop: [-330, -40, -420, 18], phone: [-150, -24, -380, 14] },
  { key: "weights", laptop: [290, 40, -320, -18], phone: [150, 22, -320, -14] },
  { key: "shirt", laptop: [-90, -268, -460, 10], phone: [-40, -232, -460, 8] },
  { key: "yoga", laptop: [60, 250, -380, -8], phone: [42, 172, -380, -6] },
  { key: "order", laptop: [-115, 248, 60, 8], phone: [-18, 166, 60, 6] },
];

function Floater({ name }: { name: string }) {
  switch (name) {
    case "search":
      return <div className={styles.card} style={{ width: 210 }}><div className={styles.search}>🔍 <span>gym leggings that fit</span></div><div className={cn(styles.line, styles.lineHi)} /><div className={styles.line} /><div className={cn(styles.line, styles.lineShort)} /></div>;
    case "product":
      return <div className={cn(styles.card, styles.product)}><i /><div>Sculpt leggings<small>£38 · Size M</small><b>Add to bag</b></div></div>;
    case "rating":
      return <div className={cn(styles.card, styles.chip)}><span className={styles.stars}>★★★★★</span> 4.9 · 212 reviews</div>;
    case "bag":
      return <div className={styles.bag}>🛍️</div>;
    case "review":
      return <div className={cn(styles.glass, styles.quote)}>“First leggings that don’t roll down mid-squat.”<small>Jess M.</small></div>;
    case "order":
      return <div className={cn(styles.glass, styles.chip)}>✓ Order placed</div>;
    default:
      return <div className={styles.tile}>{{ trainer: "👟", weights: "🏋️", shirt: "👕", yoga: "🧘" }[name]}</div>;
  }
}

/** Stable "random" particles, the same on the server and in the browser. */
function particles(count: number) {
  let seed = 7;
  const next = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: count }, (_, i) => ({ x: next() * 2 - 1, y: next() * 2 - 1, z: -next() * 2600, neon: i % 7 === 0 }));
}
const DOTS = particles(60);

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Interactions that mean the visitor is here: start the 3D at once. */
const FIRST_TOUCH = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;
/** Otherwise the 3D starts this long after the page has loaded, once the browser is idle. */
const SCENE_DELAY_MS = 2500;

/** Run `callback` when the browser is idle; returns a function that cancels it. */
function whenIdle(callback: () => void) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  // Safari has no requestIdleCallback.
  const id = globalThis.setTimeout(callback, 300);
  return () => globalThis.clearTimeout(id);
}

export function HomeStory() {
  const [still, setStill] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const webgl = webglAvailable();
    const sync = () => setStill(motion.matches || !webgl);
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  // A change of mode remounts the story, so no inline styles from the other mode survive.
  return <Story key={still ? "still" : "motion"} still={still} />;
}

function Story({ still }: { still: boolean }) {
  const [glReady, setGlReady] = useState(false);
  const [front, setFront] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const el = useRef<Record<string, HTMLElement | null>>({});
  const dots = useRef<(HTMLElement | null)[]>([]);
  const floats = useRef<(HTMLElement | null)[]>([]);
  const notifs = useRef<(HTMLElement | null)[]>([]);
  const steps = useRef<(HTMLElement | null)[]>([]);
  const set = (name: string) => (node: HTMLElement | null) => {
    el.current[name] = node;
  };
  const anchorStyle = useMemo(
    () => ({ work: { "--at": STORY_ANCHORS.work } as CSSProperties, steps: { "--at": STORY_ANCHORS.steps } as CSSProperties }),
    [],
  );

  useEffect(() => {
    if (still) return;
    const track = trackRef.current!, stage = stageRef.current!, canvas = canvasRef.current!;
    const $ = el.current;
    let layout: StoryLayout = storyLayout(stage.clientWidth, stage.clientHeight);
    let scene: StoryScene | null = null;
    let disposed = false;
    let running = false;
    let onScreen = true;
    let raf = 0;
    let shownFront = 0;
    let completed = false;
    let lastActive = "";
    let shown = -1;
    let last = 0;
    const start = performance.now();
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    // Draw only when something has changed: a scroll, a resize, the pointer, the
    // entrance, new screenshots, or the phone ringing. Idle motion is CSS.
    const kick = () => {
      if (running && !raf) raf = window.requestAnimationFrame(frame);
    };
    const resize = () => {
      layout = storyLayout(stage.clientWidth, stage.clientHeight);
      scene?.resize(layout, window.devicePixelRatio || 1);
      kick();
    };

    const frame = (now: number) => {
      raf = 0;
      if (!running) return;
      const box = track.getBoundingClientRect();
      const target = clamp(-box.top / Math.max(1, box.height - window.innerHeight));
      // The story glides after the scroll, so wheel steps become one smooth movement.
      shown = shown < 0 ? target : followScroll(shown, target, now - last);
      last = now;
      const p = shown;
      const f = storyFrame(p, demos.length);
      const pose = heroPhonePose(p, layout);
      const { W, H, wide } = layout;
      const scale = layout.phoneH / (wide ? REF_PHONE.wide : REF_PHONE.narrow);
      tilt.x += (tilt.tx - tilt.x) * 0.08;
      tilt.y += (tilt.ty - tilt.y) * 0.08;

      const world = `rotateX(${-tilt.y * 4}deg) rotateY(${lerp(6, -6, p) + tilt.x * 6}deg)`;
      $.backScene!.style.transform = world;
      $.frontScene!.style.transform = world;
      const anchor = `translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px)`;
      $.backAnchor!.style.transform = anchor;
      $.frontAnchor!.style.transform = anchor;

      // Particles stream towards you, and rush past during the dive.
      const warp = f.dive * (1 - seg(p, 0.36, 0.42));
      const travel = p * 2200 + f.dive * 2600;
      DOTS.forEach((d, i) => {
        const node = dots.current[i];
        if (!node) return;
        const z = ((((d.z + travel) + 2600) % 3000) + 3000) % 3000 - 2600;
        node.style.transform = `translate3d(${d.x * W * 0.9}px, ${d.y * H * 0.8}px, ${z}px) scale(${1 + warp * 6}, 1)`;
        node.style.opacity = String(clamp((z + 2600) / 1400) * clamp((400 - z) / 300) * (0.5 + warp * 0.5));
      });
      $.floor!.style.backgroundPosition = `0 ${travel * 0.35}px`;
      $.floor!.style.opacity = String(lerp(0.35, 0.75, seg(p, 0.36, 0.46) * (1 - seg(p, 0.66, 0.72))) * (1 - warp * 0.6));
      $.glow!.style.opacity = String(f.glow);

      // The poster phone stands in for the 3D one until it arrives.
      $.poster!.style.transform = `rotateY(${pose.ry}deg) rotateX(${pose.rx}deg) rotateZ(${pose.rz}deg) scale(${pose.scale})`;
      $.poster!.style.visibility = pose.visible ? "visible" : "hidden";
      ($.poster!.firstElementChild!.firstElementChild as HTMLElement).style.transform = `translateY(${-pose.scroll * 100}%)`;

      // The sharp copy of the screen takes over at the dive and grows to fill the view.
      const handoff = phoneScreenRect(heroPhonePose(0.244, layout), layout);
      $.zoom!.style.opacity = String(f.zoom);
      $.zoom!.style.left = `${lerp(handoff.left, 0, f.grow)}px`;
      $.zoom!.style.top = `${lerp(handoff.top, 0, f.grow)}px`;
      $.zoom!.style.width = `${lerp(handoff.width, W, f.grow)}px`;
      $.zoom!.style.height = `${lerp(handoff.height, H, f.grow)}px`;
      $.zoom!.style.borderRadius = `${lerp(handoff.radius, 0, f.grow)}px`;
      if ($.zoomDesktop) $.zoomDesktop.style.opacity = String(f.desktop);

      const fade = 1 - seg(p, 0.28, 0.35);
      floaters.forEach((item, i) => {
        const node = floats.current[i];
        if (!node) return;
        const [x, y, z, turn] = (wide ? item.laptop : item.phone).map((v, j) => (j < 3 ? v * scale : v));
        const appear = out3(clamp((now - start - 300 - i * 90) / 1100));
        const zz = z + f.dive * 1800 - (1 - appear) * 500;
        node.style.transform = `translate3d(${x}px, ${y - p * z * 0.25}px, ${zz}px) rotateY(${turn}deg) scale(${(wide ? 0.88 : 0.62) * scale}) translate(-50%, -50%)`;
        node.style.opacity = String(fade * appear * clamp(1 - (zz - 300) / 500));
      });

      // Chapters.
      $.copy!.style.opacity = String(f.copy);
      $.copy!.style.transform = `translateY(${-30 * (1 - f.copy)}px)`;
      const workOn = f.workOn;
      $.work!.style.opacity = String(workOn);
      if (f.ringFront !== shownFront) {
        shownFront = f.ringFront;
        setFront(f.ringFront);
      }
      const stepsOn = f.stepsTitle;
      $.steps!.style.opacity = String(stepsOn > 0 ? 1 : 0);
      $.stepsTitle!.style.opacity = String(stepsOn);
      steps.current.forEach((node, i) => {
        if (!node) return;
        const t = f.stepIn[i];
        const [sx, sy, sz, sry] = wide
          ? [(i - 1.5) * Math.min(330, W * 0.215), 30 - Math.abs(i - 1.5) * 10, -Math.abs(i - 1.5) * 90, -(i - 1.5) * 14]
          : [((i % 2) - 0.5) * W * 0.44, 50 + (Math.floor(i / 2) - 0.5) * H * 0.22, -i * 25, -((i % 2) - 0.5) * 16];
        node.style.transform = `translate3d(${sx}px, ${sy + (1 - t) * 120 - f.stepOut * 80}px, ${sz - (1 - t) * 400 + f.stepOut * 500}px) rotateX(${(1 - t) * 70}deg) rotateY(${sry}deg) scale(${wide ? clamp(W / 1120, 1, 1.4) : Math.min(1, W / 470)}) translate(-50%, -50%)`;
        node.style.opacity = String(t * (1 - f.stepOut));
      });
      $.waves!.style.opacity = String(f.waves);
      notifs.current.forEach((node, i) => {
        if (!node) return;
        const t = f.notifications[i];
        const [nx, ny] = wide ? [(-215 + i * 18) * scale, (-130 + i * 80) * scale] : [(-12 + i * 6) * scale, (-128 + i * 64) * scale];
        node.style.transform = `translate3d(${nx}px, ${ny}px, ${lerp(-700, 140 - i * 40, t)}px) rotateY(${lerp(-40, wide ? 14 : 6, t)}deg) scale(${(wide ? 1 : 0.8) * Math.min(1.25, scale)}) translate(-50%, -50%)`;
        node.style.opacity = String(t);
      });
      $.finale!.style.opacity = String(f.finale);
      $.finale!.style.transform = `translateY(${lerp(20, 0, f.finale)}px)`;

      // Only the chapter on screen can take focus or clicks.
      const active = [f.copy > 0.5 && "hero", workOn > 0.5 && "work", stepsOn > 0.5 && "steps", f.finale > 0.5 && "finale"].filter(Boolean).join();
      if (active !== lastActive) {
        lastActive = active;
        for (const name of ["hero", "work", "steps", "finale"]) $[name]!.toggleAttribute("inert", !active.includes(name));
      }

      if (f.finaleReached && !completed) {
        completed = true;
        trackEvent("home_story_completed");
      }
      if (p > 0.2) scene?.loadRing();
      scene?.render(f, pose, tilt, now);
      const settling = Math.abs(tilt.tx - tilt.x) > 0.002 || Math.abs(tilt.ty - tilt.y) > 0.002;
      if (now - start < 2600 || settling || f.ringing || shown !== target) kick();
    };

    const play = () => {
      const should = onScreen && !document.hidden && !disposed;
      if (should && !running) {
        running = true;
        kick();
      } else if (!should) {
        running = false;
        if (raf) window.cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      play();
    });
    observer.observe(sectionRef.current!);
    document.addEventListener("visibilitychange", play);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    const pointer = (event: PointerEvent) => {
      if (!finePointer) return;
      tilt.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      tilt.ty = (event.clientY / window.innerHeight - 0.5) * 2;
      kick();
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    play();

    // Three.js arrives at the visitor's first touch, scroll or key, or once the
    // page has loaded and settled, so it never competes with the first paint.
    let started = false;
    let cancelIdle = () => {};
    const startScene = () => {
      if (started || disposed) return;
      started = true;
      cancelIdle();
      for (const type of FIRST_TOUCH) window.removeEventListener(type, startScene);
      void import("./scene").then(({ createStoryScene }) => {
        if (disposed) return;
        scene = createStoryScene(canvas, layout, kick);
        void scene.ready.then(() => {
          if (disposed) return;
          setGlReady(true);
          kick();
          whenIdle(() => scene?.loadRing());
        });
      }).catch(() => {
        // No 3D (a failed download): the poster phone and every word stay as they are.
      });
    };
    for (const type of FIRST_TOUCH) window.addEventListener(type, startScene, { passive: true });
    const afterLoad = () => {
      const timer = globalThis.setTimeout(() => (cancelIdle = whenIdle(startScene)), SCENE_DELAY_MS);
      cancelIdle = () => globalThis.clearTimeout(timer);
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    return () => {
      disposed = true;
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      cancelIdle();
      observer.disconnect();
      document.removeEventListener("visibilitychange", play);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("load", afterLoad);
      for (const type of FIRST_TOUCH) window.removeEventListener(type, startScene);
      scene?.dispose();
    };
  }, [still]);

  const demo = demos[front];
  const phoneShot = "/work/allen-fitness-phone.webp";

  return (
    <section
      ref={sectionRef}
      data-analytics-section="Homepage story"
      data-still={still ? "" : undefined}
      data-gl={glReady ? "ready" : undefined}
      className={cn("surface-dark", styles.story)}
    >
      <div ref={trackRef} className={styles.track}>
        <span id="work" className={styles.anchor} style={anchorStyle.work} aria-hidden="true" />
        <span id="how-it-works" className={styles.anchor} style={anchorStyle.steps} aria-hidden="true" />
        <div ref={stageRef} className={styles.stage}>
          <div ref={set("floor")} className={styles.floor} aria-hidden="true" />
          <div className={cn(styles.world, styles.back)} aria-hidden="true">
            <div ref={set("backScene")} className={styles.scene}>
              {DOTS.map((d, i) => (
                <span key={i} ref={(node) => { dots.current[i] = node; }} className={cn(styles.dot, d.neon && styles.neon)} />
              ))}
              <div ref={set("backAnchor")} className={styles.c3}>
                <div ref={set("glow")} className={styles.glow} />
                <div ref={set("waves")} className={cn(styles.c3, styles.waves)}>
                  <span className={styles.wave} /><span className={styles.wave} /><span className={styles.wave} />
                </div>
                <div ref={set("poster")} className={styles.poster}>
                  <span>
                    {/* eslint-disable-next-line @next/next/no-img-element -- sized and moved by the story's own maths */}
                    <img src={phoneShot} alt="" width={780} height={2800} fetchPriority="high" />
                  </span>
                </div>
                {floaters.map((item, i) => item.laptop[2] < 0 && (
                  <div key={item.key} ref={(node) => { floats.current[i] = node; }} className={cn(styles.c3, styles.float)}><div className={styles.bob} style={{ "--i": i } as CSSProperties}><Floater name={item.key} /></div></div>
                ))}
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className={styles.gl} aria-hidden="true" />
          <div className={cn(styles.world, styles.front)} aria-hidden="true">
            <div ref={set("frontScene")} className={styles.scene}>
              <div ref={set("frontAnchor")} className={styles.c3}>
                {floaters.map((item, i) => item.laptop[2] >= 0 && (
                  <div key={item.key} ref={(node) => { floats.current[i] = node; }} className={cn(styles.c3, styles.float)}><div className={styles.bob} style={{ "--i": i } as CSSProperties}><Floater name={item.key} /></div></div>
                ))}
                {finaleNotifications.map((note, i) => (
                  <div key={note.title} ref={(node) => { notifs.current[i] = node; }} className={cn(styles.c3, styles.notif)}>
                    <span>{note.icon}</span><div>{note.title}<small>{note.detail}</small></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div ref={set("zoom")} className={styles.zoom} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- sized (never scaled) to stay sharp */}
            <img src={phoneShot} alt="" width={780} height={2800} />
            {/* eslint-disable-next-line @next/next/no-img-element -- sized (never scaled) to stay sharp */}
            <img ref={set("zoomDesktop")} className={styles.desktop} src="/work/allen-fitness-desktop.webp" alt="" width={1600} height={900} loading="lazy" />
          </div>

          <div ref={set("hero")} className={cn(styles.chapter, styles.hero)}>
            <div ref={set("copy")} className={styles.copy}>
              <h1 className={styles.heroTitle}>Websites that make your <b>phone ring.</b></h1>
              <p className={styles.lede}>WebM8 designs, builds and looks after websites that turn a local search into a new customer.</p>
              <div className={styles.ctas}>
                <DemoCtaButton placement="hero" size="lg">Get my free custom demo</DemoCtaButton>
                <LinkButton data-analytics-id="See our work" href="#work" variant="ghost-invert" size="lg">See our work</LinkButton>
              </div>
            </div>
            <div className={styles.stillPhone} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- the same capture as the poster phone */}
              <img src={phoneShot} alt="" width={780} height={2800} />
            </div>
          </div>

          <div ref={set("work")} className={cn(styles.chapter, styles.work)}>
            <h2 className={styles.title}>Built for businesses like yours.</h2>
            <p className={styles.ringLabel}>
              <small>Real demo</small>
              <span>{demo.name} · {demo.label}</span>
              <a
                className={styles.ringLink}
                href={demo.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-id={`Open ${demo.name} live site`}
                onClick={() => trackEvent("portfolio_example_clicked", { example: demo.slug, position: front + 1, placement: "home_ring", page: "/" })}
              >
                View the live site
              </a>
            </p>
            <ul className={styles.grid}>
              {demos.map((item, i) => (
                <li key={item.slug} className={styles.demo}>
                  <div className={styles.demoDevices} aria-hidden="true">
                    <div className={styles.demoLaptop}><Image src={item.desktop} alt="" width={1600} height={900} sizes="(min-width: 900px) 30vw, 90vw" /></div>
                    <div className={styles.demoPhone}><Image src={item.mobile} alt="" width={420} height={900} sizes="(min-width: 900px) 8vw, 24vw" /></div>
                  </div>
                  <small>Real demo · {item.label}</small>
                  <a
                    href={item.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("portfolio_example_clicked", { example: item.slug, position: i + 1, placement: "home_ring", page: "/" })}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div ref={set("steps")} className={cn(styles.chapter, styles.steps)}>
            <h2 ref={set("stepsTitle")} className={styles.title}>Four steps. Nothing for you to prepare.</h2>
            <ol className={styles.stepList}>
              {processSteps.map((step, i) => (
                <li key={step.number} ref={(node) => { steps.current[i] = node; }} className={styles.step}>
                  <b>{step.number}</b>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div ref={set("finale")} className={cn(styles.chapter, styles.finale)}>
            <div className={styles.finaleCopy}>
              <h2 className={styles.heroTitle}>That’s the sound of <b>new customers.</b></h2>
              <div className={styles.ctas}>
                <DemoCtaButton placement="home_finale" size="lg">Get my free custom demo</DemoCtaButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
