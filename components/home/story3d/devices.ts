/**
 * The phones and laptops of the homepage story, built in code: no model files.
 * Proportions match `PHONE` in lib/homeStory.ts, which the page uses to line
 * its sharp HTML copy of the screen up with the 3D one.
 */
import * as THREE from "three";
import { PHONE } from "@/lib/homeStory";

export type Materials = ReturnType<typeof materials>;

export function materials() {
  return {
    titanium: new THREE.MeshPhysicalMaterial({ color: 0x9096a0, metalness: 1, roughness: 0.26, clearcoat: 0.4, clearcoatRoughness: 0.2 }),
    aluminium: new THREE.MeshPhysicalMaterial({ color: 0xc8cbd1, metalness: 1, roughness: 0.34 }),
    trackpad: new THREE.MeshPhysicalMaterial({ color: 0xd2d5da, metalness: 0.9, roughness: 0.22 }),
    gloss: new THREE.MeshPhysicalMaterial({ color: 0x040506, metalness: 0, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.03 }),
    black: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    lens: new THREE.MeshPhysicalMaterial({ color: 0x0a1424, metalness: 0.3, roughness: 0.05, clearcoat: 1 }),
    // Glass over every screen: black and added on top, so only a soft sheen of reflection shows.
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x000000, roughness: 0.16, metalness: 0, specularIntensity: 0.3, envMapIntensity: 0.55,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  };
}

function roundedRect(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** A flat rounded rectangle whose texture spans it exactly. */
export function roundedPlane(w: number, h: number, r: number) {
  const geometry = new THREE.ShapeGeometry(roundedRect(w, h, r), 14);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) uv.setXY(i, (position.getX(i) + w / 2) / w, (position.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return geometry;
}

/** A rounded slab with softened edges, centred on z; its front face is at depth / 2 + bevel. */
function roundedSlab(w: number, h: number, r: number, depth: number, bevel: number) {
  const geometry = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, Math.max(0.002, r - bevel)), {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 20,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/** A screen showing `map` in its own colours, unlit; black until a map is given. */
export function screenMaterial(map: THREE.Texture | null) {
  return new THREE.MeshBasicMaterial({ map, color: map ? 0xffffff : 0x000000, toneMapped: false });
}

export type Phone = THREE.Group & { userData: { screen: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>; front: number } };

export function makePhone(screen: THREE.MeshBasicMaterial, m: Materials): Phone {
  const phone = new THREE.Group() as Phone;
  const { width: W, height: H, screenWidth, screenHeight, screenRadius } = PHONE;
  const depth = 0.05, bevel = 0.014, corner = 0.115, front = depth / 2 + bevel;
  phone.add(new THREE.Mesh(roundedSlab(W, H, corner, depth, bevel), [m.gloss, m.titanium]));
  const display = new THREE.Mesh(roundedPlane(screenWidth, screenHeight, screenRadius), screen);
  display.position.z = front + 0.0012;
  phone.add(display);
  const island = new THREE.Mesh(roundedPlane(0.2, 0.058, 0.029), m.black);
  island.position.set(0, screenHeight / 2 - 0.065, front + 0.0022);
  phone.add(island);
  const glass = new THREE.Mesh(roundedPlane(W - 0.024, H - 0.024, corner - 0.012), m.glass);
  glass.position.z = front + 0.003;
  phone.add(glass);
  const button = new THREE.BoxGeometry(0.016, 1, 0.028);
  for (const [x, y, h] of [[W / 2 + 0.005, 0.27, 0.2], [-W / 2 - 0.005, 0.38, 0.08], [-W / 2 - 0.005, 0.2, 0.15], [-W / 2 - 0.005, 0.01, 0.15]]) {
    const b = new THREE.Mesh(button, m.titanium);
    b.scale.y = h;
    b.position.set(x, y, 0);
    phone.add(b);
  }
  const bumpX = -W / 2 + 0.21, bumpY = H / 2 - 0.21;
  const bump = new THREE.Mesh(roundedSlab(0.32, 0.32, 0.08, 0.012, 0.006), [m.gloss, m.titanium]);
  bump.position.set(bumpX, bumpY, -front - 0.012);
  phone.add(bump);
  const lens = new THREE.CylinderGeometry(0.058, 0.058, 0.022, 32);
  for (const [x, y] of [[-0.06, 0.06], [-0.06, -0.06], [0.07, 0]]) {
    const l = new THREE.Mesh(lens, m.lens);
    l.rotation.x = Math.PI / 2;
    l.position.set(bumpX + x, bumpY + y, -front - 0.03);
    phone.add(l);
  }
  phone.userData = { screen: display, front };
  return phone;
}

const LAPTOP = { width: 2.8, depth: 1.9, lid: 1.82 } as const;
/** The laptop screen's height over its width (16:10). */
export const LAPTOP_SCREEN_ASPECT = 0.625;

export function makeLaptop(screen: THREE.MeshBasicMaterial, m: Materials, keys: THREE.Texture, shadow: THREE.Texture) {
  const laptop = new THREE.Group();
  const { width: W, depth: D, lid: L } = LAPTOP;
  const thickness = 0.045, bevel = 0.012, top = thickness + 2 * bevel;
  const base = new THREE.Mesh(roundedSlab(W, D, 0.09, thickness, bevel), m.aluminium);
  base.rotation.x = -Math.PI / 2;
  base.position.y = thickness / 2 + bevel;
  laptop.add(base);
  const keyboard = new THREE.Mesh(new THREE.PlaneGeometry(2.34, 0.92), new THREE.MeshStandardMaterial({ map: keys, roughness: 0.55, metalness: 0.15 }));
  keyboard.rotation.x = -Math.PI / 2;
  keyboard.position.set(0, top + 0.0015, -0.36);
  laptop.add(keyboard);
  const pad = new THREE.Mesh(roundedPlane(1.1, 0.64, 0.05), m.trackpad);
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, top + 0.0015, 0.48);
  laptop.add(pad);
  const floorShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.4), new THREE.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false, toneMapped: false }));
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.y = -0.003;
  laptop.add(floorShadow);

  const lid = new THREE.Group();
  lid.position.set(0, top - 0.006, -D / 2 + 0.05);
  lid.rotation.x = -0.2;
  laptop.add(lid);
  const lidDepth = 0.022, lidBevel = 0.008, front = lidDepth / 2 + lidBevel;
  const shell = new THREE.Mesh(roundedSlab(W, L, 0.09, lidDepth, lidBevel), [m.gloss, m.aluminium]);
  shell.position.y = L / 2;
  lid.add(shell);
  const back = new THREE.Mesh(roundedPlane(W - 0.02, L - 0.02, 0.085), m.aluminium);
  back.position.set(0, L / 2, -front - 0.001);
  back.rotation.y = Math.PI;
  lid.add(back);
  const sw = W - 0.16, sh = sw * LAPTOP_SCREEN_ASPECT;
  const display = new THREE.Mesh(roundedPlane(sw, sh, 0.035), screen);
  display.position.set(0, L / 2 + 0.03, front + 0.0012);
  lid.add(display);
  const notch = new THREE.Mesh(roundedPlane(0.34, 0.07, 0.025), m.black);
  notch.position.set(0, L / 2 + 0.03 + sh / 2 - 0.025, front + 0.002);
  lid.add(notch);
  const glass = new THREE.Mesh(roundedPlane(W - 0.03, L - 0.03, 0.08), m.glass);
  glass.position.set(0, L / 2, front + 0.003);
  lid.add(glass);
  return laptop;
}

function canvasTexture(w: number, h: number, draw: (x: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!, w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function keyboardTexture() {
  return canvasTexture(1024, 400, (x, w, h) => {
    x.fillStyle = "#25282e";
    x.fillRect(0, 0, w, h);
    const gap = 9, pad = 14, rowH = (h - pad * 2 - gap * 5) / 6;
    const key = (kx: number, ky: number, kw: number, kh: number) => {
      x.fillStyle = "#0d0e11";
      x.beginPath();
      x.roundRect(kx, ky, kw, kh, 7);
      x.fill();
      x.fillStyle = "rgba(255,255,255,0.05)";
      x.fillRect(kx + 4, ky + 2, kw - 8, 2);
    };
    [14, 14, 14, 13, 12].forEach((n, r) => {
      const y = pad + r * (rowH + gap), kh = r === 0 ? rowH * 0.7 : rowH;
      const kw = (w - pad * 2 - gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) key(pad + i * (kw + gap), y + (r === 0 ? rowH * 0.3 : 0), kw, kh);
    });
    const y = pad + 5 * (rowH + gap), unit = (w - pad * 2 - gap * 7) / 12.4;
    let cx = pad;
    for (const u of [1, 1, 1.2, 1.2, 5, 1.2, 1, 0.8]) {
      key(cx, y, unit * u, rowH);
      cx += unit * u + gap;
    }
  });
}

export function shadowTexture() {
  return canvasTexture(256, 256, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(0,0,0,0.7)");
    g.addColorStop(0.55, "rgba(0,0,0,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  });
}

/** The finale's lock screen, in the site's own fonts once they have loaded. */
export function lockScreenTexture() {
  const draw = (x: CanvasRenderingContext2D, w: number, h: number) => {
    const styles = getComputedStyle(document.documentElement);
    const display = styles.getPropertyValue("--font-funnel-display").trim() || "sans-serif";
    const body = styles.getPropertyValue("--font-geist-sans").trim() || "sans-serif";
    const g = x.createLinearGradient(0, 0, w * 0.4, h);
    g.addColorStop(0, "#2a5bd0");
    g.addColorStop(0.5, "#0b2152");
    g.addColorStop(1, "#061429");
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.textAlign = "center";
    x.fillStyle = "rgba(255,255,255,0.85)";
    x.font = `500 34px ${body}`;
    x.fillText("Thursday, October 2", w / 2, 190);
    x.fillStyle = "#ffffff";
    x.font = `700 170px ${display}`;
    x.fillText("9:41", w / 2, 360);
  };
  const texture = canvasTexture(600, 1300, draw);
  void document.fonts.ready.then(() => {
    draw((texture.image as HTMLCanvasElement).getContext("2d")!, 600, 1300);
    texture.needsUpdate = true;
  });
  return texture;
}

/** Crop a loaded screenshot to fill a screen of `aspect` (height over width), from the top. */
export function coverFromTop(texture: THREE.Texture, aspect: number) {
  const image = texture.image as { width: number; height: number };
  const ratio = image.height / image.width;
  if (ratio > aspect) {
    texture.repeat.set(1, aspect / ratio);
    texture.offset.set(0, 1 - aspect / ratio);
  } else {
    texture.repeat.set(ratio / aspect, 1);
    texture.offset.set((1 - ratio / aspect) / 2, 0);
  }
  texture.userData.top = texture.offset.y;
}
