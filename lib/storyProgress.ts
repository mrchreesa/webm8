/** Timing maths for the homepage story. Pure, so it is tested without a browser. */

export const STORY_BOUNDS = [0, 0.1, 0.32, 0.54, 0.76, 1] as const;

export type StoryChapter = 0 | 1 | 2 | 3 | 4;
export type StoryStep = Exclude<StoryChapter, 0>;

/** How long each chapter plays, in milliseconds. Chapter 0 is the lead-in; the site (2) gets the longest look. */
export const CHAPTER_MS = [800, 2300, 3000, 2600, 2500] as const;

export const STORY_PLAY_MS = CHAPTER_MS.reduce((total, ms) => total + ms, 0);

/** The finished story stays on screen this long before the next turn. */
export const STORY_HOLD_MS = 1600;

/** One trade's turn: the story, then the hold. */
export const STORY_TURN_MS = STORY_PLAY_MS + STORY_HOLD_MS;

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Story progress (0 to 1) at a moment in a turn. Each chapter runs for its own time. */
export function playProgress(elapsedMs: number): number {
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  let start = 0;
  for (let chapter = 0; chapter < CHAPTER_MS.length; chapter++) {
    const duration = CHAPTER_MS[chapter];
    if (elapsed < start + duration) {
      const from = STORY_BOUNDS[chapter];
      const to = STORY_BOUNDS[chapter + 1];
      return from + (to - from) * ((elapsed - start) / duration);
    }
    start += duration;
  }
  return 1;
}

/** The moment in a turn that shows a chapter, `amount` of the way through. */
export function chapterTime(chapter: StoryChapter, amount = 0): number {
  let start = 0;
  for (let i = 0; i < chapter; i++) start += CHAPTER_MS[i];
  return start + CHAPTER_MS[chapter] * clamp01(amount);
}

export function chapterAt(progress: number): StoryChapter {
  const p = clamp01(progress);
  let chapter = 0;
  for (let i = 1; i < STORY_BOUNDS.length - 1; i++) if (p >= STORY_BOUNDS[i]) chapter = i;
  return chapter as StoryChapter;
}

export function chapterProgress(progress: number, chapter: StoryStep): number {
  const start = STORY_BOUNDS[chapter];
  const end = STORY_BOUNDS[chapter + 1];
  return clamp01((clamp01(progress) - start) / (end - start));
}

export function typedText(text: string, amount: number): string {
  return text.slice(0, Math.round(text.length * clamp01(amount)));
}

/** Within chapter 3 the four form fields fill one after another. */
export function fieldFill(chapterAmount: number, index: number): number {
  const start = 0.06 + index * 0.16;
  return clamp01((chapterAmount - start) / 0.14);
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
