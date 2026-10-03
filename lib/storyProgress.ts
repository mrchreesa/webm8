/** Scroll maths for the homepage story. Pure, so it is tested without a browser. */

export const STORY_BOUNDS = [0, 0.1, 0.32, 0.54, 0.76, 1] as const;

export type StoryChapter = 0 | 1 | 2 | 3 | 4;
export type StoryStep = Exclude<StoryChapter, 0>;

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** How far through the story the reader is, from the section's on-screen top. */
export function storyProgress(sectionTop: number, sectionHeight: number, viewportHeight: number): number {
  const scrollable = sectionHeight - viewportHeight;
  if (scrollable <= 0) return sectionTop < 0 ? 1 : 0;
  return clamp01(-sectionTop / scrollable);
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

/** The scroll position that shows a chapter well under way, for the rail buttons. */
export function chapterScrollTarget(
  sectionTopOnPage: number,
  sectionHeight: number,
  viewportHeight: number,
  chapter: StoryStep,
): number {
  const scrollable = Math.max(0, sectionHeight - viewportHeight);
  const start = STORY_BOUNDS[chapter];
  const end = STORY_BOUNDS[chapter + 1];
  return Math.round(sectionTopOnPage + scrollable * (start + (end - start) * 0.55));
}
