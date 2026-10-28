/**
 * The homepage story's 3D layer: the hero phone and the ring of demos, on a
 * transparent canvas between the page's back and front HTML layers. Loaded
 * with a dynamic import, so Three.js never reaches the shared bundle. Every
 * word stays HTML; nothing here draws text a visitor needs to read.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { lerp, PHONE, ringDemos, type PhonePose, type StoryFrame, type StoryLayout } from "@/lib/homeStory";
import {
  coverFromTop,
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
  /** Resolves once the hero phone's screen has loaded. */
  ready: Promise<void>;
  resize(layout: StoryLayout, dpr: number): void;
  /** Start loading the ring's screenshots. Safe to call more than once. */
  loadRing(): void;
  render(frame: StoryFrame, pose: PhonePose, tilt: { x: number; y: number }, time: number): void;
  dispose(): void;
};

const SCREEN_ASPECT = PHONE.screenHeight / PHONE.screenWidth;
const HERO_FOV = 24;
const HERO_DISTANCE = 8;
const D2R = Math.PI / 180;

export function createStoryScene(canvas: HTMLCanvasElement, initial: StoryLayout): StoryScene {
  let layout = initial;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const loader = new THREE.TextureLoader();

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = environment;
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight(0x2b6cfc, 3);
  rim.position.set(-4, 2, -3);
  const lime = new THREE.DirectionalLight(0xd4ff35, 0.6);
  lime.position.set(4, -1, 2);
  scene.add(key, rim, lime);
  const fog = new THREE.Fog(0x061429, 100, 200);
  scene.fog = fog;

  const m = materials();
  const keys = keyboardTexture();
  const shadow = shadowTexture();

  function screenshot(url: string, aspect: number, onLoad?: () => void) {
    const texture = loader.load(url, (loaded) => {
      coverFromTop(loaded, aspect);
      onLoad?.();
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = anisotropy;
    return texture;
  }

  // The hero phone, playing Allen Fitness, with a lock screen for the finale.
  let heroReady = false;
  let resolveReady!: () => void;
  const ready = new Promise<void>((resolve) => (resolveReady = resolve));
  const heroTexture = screenshot("/work/allen-fitness-phone.webp", SCREEN_ASPECT, () => {
    heroReady = true;
    resolveReady();
  });
  const hero = makePhone(screenMaterial(heroTexture), m);
  const lockMaterial = new THREE.MeshBasicMaterial({ map: lockScreenTexture(), toneMapped: false, transparent: true, opacity: 0 });
  const lock = new THREE.Mesh(roundedPlane(PHONE.screenWidth, PHONE.screenHeight, PHONE.screenRadius), lockMaterial);
  lock.position.z = hero.userData.front + 0.0018;
  hero.add(lock);
  scene.add(hero);
  const heroCamera = new THREE.PerspectiveCamera(HERO_FOV, 1, 0.1, 100);
  heroCamera.position.set(0, 0, HERO_DISTANCE);

  // Our work: each demo as a laptop with its phone, on a ring. Screens stay black until loadRing().
  const ring = new THREE.Group();
  scene.add(ring);
  const ringScreens: { material: THREE.MeshBasicMaterial; url: string; aspect: number }[] = [];
  const pairs = ringDemos.map(({ slug }) => {
    const pair = new THREE.Group();
    const laptopScreen = screenMaterial(null);
    const phoneScreen = screenMaterial(null);
    ringScreens.push({ material: laptopScreen, url: `/work/${slug}-desktop.webp`, aspect: LAPTOP_SCREEN_ASPECT });
    ringScreens.push({ material: phoneScreen, url: `/work/${slug}-mobile.webp`, aspect: SCREEN_ASPECT });
    pair.add(makeLaptop(laptopScreen, m, keys, shadow));
    const phone = makePhone(phoneScreen, m);
    const phoneShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false, toneMapped: false }));
    phoneShadow.rotation.x = -Math.PI / 2;
    pair.add(phone, phoneShadow);
    ring.add(pair);
    return { pair, phone, phoneShadow };
  });
  const ringCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  let ringLoaded = false;

  function placeDemos() {
    // On a laptop the phone stands beside the laptop; on a phone it stands in front, so it reads below it.
    for (const { phone, phoneShadow } of pairs) {
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
    ringCamera.fov = layout.wide ? 30 : 36;
  }

  function resize(next: StoryLayout, dpr: number) {
    layout = next;
    renderer.setPixelRatio(Math.min(2, dpr));
    renderer.setSize(layout.W, layout.H, false);
    heroCamera.aspect = ringCamera.aspect = layout.W / layout.H;
    heroCamera.updateProjectionMatrix();
    placeDemos();
    ringCamera.updateProjectionMatrix();
  }
  resize(initial, window.devicePixelRatio || 1);

  function loadRing() {
    if (ringLoaded) return;
    ringLoaded = true;
    for (const screen of ringScreens) {
      screen.material.map = screenshot(screen.url, screen.aspect, () => {
        screen.material.color.set(0xffffff);
        screen.material.needsUpdate = true;
      });
    }
  }

  function render(frame: StoryFrame, pose: PhonePose, tilt: { x: number; y: number }, time: number) {
    const { W, H } = layout;
    const ringOn = frame.ringAppear > 0 && frame.ringLeave < 1;

    // The hero phone sits where the page's pixels say, at the same size.
    const visibleH = 2 * HERO_DISTANCE * Math.tan((HERO_FOV / 2) * D2R);
    const visibleW = visibleH * (W / H);
    hero.visible = heroReady && pose.visible && !ringOn;
    hero.position.set((pose.x / W) * visibleW, -(pose.y / H) * visibleH, (pose.z / H) * visibleH);
    hero.scale.setScalar(((layout.phoneH * pose.scale) / H) * (visibleH / PHONE.height));
    const shake = frame.ringing ? Math.sin(time / 38) * 0.07 : 0;
    hero.rotation.set(-(pose.rx - tilt.y * 4) * D2R, (pose.ry + tilt.x * 6) * D2R + Math.sin(time / 1700) * 0.03, -pose.rz * D2R + shake);
    if (heroTexture.userData.top !== undefined) heroTexture.offset.y = heroTexture.userData.top - pose.scroll;
    lockMaterial.opacity = pose.lock;

    // The ring, resting on each demo in turn.
    ring.visible = ringOn;
    const radius = layout.wide ? 5.4 : 4.6;
    ring.position.set(0, frame.ringLeave * 1.8, lerp(-16, 0, frame.ringAppear) - frame.ringLeave * 16);
    const turn = (Math.PI * 2) / pairs.length;
    pairs.forEach(({ pair }, i) => {
      const angle = i * turn + frame.ringSpin;
      pair.position.set(Math.sin(angle) * radius, Math.sin(time / 1100 + i) * 0.03, Math.cos(angle) * radius - radius);
      pair.rotation.y = angle;
    });
    if (layout.wide) {
      ringCamera.position.set(0.28 + tilt.x * 0.5, 1.45 - tilt.y * 0.3, 5.6);
      ringCamera.lookAt(0.28, 0.82, 0);
      fog.near = 6.4;
      fog.far = 15;
    } else {
      ringCamera.position.set(0.1, 2.6, 8.6);
      ringCamera.lookAt(0.1, 0.95, 0.5);
      fog.near = 9;
      fog.far = 17;
    }
    if (!ringOn) {
      fog.near = 100;
      fog.far = 200;
    }
    renderer.render(scene, ringOn ? ringCamera : heroCamera);
  }

  function dispose() {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      for (const material of [object.material].flat()) {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
        material.dispose();
      }
    });
    environment.dispose();
    renderer.dispose();
  }

  return { ready, resize, loadRing, render, dispose };
}
