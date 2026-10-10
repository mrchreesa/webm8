import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { metaPixelScript } from "./metaPixelScript.ts";

function browser(pathname = "/free-demo/", privacy = {}, readyState = "loading") {
  const scripts: { src: string; async: boolean }[] = [];
  const listeners = new Map<string, () => void>();
  const idle: (() => void)[] = [];
  const window = {
    location: { pathname },
    addEventListener: (name: string, fn: () => void) => listeners.set(name, fn),
    requestIdleCallback: (fn: () => void) => idle.push(fn),
    setTimeout: (fn: () => void) => idle.push(fn),
    fbq: undefined as undefined | (((...args: unknown[]) => void) & { queue: IArguments[] }),
  };
  const context = vm.createContext({ window, navigator: privacy, document: {
    readyState,
    head: { appendChild: (script: typeof scripts[number]) => scripts.push(script) },
    createElement: () => ({ src: "", async: false }),
  } });
  const run = () => vm.runInContext(metaPixelScript("test-pixel"), context);
  return { window, scripts, listeners, idle, run };
}

test("organic page preserves early conversion events before downloading the pixel", () => {
  const b = browser();
  b.run();
  b.window.fbq?.("track", "Lead", { source: "website" });
  assert.equal(b.scripts.length, 0);
  assert.deepEqual(Array.from(b.window.fbq!.queue, args => Array.from(args).slice(0, 2)), [
    ["init", "test-pixel"], ["track", "PageView"], ["track", "Lead"],
  ]);
  b.listeners.get("load")!();
  assert.equal(b.scripts.length, 0);
  b.idle[0]();
  b.idle[0]();
  b.run();
  assert.equal(b.scripts.length, 1);
  assert.equal(b.scripts[0].src, "https://connect.facebook.net/en_US/fbevents.js");
});

test("organic client navigation after load schedules the pixel and older browsers fall back", () => {
  const b = browser("/free-demo", {}, "complete");
  delete (b.window as Partial<typeof b.window>).requestIdleCallback;
  b.run();
  assert.equal(b.scripts.length, 0);
  b.idle[0]();
  assert.equal(b.scripts.length, 1);
});

test("Meta campaign page keeps immediate pixel loading", () => {
  const b = browser("/demo/");
  b.run();
  assert.equal(b.scripts.length, 1);
  assert.equal(b.idle.length, 0);
});

test("privacy signals prevent the pixel and event queue", () => {
  for (const privacy of [{ doNotTrack: "1" }, { globalPrivacyControl: true }]) {
    const b = browser("/free-demo/", privacy);
    b.run();
    assert.equal(b.scripts.length, 0);
    assert.equal(b.window.fbq, undefined);
    assert.equal(b.listeners.size, 0);
  }
});
