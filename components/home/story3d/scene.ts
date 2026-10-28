/**
 * The homepage story's 3D layer: the hero phone and the ring of demos, on a
 * transparent canvas between the page's back and front HTML layers. Loaded
 * with a dynamic import, so Three.js never reaches the shared bundle. Every
 * word stays HTML; nothing here draws text a visitor needs to read.
 *
 * Work is spread out so the page never stalls: shaders compile without
 * blocking (compileAsync), and the ring is built one demo at a time while the
 * browser is idle. It draws only when the page asks it to.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { lerp, PHONE, ringDemos, type PhonePose, type StoryFrame, type StoryLayout } from "@/lib/homeStory";
import {
  coverFromTop,
  disposeGeometries,
  keyboardTexture,
  LAPTOP_SCREEN_ASPECT,
  lockScreenTexture,
  makeLaptop,
  makePhone,
  materials,
  roundedPlane,
  screenMaterial,
  shadowTexture,
} from "./devices";

export type StoryScene = {
  /** Resolves once the hero phone is ready to draw. */
  ready: Promise<void>;
  resize(layout: StoryLayout, dpr: number): void;
  /** Start building the ring and loading its screenshots. Safe to call more than once. */
  loadRing(): void;
  render(frame: StoryFrame, pose: PhonePose, tilt: { x: number; y: number }, time: number): void;
  dispose(): void;
};

const SCREEN_ASPECT = PHONE.screenHeight / PHONE.screenWidth;
const HERO_FOV = 24;
const HERO_DISTANCE = 8;
const D2R = Math.PI / 180;

const idle = () =>
  new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 400 });
    else globalThis.setTimeout(resolve, 16);
  });

/** `onUpdate` is called whenever the scene has something new to show (a screenshot arrived, the ring is built). */
export function createStoryScene(canvas: HTMLCanvasElement, initial: StoryLayout, onUpdate: () => void): StoryScene {
  let layout = initial;
  let disposed = false;
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
  const fog = new THREE.Fog(0x061429, 100, 200);
  scene.fog = fog;
  let environment: THREE.Texture | null = null;

  const m = materials();
  const keys = keyboardTexture();
  const shadow = shadowTexture();

  function screenshot(url: string, aspect: number, onLoad?: () => void) {
    const texture = loader.load(url, (loaded) => {
      coverFromTop(loaded, aspect);
      onLoad?.();
      onUpdate();
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = anisotropy;
    return texture;
  }

  // The hero phone, playing Allen Fitness, with a lock screen for the finale.
  let heroReady = false;
  let heroLoaded!: () => void;
  const heroArrived = new Promise<void>((resolve) => (heroLoaded = resolve));
  const heroTexture = screenshot("/work/allen-fitness-phone.webp", SCREEN_ASPECT, () => heroLoaded());
  const hero = makePhone(screenMaterial(heroTexture), m);
  const lockMaterial = new THREE.MeshBasicMaterial({ map: lockScreenTexture(), toneMapped: false, transparent: true, opacity: 0 });
  const lock = new THREE.Mesh(roundedPlane(PHONE.screenWidth, PHONE.screenHeight, PHONE.screenRadius), lockMaterial);
  lock.position.z = hero.userData.front + 0.0018;
  hero.add(lock);
  scene.add(hero);
  const heroCamera = new THREE.PerspectiveCamera(HERO_FOV, 1, 0.1, 100);
  heroCamera.position.set(0, 0, HERO_DISTANCE);

  const ready = (async () => {
    // The studio reflections, then the hero's shaders, each in its own idle moment.
    await idle();
    if (disposed) return;
    const pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = environment;
    await heroArrived;
    await idle();
    if (disposed) return;
    await renderer.compileAsync(scene, heroCamera);
    heroReady = true;
    onUpdate();
  })();

  // Our work: each demo as a laptop with its phone, on a ring, built when asked for.
  const ring = new THREE.Group();
  ring.visible = false;
  scene.add(ring);
  const pairs: { pair: THREE.Group; phone: THREE.Group; phoneShadow: THREE.Mesh }[] = [];
  const ringCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  let ringRequested = false;
  let ringReady = false;

  function placeDemo({ phone, phoneShadow }: (typeof pairs)[number]) {
    // On a laptop the phone stands beside the laptop; on a phone it stands in front, so it reads below it.
    if (layout.wide) {
      phone.scale.setScalar(0.95);
      phone.position.set(1.66, 0.7, 0.66);
      phone.rotation.set(0, -0.34, 0);
      phoneShadow.position.set(1.66, -0.002, 0.7);
    } else {
      phone.scale.setScalar(1.12);
      phone.position.set(0.55, 0.82, 1.5);
      phone.rotation.set(0, -0.16, 0);
      phoneShadow.position.set(0.55, -0.002, 1.55);
    }
  }

  async function buildRing() {
    for (const { slug } of ringDemos) {
      await idle();
      if (disposed) return;
      const pair = new THREE.Group();
      const laptopScreen = screenMaterial(null);
      const phoneScreen = screenMaterial(null);
      pair.add(makeLaptop(laptopScreen, m, keys, shadow));
      const phone = makePhone(phoneScreen, m);
      const phoneShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), m.shadow(shadow));
      phoneShadow.rotation.x = -Math.PI / 2;
      pair.add(phone, phoneShadow);
      ring.add(pair);
      const entry = { pair, phone, phoneShadow };
      placeDemo(entry);
      pairs.push(entry);
      for (const [material, url, aspect] of [[laptopScreen, `/work/${slug}-desktop.webp`, LAPTOP_SCREEN_ASPECT], [phoneScreen, `/work/${slug}-mobile.webp`, SCREEN_ASPECT]] as const) {
        material.map = screenshot(url, aspect, () => {
          material.color.set(0xffffff);
          material.needsUpdate = true;
        });
      }
    }
    await idle();
    if (disposed) return;
    ring.visible = true;
    await renderer.compileAsync(scene, ringCamera);
    ringReady = true;
    onUpdate();
  }

  function resize(next: StoryLayout, dpr: number) {
    layout = next;
    renderer.setPixelRatio(Math.min(2, dpr));
    renderer.setSize(layout.W, layout.H, false);
    heroCamera.aspect = ringCamera.aspect = layout.W / layout.H;
    ringCamera.fov = layout.wide ? 30 : 36;
    heroCamera.updateProjectionMatrix();
    ringCamera.updateProjectionMatrix();
    pairs.forEach(placeDemo);
  }
  resize(initial, window.devicePixelRatio || 1);

  function loadRing() {
    if (ringRequested) return;
    ringRequested = true;
    void ready.then(buildRing);
  }

  function render(frame: StoryFrame, pose: PhonePose, tilt: { x: number; y: number }, time: number) {
    if (disposed) return;
    const { W, H } = layout;
    const ringOn = ringReady && frame.ringAppear > 0 && frame.ringLeave < 1;

    // The hero phone sits where the page's pixels say, at the same size.
    const visibleH = 2 * HERO_DISTANCE * Math.tan((HERO_FOV / 2) * D2R);
    const visibleW = visibleH * (W / H);
    hero.visible = heroReady && pose.visible && !ringOn;
    hero.position.set((pose.x / W) * visibleW, -(pose.y / H) * visibleH, (pose.z / H) * visibleH);
    hero.scale.setScalar(((layout.phoneH * pose.scale) / H) * (visibleH / PHONE.height));
    const shake = frame.ringing ? Math.sin(time / 38) * 0.07 : 0;
    hero.rotation.set(-(pose.rx - tilt.y * 4) * D2R, (pose.ry + tilt.x * 6) * D2R, -pose.rz * D2R + shake);
    if (heroTexture.userData.top !== undefined) heroTexture.offset.y = heroTexture.userData.top - pose.scroll;
    lockMaterial.opacity = pose.lock;

    // The ring, resting on each demo in turn.
    ring.visible = ringOn;
    const radius = layout.wide ? 5.4 : 4.6;
    ring.position.set(0, frame.ringLeave * 1.8, lerp(-16, 0, frame.ringAppear) - frame.ringLeave * 16);
    const turn = (Math.PI * 2) / ringDemos.length;
    pairs.forEach(({ pair }, i) => {
      const angle = i * turn + frame.ringSpin;
      pair.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius - radius);
      pair.rotation.y = angle;
    });
    if (layout.wide) {
      ringCamera.position.set(0.28 + tilt.x * 0.5, 1.45 - tilt.y * 0.3, 5.6);
      ringCamera.lookAt(0.28, 0.82, 0);
    } else {
      ringCamera.position.set(0.1, 2.6, 8.6);
      ringCamera.lookAt(0.1, 0.95, 0.5);
    }
    fog.near = ringOn ? (layout.wide ? 6.4 : 9) : 100;
    fog.far = ringOn ? (layout.wide ? 15 : 17) : 200;
    renderer.render(scene, ringOn ? ringCamera : heroCamera);
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

  return { ready, resize, loadRing, render, dispose };
}
