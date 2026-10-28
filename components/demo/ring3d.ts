/**
 * The 3D ring behind the demo deck on /free-demo/ and /demo/: every demo as a
 * laptop with its phone, built from the homepage story's devices
 * (components/home/story3d/devices.ts). Loaded with a dynamic import by
 * DemoRing, so Three.js never reaches the shared bundle; the card deck shows
 * until this is ready and stays as the fallback. It draws only when asked.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  coverFromTop,
  disposeGeometries,
  keyboardTexture,
  LAPTOP_SCREEN_ASPECT,
  makeLaptop,
  makePhone,
  materials,
  screenMaterial,
  shadowTexture,
} from "@/components/home/story3d/devices";
import { cameraDistance, wrapIndex } from "@/lib/demoDeck";
import { PHONE } from "@/lib/homeStory";

export type DemoRingScene = {
  /** Resolves once the front demo is ready to draw. */
  ready: Promise<void>;
  /** `wide`: the phone stands beside its laptop; otherwise in front of it, reading below. */
  resize(width: number, height: number, wide: boolean, dpr: number): void;
  /** Load the screenshots of the demos around `index`. */
  loadAround(index: number): void;
  /** `position` is in cards (not wrapped); `lift` (0–1) is how far the hero has scrolled away. */
  render(position: number, tilt: { x: number; y: number }, lift: number): void;
  dispose(): void;
};

const SCREEN_ASPECT = PHONE.screenHeight / PHONE.screenWidth;
const idle = () =>
  new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 400 });
    else globalThis.setTimeout(resolve, 16);
  });

export function createDemoRing(canvas: HTMLCanvasElement, slugs: readonly string[], onUpdate: () => void): DemoRingScene {
  let disposed = false;
  let size = { width: 1, height: 1, wide: true };
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const loader = new THREE.TextureLoader();

  const scene = new THREE.Scene();
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight(0x2b6cfc, 3);
  rim.position.set(-4, 2, -3);
  const lime = new THREE.DirectionalLight(0xd4ff35, 0.6);
  lime.position.set(4, -1, 2);
  scene.add(key, rim, lime);
  const fog = new THREE.Fog(0x061429, 10, 30);
  scene.fog = fog;
  let environment: THREE.Texture | null = null;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const m = materials();
  const keys = keyboardTexture();
  const shadow = shadowTexture();
  const count = slugs.length;
  const turn = (Math.PI * 2) / count;
  const ring = new THREE.Group();
  scene.add(ring);

  type Demo = { pair: THREE.Group; phone: THREE.Group; phoneShadow: THREE.Mesh; laptopScreen: THREE.MeshBasicMaterial; phoneScreen: THREE.MeshBasicMaterial; loaded: boolean };
  const demos: (Demo | undefined)[] = Array.from({ length: count });

  function place(demo: Demo) {
    if (size.wide) {
      demo.phone.scale.setScalar(0.95);
      demo.phone.position.set(1.66, 0.7, 0.66);
      demo.phone.rotation.set(0, -0.34, 0);
      demo.phoneShadow.position.set(1.66, -0.002, 0.7);
    } else {
      demo.phone.scale.setScalar(1.12);
      demo.phone.position.set(0.55, 0.82, 1.5);
      demo.phone.rotation.set(0, -0.16, 0);
      demo.phoneShadow.position.set(0.55, -0.002, 1.55);
    }
  }

  function build(index: number) {
    const pair = new THREE.Group();
    const laptopScreen = screenMaterial(null);
    const phoneScreen = screenMaterial(null);
    pair.add(makeLaptop(laptopScreen, m, keys, shadow));
    const phone = makePhone(phoneScreen, m);
    const phoneShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), m.shadow(shadow));
    phoneShadow.rotation.x = -Math.PI / 2;
    pair.add(phone, phoneShadow);
    ring.add(pair);
    const demo: Demo = { pair, phone, phoneShadow, laptopScreen, phoneScreen, loaded: false };
    place(demo);
    demos[index] = demo;
    return demo;
  }

  function screenshot(material: THREE.MeshBasicMaterial, url: string, aspect: number) {
    return new Promise<void>((resolve) => {
      const texture = loader.load(
        url,
        (loaded) => {
          coverFromTop(loaded, aspect);
          material.color.set(0xffffff);
          material.needsUpdate = true;
          onUpdate();
          resolve();
        },
        undefined,
        () => resolve(),
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      material.map = texture;
    });
  }

  function load(index: number) {
    const demo = demos[index];
    if (!demo || demo.loaded) return Promise.resolve();
    demo.loaded = true;
    const slug = slugs[index];
    return Promise.all([
      screenshot(demo.laptopScreen, `/work/${slug}-desktop.webp`, LAPTOP_SCREEN_ASPECT),
      screenshot(demo.phoneScreen, `/work/${slug}-mobile.webp`, SCREEN_ASPECT),
    ]).then(() => undefined);
  }

  let around = 0;
  function loadAround(index: number) {
    around = index;
    for (let d = -2; d <= 2; d++) void load(wrapIndex(index + d, count));
  }

  // The front demo first, then outwards, one per idle moment.
  const ready = (async () => {
    await idle();
    if (disposed) return;
    const pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = environment;
    build(0);
    await load(0);
    await idle();
    if (disposed) return;
    await renderer.compileAsync(scene, camera);
    onUpdate();
    const order = Array.from({ length: count - 1 }, (_, i) => (i % 2 === 0 ? 1 + i / 2 : count - 1 - (i - 1) / 2));
    void (async () => {
      for (const index of order) {
        await idle();
        if (disposed) return;
        build(index);
        if (Math.abs(((index - around + count + count / 2) % count) - count / 2) <= 2) void load(index);
        onUpdate();
      }
    })();
  })();

  function resize(width: number, height: number, wide: boolean, dpr: number) {
    size = { width, height, wide };
    renderer.setPixelRatio(Math.min(2, dpr));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = wide ? 30 : 34;
    camera.updateProjectionMatrix();
    demos.forEach((demo) => demo && place(demo));
  }

  function render(position: number, tilt: { x: number; y: number }, lift: number) {
    if (disposed) return;
    const radius = count * (size.wide ? 0.78 : 0.66);
    // The front demo fills the frame: laptop and phone side by side, or the phone in front.
    // Wide enough for the phone, which stands nearer the camera than the laptop and so looks bigger.
    const [subjectW, subjectH, cx, cy] = size.wide ? [4.05, 2.25, 0.36, 0.92] : [3.3, 3.1, 0.12, 1.02];
    const distance = cameraDistance(camera.fov, camera.aspect, subjectW, subjectH);
    ring.position.set(0, -lift * 0.5, -lift * 3);
    demos.forEach((demo, i) => {
      if (!demo) return;
      const angle = (i - position) * turn;
      demo.pair.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius - radius);
      demo.pair.rotation.y = angle;
    });
    camera.position.set(cx + tilt.x * 0.5, cy + distance * 0.2 + lift * 1.2 - tilt.y * 0.3, distance);
    camera.lookAt(cx, cy - lift * 0.3, 0);
    fog.near = distance + 0.6;
    fog.far = distance + radius * 1.4;
    renderer.render(scene, camera);
  }

  function dispose() {
    disposed = true;
    const geometries = new Set<THREE.BufferGeometry>();
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      for (const material of [object.material].flat()) {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
        material.dispose();
      }
    });
    for (const geometry of geometries) geometry.dispose();
    disposeGeometries();
    environment?.dispose();
    renderer.dispose();
  }

  return { ready, resize, loadAround, render, dispose };
}
