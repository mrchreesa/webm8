/**
 * The Work page's 3D: one laptop and one phone, drawn by a single hidden
 * WebGL renderer and copied into whichever project's canvas asks. Sharing one
 * renderer keeps a page of eleven demos to one graphics context and one set
 * of models; only the screenshots change. Loaded with a dynamic import, so
 * Three.js reaches the Work page only on a laptop that scrolls to a demo.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { coverFromTop, keyboardTexture, LAPTOP_SCREEN_ASPECT, makeLaptop, makePhone, materials, screenMaterial, shadowTexture } from "@/components/home/story3d/devices";
import { lerp, PHONE } from "@/lib/homeStory";

export type DeviceView = {
  canvas: HTMLCanvasElement;
  desktop: string;
  mobile: string;
  /** 0 with the lid shut and the phone away, 1 open. */
  open: number;
  /** The pointer over the demo, -1 to 1 each way. */
  tiltX: number;
  tiltY: number;
};

export type DeviceStage = {
  /** Draws the view. False until both of its screenshots have arrived. */
  draw(view: DeviceView): boolean;
  /** Called when a screenshot arrives, so a view can draw again. Returns a function that stops listening. */
  onLoad(listener: () => void): () => void;
};

const PHONE_SCREEN_ASPECT = PHONE.screenHeight / PHONE.screenWidth;
const out3 = (t: number) => 1 - (1 - t) ** 3;

let shared: DeviceStage | null = null;

export function deviceStage(): DeviceStage {
  return (shared ??= createStage());
}

function createStage(): DeviceStage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight(0x2b6cfc, 2.2);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const m = materials();
  const laptopScreen = screenMaterial(null);
  const phoneScreen = screenMaterial(null);
  const set = new THREE.Group();
  const laptop = makeLaptop(laptopScreen, m, keyboardTexture(), shadowTexture());
  const lid = laptop.userData.lid as THREE.Group;
  const phone = makePhone(phoneScreen, m);
  set.add(laptop, phone);
  scene.add(set);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const listeners = new Set<() => void>();
  const loader = new THREE.TextureLoader();
  const textures = new Map<string, THREE.Texture>();
  function screenshot(url: string, aspect: number) {
    let texture = textures.get(url);
    if (!texture) {
      texture = loader.load(url, (loaded) => {
        coverFromTop(loaded, aspect);
        loaded.userData.ready = true;
        listeners.forEach((listener) => listener());
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      textures.set(url, texture);
    }
    return texture;
  }
  function show(material: THREE.MeshBasicMaterial, texture: THREE.Texture) {
    if (material.map !== texture) {
      material.map = texture;
      material.needsUpdate = true;
    }
    // A screen stays dark until its picture has arrived.
    material.color.set(texture.userData.ready ? 0xffffff : 0x000000);
  }

  function draw({ canvas, desktop, mobile, open, tiltX, tiltY }: DeviceView) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(canvas.clientWidth * dpr), height = Math.round(canvas.clientHeight * dpr);
    if (!width || !height) return false;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const laptopShot = screenshot(desktop, LAPTOP_SCREEN_ASPECT), phoneShot = screenshot(mobile, PHONE_SCREEN_ASPECT);
    show(laptopScreen, laptopShot);
    show(phoneScreen, phoneShot);
    // Nothing is copied to the page until both pictures are in: a laptop with a blank screen is never shown.
    if (!laptopShot.userData.ready || !phoneShot.userData.ready) return false;

    const t = out3(open);
    // The lid lifts from flat on the keyboard to its resting lean; the phone steps out beside it.
    lid.rotation.x = lerp(Math.PI / 2 - 0.03, -0.2, t);
    phone.scale.setScalar(lerp(0.6, 0.95, t));
    phone.position.set(lerp(1.1, 1.66, t), 0.7, lerp(0.2, 0.66, t));
    phone.rotation.set(0, -0.34, 0);
    phone.visible = open > 0.08;
    set.rotation.set(tiltY * 0.06, lerp(-0.75, -0.2, t) + tiltX * 0.3, 0);
    camera.position.set(0.3, 1.6, 6.3);
    camera.lookAt(0.3, 0.8, 0);
    renderer.render(scene, camera);

    const target = canvas.getContext("2d");
    if (!target) return false;
    target.clearRect(0, 0, width, height);
    target.drawImage(renderer.domElement, 0, 0);
    return true;
  }

  return {
    draw,
    onLoad(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}
