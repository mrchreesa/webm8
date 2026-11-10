// Small, code-drawn motions of the existing mascot. No GIF decoder or worker.
const SIZE = 64;
const SOURCE = 192;
const PAUSE_MS = 10000;
const FRAME_MS = 125;

function canvas() {
  const element = document.createElement("canvas");
  element.width = element.height = SIZE;
  const context = element.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  return { element, context };
}

function armPath(context) {
  context.moveTo(136, 111);
  context.bezierCurveTo(146, 106, 145, 84, 157, 79);
  context.bezierCurveTo(176, 69, 188, 88, 177, 104);
  context.bezierCurveTo(168, 121, 149, 126, 135, 119);
  context.closePath();
}

/** Exported so the local visual review can use the exact production frames. */
export function createFaviconFrames(image) {
  const { element, context } = canvas();
  function frame(draw) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, SIZE, SIZE);
    context.save();
    context.scale(SIZE / SOURCE, SIZE / SOURCE);
    draw(context);
    context.restore();
    return element.toDataURL("image/png");
  }
  const drawMascot = (ctx) => ctx.drawImage(image, 0, 0, SOURCE, SOURCE);
  const blink = [0, .55, 1, 1, .4, 0].map(closed => frame(ctx => {
    drawMascot(ctx);
    if (!closed) return;
    // Same blue eyelids as the site's MascotEyes, in favicon coordinates.
    for (const x of [73, 119]) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, 78, 14, 17, 0, 0, Math.PI * 2);
      ctx.clip();
      const lid = ctx.createLinearGradient(0, 61, 0, 95);
      lid.addColorStop(0, "#2463f6");
      lid.addColorStop(1, "#3b7cfb");
      ctx.fillStyle = lid;
      ctx.fillRect(x - 15, 60, 30, 36 * closed);
      if (closed === 1) {
        ctx.strokeStyle = "#102b80";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - 9, 79);
        ctx.quadraticCurveTo(x, 84, x + 9, 79);
        ctx.stroke();
      }
      ctx.restore();
    }
  }));
  const wave = Array.from({ length: 13 }, (_, index) => frame(ctx => {
    const t = index / 12;
    if (index === 0 || index === 12) { drawMascot(ctx); return; }
    // Keep the body still and pivot only the outer right tentacle at its root.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, SOURCE, SOURCE);
    armPath(ctx);
    ctx.clip("evenodd");
    drawMascot(ctx);
    ctx.restore();
    ctx.save();
    ctx.translate(138, 116);
    ctx.rotate(Math.sin(t * Math.PI * 4) * Math.sin(t * Math.PI) * .3);
    ctx.translate(-138, -116);
    ctx.beginPath();
    armPath(ctx);
    ctx.clip();
    drawMascot(ctx);
    ctx.restore();
  }));
  const bob = Array.from({ length: 13 }, (_, index) => frame(ctx => {
    const t = index / 12;
    ctx.translate(96, 96 - Math.sin(t * Math.PI) * 9);
    ctx.rotate(Math.sin(t * Math.PI * 2) * .055);
    ctx.translate(-96, -96);
    drawMascot(ctx);
  }));
  return [{ name: "blink", frames: blink }, { name: "wave", frames: wave }, { name: "bob", frames: bob }];
}

export function startAnimatedFavicon() {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const originals = new Map();
  let timer;
  let image;
  let animations;
  let loading = false;
  let failed = false;
  let away = false;
  let disposed = false;
  let animation = 0;
  let frame = 0;

  const eligible = () => !disposed && !away && !failed && !motion.matches
    && document.visibilityState === "visible" && !navigator.connection?.saveData;

  function restore() {
    for (const [link, attributes] of originals) {
      // A navigation may replace metadata; never resurrect a removed link.
      if (!link.isConnected) continue;
      for (const [name, value] of Object.entries(attributes)) {
        if (value === null) link.removeAttribute(name);
        else link.setAttribute(name, value);
      }
      delete link.dataset.webm8Motion;
    }
    originals.clear();
  }
  function stop() {
    window.clearTimeout(timer);
    frame = 0;
    restore();
  }
  function schedule(delay) {
    window.clearTimeout(timer);
    if (eligible()) timer = window.setTimeout(tick, delay);
  }
  function tick() {
    if (!eligible()) { stop(); return; }
    if (!animations) {
      if (loading) return;
      loading = true;
      image = new Image();
      image.decoding = "async";
      image.onload = () => {
        loading = false;
        if (!eligible()) return;
        try { animations = createFaviconFrames(image); schedule(0); }
        catch { failed = true; stop(); }
      };
      image.onerror = () => { loading = false; failed = true; stop(); };
      image.src = "/mascot-icon-192.png";
      return;
    }
    const current = animations[animation];
    if (frame === current.frames.length) {
      stop();
      animation = (animation + 1) % animations.length;
      schedule(PAUSE_MS);
      return;
    }
    // Update all tab-icon candidates so high-DPI tabs do not choose a static
    // alternative. Apple touch icons and other metadata are never changed.
    for (const link of document.querySelectorAll('link[rel~="icon"]')) {
      if (!originals.has(link)) originals.set(link, {
        href: link.getAttribute("href"), type: link.getAttribute("type"), sizes: link.getAttribute("sizes"),
      });
      link.setAttribute("type", "image/png");
      link.setAttribute("sizes", "64x64");
      link.setAttribute("href", current.frames[frame]);
      link.dataset.webm8Motion = current.name;
    }
    frame += 1;
    schedule(FRAME_MS);
  }
  function resume() { stop(); schedule(2500); }
  function pagehide() { away = true; stop(); }
  function pageshow() { away = false; resume(); }
  document.addEventListener("visibilitychange", resume);
  motion.addEventListener("change", resume);
  window.addEventListener("pagehide", pagehide);
  window.addEventListener("pageshow", pageshow);
  schedule(2500);
  return () => {
    disposed = true;
    stop();
    if (image) image.onload = image.onerror = null;
    document.removeEventListener("visibilitychange", resume);
    motion.removeEventListener("change", resume);
    window.removeEventListener("pagehide", pagehide);
    window.removeEventListener("pageshow", pageshow);
  };
}

// Next's lazyOnload loads this module after the page's load event and idle time.
if (typeof window !== "undefined") startAnimatedFavicon();
