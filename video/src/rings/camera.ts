/**
 * The camera inside the phone: it leans in on whatever the customer is doing
 * (the search bar while the query types, the result they tap, the site's
 * button, the request's send button) so the action reads at feed size. Pure
 * maths, tested in camera.test.ts.
 */
import { easeInOut } from "../timeline.ts";
import type { Round } from "./timeline.ts";

/** Where the camera looks, in CSS px of the screen, and how far in it is. */
export type Focus = { x: number; y: number; zoom: number };
export type CameraKey = { at: number; focus: Focus };
type Point = { x: number; y: number };

/** The places on each screen the camera visits, in CSS px of the screen. */
export type Points = {
  searchBar: Point;
  topResult: Point;
  websiteChip: Point;
  siteButton: Point;
  sheet: Point;
  sendButton: Point;
};

/**
 * The camera's keyframes for a round. `round.zoom` scales how far in it goes:
 * the first round leans in hardest, the faster ones less. A key that would not
 * land strictly between its neighbours is left out.
 */
export function cameraKeys(round: Round, points: Points, screenHeight: number): CameraKey[] {
  const z = (full: number) => 1 + (full - 1) * round.zoom;
  const whole = { x: 195, y: screenHeight / 2, zoom: 1 };
  const at = (point: Point, zoom: number): Focus => ({ ...point, zoom: z(zoom) });
  const wanted: CameraKey[] = [
    { at: round.search.from, focus: at(points.searchBar, 2.1) },
    { at: round.typing.to, focus: at(points.searchBar, 2.1) },
    // Snap to the results the moment they drop in, so the business's name is never cut off.
    { at: round.resultsFrom, focus: at(points.topResult, 1.4) },
    { at: round.tapResult - 7, focus: at(points.topResult, 1.4) },
    { at: round.tapResult - 2, focus: at(points.websiteChip, 2.1) },
    { at: round.search.to - 1, focus: at(points.websiteChip, 2.1) },

    { at: round.site.from, focus: whole },
    { at: round.scroll.to, focus: whole },
    { at: round.tapButton - 2, focus: at(points.siteButton, 1.8) },
    { at: round.site.to - 1, focus: at(points.siteButton, 1.8) },

    // The sheet's fields run edge to edge, so it is held nearly whole while it fills.
    { at: round.form.from, focus: whole },
    { at: round.fill.from, focus: at(points.sheet, 1.08) },
    { at: round.fill.to, focus: at(points.sheet, 1.08) },
    { at: round.tapSend - 3, focus: at(points.sendButton, 1.45) },
    { at: round.form.to - 1, focus: at(points.sendButton, 1.45) },
  ];
  const keys: CameraKey[] = [];
  for (const key of wanted) {
    if (keys.length === 0 || key.at > keys[keys.length - 1].at) keys.push(key);
  }
  return keys;
}

export function cameraAt(frame: number, keys: CameraKey[]): Focus {
  if (frame <= keys[0].at) return keys[0].focus;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.at) {
      const t = easeInOut((frame - a.at) / (b.at - a.at));
      return {
        x: a.focus.x + (b.focus.x - a.focus.x) * t,
        y: a.focus.y + (b.focus.y - a.focus.y) * t,
        zoom: a.focus.zoom + (b.focus.zoom - a.focus.zoom) * t,
      };
    }
  }
  return keys[keys.length - 1].focus;
}

/**
 * How to move the screen's content so the focus sits in the middle, without
 * ever pulling an edge of the content into view. Apply as
 * `translate(x, y) scale(zoom)` with the transform origin at the top left.
 */
export function viewOf(focus: Focus, width: number, height: number): { x: number; y: number; zoom: number } {
  const { zoom } = focus;
  const clamp = (value: number, min: number) => Math.min(0, Math.max(min, value));
  return {
    x: clamp(width / 2 - focus.x * zoom, width - width * zoom),
    y: clamp(height / 2 - focus.y * zoom, height - height * zoom),
    zoom,
  };
}

/** Where a point of the content lands on screen under a view. */
export function onScreen(point: Point, view: { x: number; y: number; zoom: number }): Point {
  return { x: view.x + point.x * view.zoom, y: view.y + point.y * view.zoom };
}
