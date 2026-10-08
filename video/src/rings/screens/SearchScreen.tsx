import { mix, punch } from "../../motion.ts";
import type { RoundStory } from "../story.ts";
import { typedLength, type Round } from "../timeline.ts";
import { StatusBar } from "./ui.tsx";

const RESULTS_TOP = 300;
/** The middle of the query as it types, left of the bar's centre. CSS px of the screen. */
export const SEARCH_TEXT = { x: 140, y: 74 };
/** The top result's "Website" chip, which the customer taps. CSS px of the screen. */
export const WEBSITE_CHIP = { x: 66, y: RESULTS_TOP + 14 + 26 + 4 + 22 + 12 + 17 };

const grey = "#5f6368";

/** A local search: the query types itself, suggestions show, then the results drop in with the business on top. */
export function SearchScreen({ story, round, frame }: { story: RoundStory; round: Round; frame: number }) {
  const { trade } = story;
  const typed = trade.query.slice(0, typedLength(frame, round.typing, trade.query));
  const typing = frame < round.typing.to;
  const showResults = frame >= round.resultsFrom;
  const drop = punch(frame, round.resultsFrom, 8, 14);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", color: "#202124" }}>
      <StatusBar time="9:41" color="#202124" />
      <div
        style={{
          margin: "4px 14px 0",
          height: 48,
          borderRadius: 24,
          background: "#f1f3f4",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 18px",
          fontSize: 17,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={grey} strokeWidth="2.4" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 21 21" />
        </svg>
        <span>{typed}</span>
        {typing || !showResults ? <i style={{ width: 2, height: 22, marginLeft: -10, background: "#1a73e8", opacity: typing || frame % 16 < 8 ? 1 : 0 }} /> : null}
      </div>

      {showResults ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 112, transform: `translateY(${mix(40, 0, drop)}px)` }}>
          <div style={{ display: "flex", gap: 26, padding: "0 22px", height: 38, alignItems: "center", fontSize: 14, color: grey, borderBottom: "1px solid #ebebeb" }}>
            <span style={{ color: "#1a73e8", fontWeight: 600, borderBottom: "3px solid #1a73e8", paddingBottom: 8, marginTop: 11 }}>All</span>
            <span>Maps</span>
            <span>Images</span>
            <span>News</span>
          </div>
          <Map />
        </div>
      ) : (
        <div style={{ padding: "22px 22px 0" }}>
          <div style={{ fontSize: 13, color: grey, marginBottom: 6 }}>Searched near you today</div>
          {story.suggestions.map((query) => (
            <div key={query} style={{ height: 46, display: "flex", alignItems: "center", gap: 14, fontSize: 16, borderBottom: "1px solid #f1f1f1" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={grey} strokeWidth="2" strokeLinecap="round">
                <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
              </svg>
              {query}
            </div>
          ))}
        </div>
      )}

      {showResults ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: RESULTS_TOP, transform: `translateY(${mix(70, 0, drop)}px)` }}>
          <div style={{ padding: "14px 18px 16px", borderBottom: "1px solid #ebebeb" }}>
            <div style={{ height: 26, fontSize: 19, fontWeight: 600 }}>{trade.exampleName}</div>
            <div style={{ height: 22, marginTop: 4, fontSize: 14, color: grey, whiteSpace: "nowrap" }}>
              {story.rating} <span style={{ color: "#fbbc04" }}>★★★★★</span> ({trade.reviewCount}) · {trade.category}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {["Website", "Directions", "Call"].map((action, i) => (
                <span
                  key={action}
                  style={{
                    height: 34,
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 17,
                    fontSize: 14,
                    fontWeight: 600,
                    color: i === 0 ? "#fff" : "#1a73e8",
                    background: i === 0 ? "#1a73e8" : "#fff",
                    border: i === 0 ? "none" : "1px solid #dadce0",
                  }}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>
          {trade.competitors.map((competitor) => (
            <div key={competitor.name} style={{ padding: "14px 18px", borderBottom: "1px solid #ebebeb" }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{competitor.name}</div>
              <div style={{ marginTop: 4, fontSize: 14, color: grey }}>
                <span style={{ color: "#fbbc04" }}>★★★★</span>
                <span style={{ color: "#dadce0" }}>★</span> {competitor.rating}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Map() {
  return (
    <svg width="390" height="150" viewBox="0 0 300 115" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <rect width="300" height="115" fill="#e8ede4" />
      <path d="M0 80 C 80 66, 160 100, 300 70" stroke="#a9cdf0" strokeWidth="11" fill="none" />
      <rect x="190" y="10" width="70" height="34" rx="6" fill="#cfe6c3" />
      <g stroke="#fff" strokeWidth="6" fill="none">
        <path d="M0 34 H300" />
        <path d="M60 0 V115" />
        <path d="M150 0 C 140 50, 170 75, 160 115" />
        <path d="M0 100 L300 26" />
      </g>
      {[
        [112, 58, true],
        [214, 80, false],
        [54, 38, false],
      ].map(([x, y, top]) => (
        <g key={`${x}`} transform={`translate(${x} ${y})`}>
          <path d="M0 0 C -9 -10, -9 -22, 0 -24 C 9 -22, 9 -10, 0 0 Z" fill={top ? "#ea4335" : "#c5221f"} opacity={top ? 1 : 0.75} />
          <circle cy="-15" r="3.5" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}
