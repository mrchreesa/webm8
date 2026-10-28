import { easeInOut } from "../../timeline.ts";
import type { RoundStory } from "../story.ts";
import { length, type Round } from "../timeline.ts";

const SHEET_BOTTOM = 30;
const BUTTON = 52;

/** The send button's centre, which the customer taps, for a screen this tall in CSS px. */
export function sendButtonAt(screenCssHeight: number): { x: number; y: number } {
  return { x: 195, y: screenCssHeight - SHEET_BOTTOM - BUTTON / 2 };
}

/** The request sheet over the site: it slides up, the answers fill in one by one, then it sends. */
export function FormSheet({ story, round, frame }: { story: RoundStory; round: Round; frame: number }) {
  const { form, palette } = story.trade;
  const rise = easeInOut(Math.min(1, Math.max(0, (frame - round.sheetIn.from) / length(round.sheetIn))));
  const perField = length(round.fill) / form.fields.length;
  const sent = frame >= round.tapSend + 2;

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(0, 0, 0, ${0.45 * rise})` }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: `12px 22px ${SHEET_BOTTOM}px`,
          borderRadius: "24px 24px 0 0",
          background: "#fff",
          color: palette.ink,
          transform: `translateY(${(1 - rise) * 100}%)`,
        }}
      >
        <div style={{ width: 38, height: 5, borderRadius: 5, background: "#d5d9de", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-0.01em" }}>{form.title}</div>
        <div style={{ marginTop: 4, fontSize: 14, color: "#5f6368" }}>{form.sub}</div>
        {form.fields.map((field, k) => {
          const filled = frame >= round.fill.from + k * perField;
          const active = filled && frame < round.fill.from + (k + 1) * perField;
          return (
            <div key={field.label} style={{ marginTop: 13 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#5f6368", marginBottom: 6 }}>{field.label}</div>
              <div
                style={{
                  height: 44,
                  borderRadius: 10,
                  border: `1.5px solid ${active ? palette.primary : "#d7dbe0"}`,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  fontSize: 16,
                }}
              >
                {filled ? field.value : ""}
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 18,
            height: BUTTON,
            borderRadius: BUTTON / 2,
            background: sent ? "#11823b" : palette.accent,
            color: sent ? "#fff" : palette.accentInk,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          {sent ? "Sent" : form.button}
          {sent ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5 10 17.5 19 7" />
            </svg>
          ) : null}
        </div>
      </div>
    </>
  );
}
