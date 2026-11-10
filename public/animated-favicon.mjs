// Cached canvas frames: octopus → three spins → M8 → three spins → octopus.
const SIZE = 64;
const SOURCE = 192;
const PAUSE_MS = 10000;
const FRAME_MS = 80;

function canvas() {
  const element = document.createElement("canvas");
  element.width = element.height = SIZE;
  const context = element.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  return { element, context };
}

/** Exported so the local visual review uses the exact production frames. */
export function createFaviconFrames(image) {
  const { element, context } = canvas();
  // Match the existing header badge; read the canonical theme just once.
  const theme = getComputedStyle(document.documentElement);
  const brand = theme.getPropertyValue("--color-brand").trim() || "#d4ff35";
  const ink = theme.getPropertyValue("--color-ink-deep").trim() || "#071a33";

  function drawM8(ctx) {
    ctx.fillStyle = brand;
    ctx.beginPath();
    ctx.roundRect(8, 8, 176, 176, 34);
    ctx.fill();
    // Vector lettering stays crisp at tab size and needs no font download.
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(29, 130);
    ctx.lineTo(29, 62);
    ctx.lineTo(46, 62);
    ctx.lineTo(64, 94);
    ctx.lineTo(82, 62);
    ctx.lineTo(99, 62);
    ctx.lineTo(99, 130);
    ctx.lineTo(82, 130);
    ctx.lineTo(82, 94);
    ctx.lineTo(69, 116);
    ctx.lineTo(59, 116);
    ctx.lineTo(46, 94);
    ctx.lineTo(46, 130);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(108, 59, 55, 73, 21);
    ctx.roundRect(123, 73, 25, 15, 7);
    ctx.roundRect(123, 101, 25, 17, 7);
    ctx.fill("evenodd");
  }
  const drawMascot = ctx => ctx.drawImage(image, 0, 0, SOURCE, SOURCE);
  const smooth = t => t * t * (3 - 2 * t);

  function spin(from, to, direction) {
    return Array.from({ length: 37 }, (_, index) => {
      const t = index / 36;
      const eased = smooth(t);
      const blend = smooth(Math.min(1, Math.max(0, (eased - .4) / .2)));
      // Pull in during the fast turns so the square badge never clips.
      const scale = 1 - .32 * Math.sin(t * Math.PI);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, SIZE, SIZE);
      context.save();
      context.scale(SIZE / SOURCE, SIZE / SOURCE);
      context.translate(SOURCE / 2, SOURCE / 2);
      context.rotate(direction * eased * Math.PI * 6);
      context.scale(scale, scale);
      context.translate(-SOURCE / 2, -SOURCE / 2);
      context.globalAlpha = 1 - blend;
      from(context);
      context.globalAlpha = blend;
      to(context);
      context.restore();
      return element.toDataURL("image/png");
    });
  }

  return [
    { name: "spin-to-m8", frames: spin(drawMascot, drawM8, 1), holdMs: 3500 },
    { name: "spin-to-octopus", frames: spin(drawM8, drawMascot, -1), holdMs: PAUSE_MS, restoreAfter: true },
  ];
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
      frame = 0;
      if (current.restoreAfter) restore();
      animation = (animation + 1) % animations.length;
      schedule(current.holdMs);
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
  function resume() { stop(); animation = 0; schedule(2500); }
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
