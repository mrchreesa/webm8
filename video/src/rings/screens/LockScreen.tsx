import { mix, punch } from "../../motion.ts";
import { color, font } from "../../theme.ts";
import type { Enquiry } from "../story.ts";
import { GlobeIcon, StatusBar } from "./ui.tsx";

/** One enquiry as a lock-screen notification, 358 CSS px wide. */
export function NotificationCard({ enquiry }: { enquiry: Enquiry }) {
  return (
    <div
      style={{
        width: 358,
        padding: "13px 15px",
        borderRadius: 22,
        background: "rgba(250, 250, 252, 0.96)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
        display: "flex",
        gap: 12,
        color: "#1d1d1f",
        fontFamily: font.sans,
      }}
    >
      <div style={{ flex: "0 0 40px", height: 40, borderRadius: 11, background: color.electric, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <GlobeIcon size={23} color="#fff" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6e6e73" }}>
          <span style={{ fontWeight: 600 }}>{enquiry.business}</span>
          <span>now</span>
        </div>
        <div style={{ marginTop: 2, fontSize: 15, fontWeight: 600 }}>{enquiry.title}</div>
        <div style={{ marginTop: 1, fontSize: 14, lineHeight: 1.3 }}>{enquiry.body}</div>
      </div>
    </div>
  );
}

/** The owner's phone: the time, and the enquiry slamming in at `lands`. */
export function LockScreen({ enquiry, frame, lands }: { enquiry: Enquiry; frame: number; lands: number }) {
  const landed = punch(frame, lands, 10, 9);
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(130% 90% at 30% 10%, ${color.inkRaised}, ${color.night} 75%)`, color: "#fff" }}>
      <StatusBar time="" color="#fff" />
      <div style={{ textAlign: "center", marginTop: 26, fontSize: 18, fontWeight: 600, opacity: 0.85 }}>Thursday, October 2</div>
      <div style={{ textAlign: "center", fontSize: 92, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.03em" }}>9:43</div>
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 238,
          opacity: frame >= lands ? 1 : 0,
          transform: `translateY(${mix(-60, 0, landed)}px) scale(${mix(1.25, 1, landed)})`,
          transformOrigin: "50% 0",
        }}
      >
        <NotificationCard enquiry={enquiry} />
      </div>
    </div>
  );
}
