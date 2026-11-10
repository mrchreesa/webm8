import type { AnimationEventHandler, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { drawnSiteOf, initialOf, ratingOf, trades, type DrawnSite, type Trade, type TradeKey } from "@/lib/trades";
import { sketchFonts, type SketchFont } from "./sketchFonts";
import s from "./sketch.module.css";

/**
 * The sketch's templates: one first idea of a homepage per trade, each built
 * round one moving thing of its own (a pipe that draws itself, a sign that
 * comes on, a map of the visitor's area). The copy is the trade's drawn site
 * in lib/trades.ts; the visitor's business name goes on every one.
 *
 * "local" is not a trade: it is /instant/'s "Local services", which has no
 * single trade to speak for it, so it shows the area the visitor serves.
 */
export type SketchId = TradeKey | "local";

type Look = { font?: SketchFont; /** The stage's light, as "r g b". */ glow: string };

export const sketchLooks: Record<SketchId, Look> = {
  plumbing: { font: "barlow", glow: "224 138 60" },
  electrical: { font: "barlow", glow: "250 204 21" },
  hvac: { font: "bricolage", glow: "92 200 255" },
  roofing: { font: "bricolage", glow: "226 110 70" },
  landscaping: { font: "fraunces", glow: "90 190 90" },
  cleaning: { font: "bricolage", glow: "100 210 220" },
  moving: { font: "bricolage", glow: "43 108 252" },
  local: { font: "bricolage", glow: "43 108 252" },
  restaurant: { font: "yellowtail", glow: "255 62 150" },
  barber: { font: "anton", glow: "255 70 70" },
  cafe: { font: "fraunces", glow: "214 150 90" },
  medspa: { font: "marcellus", glow: "196 150 190" },
  salon: { font: "cormorant", glow: "240 120 170" },
  dental: { font: "bricolage", glow: "80 200 230" },
  fitness: { font: "anton", glow: "240 78 35" },
  ecommerce: { font: "bricolage", glow: "140 130 240" },
  other: { glow: "190 235 40" },
};

/** "Local services" speaks for no one trade, so it has copy of its own. */
const localCopy: DrawnSite = {
  headline: "Friendly, reliable and just around the corner.",
  badge: "Same-week visits",
  sub: "Free quotes, fair prices and people who show up on time.",
  cta: "Get a free quote",
  phone: "",
  services: ["Our services", "Prices", "Reviews"],
  review: { quote: "", name: "" },
};

/** The request the card behind the phone announces. */
export function sketchRequest(id: SketchId) {
  return id === "local" ? "New enquiry" : trades[id].notification.title;
}

type Parts = { trade: Trade; c: DrawnSite; name: string; area: string };

/** A part's place in the build: each rises in after the one before. */
const at = (i: number) => ({ "--i": i }) as CSSProperties;

const Stars = () => <i className={s.stars}>★★★★★</i>;

function Nav({ name, right }: { name: string; right?: ReactNode }) {
  return (
    <div className={s.nav}>
      <b className={s.dfont}>{name}</b>
      {right ?? <i className={s.burger} />}
    </div>
  );
}

function Buttons({ c, second, i }: { c: DrawnSite; second?: string; i: number }) {
  return (
    <div style={at(i)}>
      <span className={s.btn}>{c.cta}</span>
      {second ? <span className={s.btn}>{second}</span> : null}
    </div>
  );
}

function Meta({ trade, c, i }: { trade: Trade; c: DrawnSite; i: number }) {
  return (
    <div className={s.meta} style={at(i)}>
      <span><Stars /> {ratingOf(trade)} from {trade.reviewCount} reviews</span>
      <span>{c.badge}</span>
    </div>
  );
}

function Copy({ c, i }: { c: DrawnSite; i: number }) {
  return (
    <>
      <p className={s.h} style={at(i)}>{c.headline}</p>
      <p className={s.p} style={at(i + 1)}>{c.sub}</p>
    </>
  );
}

const Chips = ({ items, i }: { items: readonly string[]; i: number }) => (
  <div className={s.chips} style={at(i)}>{items.map((item) => <span key={item}>{item}</span>)}</div>
);

const Rows = ({ items, i }: { items: readonly string[]; i: number }) => (
  <div className={s.rows} style={at(i)}>{items.map((item) => <div key={item}><span>{item}</span><span>›</span></div>)}</div>
);

const roads = (
  <g fill="none" stroke="#fff" strokeWidth="2.4">
    <path d="M-5 20 40 12 105 30M-5 52 55 44 105 60M22-5 30 75M68-5 60 75" />
    <path strokeWidth="1.1" d="M-5 36 105 42M45-5 50 75M84-5 86 75M8-5 6 75" />
    <path stroke="none" fill="#c7e6c9" d="M70 4h22v14H70z" />
    <path stroke="none" fill="#b9d3f7" d="M-2 58q20-8 30 14H-2z" />
  </g>
);

/** Plumbing's copper pipe and electrical's cable, drawn round the page. */
function Line({ trade, c, name }: Parts) {
  const wire = trade.key === "electrical";
  const d = wire ? "M8 0V34L13 44 3 56 8 66V128H93" : "M8 0V118Q8 128 18 128H84Q93 128 93 138V150";
  return (
    <>
      <div className={s.line}>
        <svg className={s.draw} viewBox="0 0 100 216" preserveAspectRatio="none">
          <path pathLength={1} d={d} stroke={wire ? "#facc15" : "#b96a2c"} strokeWidth={wire ? 1.4 : 3.2} />
          {wire ? null : <path pathLength={1} d={d} stroke="#f0b27a" strokeWidth={1} />}
        </svg>
      </div>
      <Nav name={name} right={<i />} />
      <Copy c={c} i={1} />
      <Buttons c={c} second="Call now" i={3} />
      <Meta trade={trade} c={c} i={4} />
    </>
  );
}

function Hvac({ c, name }: Parts) {
  return (
    <>
      <Nav name={name} />
      <div className={s.dial} style={at(1)}>
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" pathLength={1} />
          <circle cx="50" cy="50" r="44" pathLength={1} />
        </svg>
        <div><b>21°</b>{c.badge}</div>
      </div>
      <Copy c={c} i={2} />
      <Buttons c={c} i={4} />
      <Chips items={c.services} i={5} />
    </>
  );
}

function Roofing({ trade, c, name }: Parts) {
  return (
    <>
      <Nav name={name} />
      <div className={s.sky} style={at(1)}>
        <i />
        <svg className={s.draw} viewBox="0 0 100 58" preserveAspectRatio="none">
          <polygon points="0,58 0,46 32,20 46,31 46,23 54,23 54,37 70,50 100,34 100,58" fill="#2a1006" />
          <path pathLength={1} d="M0 46 32 20 46 31V23H54V37L70 50 100 34" stroke="#ffd9a0" strokeWidth={1} />
        </svg>
      </div>
      <Copy c={c} i={2} />
      <Buttons c={c} i={4} />
      <Meta trade={trade} c={c} i={5} />
    </>
  );
}

const leaves = [[80, 176, -30], [91, 148, 30], [78, 118, -35], [90, 88, 30], [77, 58, -35], [86, 30, 25]] as const;

function Landscaping({ trade, c, name }: Parts) {
  return (
    <>
      <div className={s.vine}>
        <svg className={s.draw} viewBox="0 0 100 216" preserveAspectRatio="none">
          <path pathLength={1} d="M88 216C70 170 96 140 84 100S92 50 80 14" stroke="#2f7a32" strokeWidth={1.4} />
          {leaves.map(([x, y, turn], i) => (
            <g key={y} transform={`rotate(${turn} ${x} ${y})`}>
              <ellipse cx={x} cy={y} rx="9" ry="4" fill={i % 2 ? "#4fa64f" : "#7cc46a"} style={at(leaves.length - i)} />
            </g>
          ))}
        </svg>
      </div>
      <Nav name={name} />
      <Copy c={c} i={1} />
      <Buttons c={c} i={3} />
      <Meta trade={trade} c={c} i={4} />
    </>
  );
}

function Cleaning({ trade, c, name }: Parts) {
  return (
    <>
      <Nav name={name} />
      <div className={s.glass} style={at(1)}>
        <i style={{ top: "14%", left: "20%", ...at(0) }}>✦</i>
        <i style={{ top: "48%", left: "62%", ...at(1) }}>✦</i>
        <i style={{ top: "22%", left: "78%", fontSize: "5cqi", ...at(2) }}>✦</i>
      </div>
      <Copy c={c} i={2} />
      <Buttons c={c} i={4} />
      <Meta trade={trade} c={c} i={5} />
    </>
  );
}

function Moving({ trade, c, name }: Parts) {
  return (
    <>
      <Nav name={name} />
      <div className={s.map} style={at(1)}>
        <svg viewBox="0 0 100 70" preserveAspectRatio="none">
          {roads}
          <g className={s.draw}>
            <path pathLength={1} d="M18 49C30 30 52 60 62 40S74 24 82 22" stroke="#1765c9" strokeWidth={1.8} />
          </g>
        </svg>
        <i className={s.pin} style={{ left: "18%", top: "70%" }} />
        <i className={s.pin} style={{ left: "82%", top: "32%", animationDelay: "1.9s" }} />
      </div>
      <Copy c={c} i={2} />
      <Buttons c={c} i={4} />
      <Meta trade={trade} c={c} i={5} />
    </>
  );
}

function Local({ trade, c, name, area }: Parts) {
  return (
    <>
      <Nav name={name} />
      <div className={s.map} style={at(1)}>
        <svg viewBox="0 0 100 70" preserveAspectRatio="none">{roads}</svg>
        <i className={s.ring} />
        <i className={s.ring} style={{ animationDelay: "-1.3s" }} />
        <i className={s.pin} style={{ left: "50%", top: "52%" }} />
        <span className={s.place}>Serving {area || "your area"} and nearby</span>
      </div>
      <Copy c={c} i={2} />
      <Buttons c={c} i={4} />
      <Meta trade={trade} c={c} i={5} />
    </>
  );
}

function Restaurant({ c, name }: Parts) {
  return (
    <>
      <div className={s.bg} />
      <Nav name={name} right={<span>Menu</span>} />
      <p className={s.sign}>{name}</p>
      <span className={s.pill} style={at(2)}><i />{c.badge}</span>
      <p className={s.p} style={at(3)}>{c.sub}</p>
      <Buttons c={c} second="See the menu" i={4} />
      <Rows items={c.services} i={5} />
    </>
  );
}

function Barber({ c, name }: Parts) {
  return (
    <>
      <div className={s.nav}><span>{c.badge}</span><i className={s.burger} /></div>
      <p className={s.sign}>{name}</p>
      <div className={s.pole} style={at(2)} />
      <p className={s.p} style={at(3)}>{c.headline} {c.sub}</p>
      <Buttons c={c} second="See prices" i={4} />
      <Rows items={c.services} i={5} />
    </>
  );
}

function Cafe({ c, name }: Parts) {
  return (
    <>
      <Nav name={name} />
      <div className={s.cup} style={at(1)}>
        <svg viewBox="0 0 30 30" preserveAspectRatio="none">
          {[5, 15, 25].map((x, i) => <path key={x} pathLength={1} strokeWidth={1.5} style={at(i)} d={`M${x} 30C${x - 5} 22 ${x + 5} 14 ${x} 4`} />)}
        </svg>
      </div>
      <span className={s.pill} style={at(2)}><i />{c.badge}</span>
      <Copy c={c} i={3} />
      <Buttons c={c} i={5} />
    </>
  );
}

function Satin({ trade, c, name }: Parts) {
  const spa = trade.key === "medspa";
  return (
    <>
      <div className={cn(s.bg, s.satin)} />
      <div className={s.nav}>Menu</div>
      <p className={s.name} style={at(1)}>{name}</p>
      <p className={s.kind} style={at(2)}>{spa ? "Skin and aesthetics" : "Hair studio"}</p>
      <p className={s.p} style={at(3)}>{c.sub}</p>
      <Buttons c={c} second={spa ? "Explore treatments" : "See our work"} i={4} />
      <Chips items={["Thu 2:15", "Fri 10:00", "Sat 11:30"]} i={5} />
    </>
  );
}

function Dental({ c, name }: Parts) {
  return (
    <>
      <Nav name={name} />
      <div className={s.smile} style={at(1)}>
        <svg className={s.draw} viewBox="0 0 100 100">
          <path pathLength={1} d="M26 52Q50 84 74 52" stroke="#0e7490" strokeWidth={6} />
        </svg>
        <i>✦</i>
      </div>
      <Copy c={c} i={2} />
      <Buttons c={c} i={4} />
      <Chips items={c.services} i={5} />
    </>
  );
}

function Fitness({ trade, c, name }: Parts) {
  return (
    <>
      <Nav name={name} />
      <p className={s.h} style={at(1)}>{c.headline}</p>
      <div className={s.beat} style={at(2)}>
        <svg className={s.draw} viewBox="0 0 100 22" preserveAspectRatio="none">
          <polyline pathLength={1} points="0,12 28,12 34,4 40,20 46,2 52,16 58,12 100,12" stroke="#160803" strokeWidth={1.2} />
        </svg>
      </div>
      <p className={s.p} style={at(3)}>{c.sub}</p>
      <Buttons c={c} i={4} />
      <Meta trade={trade} c={c} i={5} />
    </>
  );
}

const goods = [
  { price: "$48", c1: "#c9c3f2", c2: "#8f86d6", r: "-12deg", x: "-24cqi", y: "3cqi" },
  { price: "$36", c1: "#f7c8a8", c2: "#ef9f76", r: "12deg", x: "24cqi", y: "3cqi" },
  { price: "$64", c1: "#efe2cd", c2: "#cdb28f", r: "0deg", x: "0cqi", y: "0cqi" },
];

function Shop({ c, name }: Parts) {
  return (
    <>
      <Nav name={name} right={<span>Bag (1)</span>} />
      <div className={s.fan} style={at(1)}>
        {goods.map((item, i) => (
          <div key={item.price} style={{ "--c1": item.c1, "--c2": item.c2, "--r": item.r, "--x": item.x, "--y": item.y, ...at(i) } as CSSProperties}>
            <span>{item.price}</span>
          </div>
        ))}
      </div>
      <Copy c={c} i={2} />
      <Buttons c={c} i={4} />
      <Chips items={[c.badge]} i={5} />
    </>
  );
}

function Other({ c, name }: Parts) {
  return (
    <>
      <Nav name={name} />
      <div className={s.orbit} style={at(1)}><i /><i /><b>{initialOf(name)}</b></div>
      <p className={s.h} style={at(2)}>{name}</p>
      <p className={s.p} style={at(3)}>{c.headline} {c.sub}</p>
      <Buttons c={c} i={4} />
    </>
  );
}

const templates: Record<SketchId, (parts: Parts) => ReactNode> = {
  plumbing: Line,
  electrical: Line,
  hvac: Hvac,
  roofing: Roofing,
  landscaping: Landscaping,
  cleaning: Cleaning,
  moving: Moving,
  local: Local,
  restaurant: Restaurant,
  barber: Barber,
  cafe: Cafe,
  medspa: Satin,
  salon: Satin,
  dental: Dental,
  fitness: Fitness,
  ecommerce: Shop,
  other: Other,
};

type SketchTemplateProps = {
  id: SketchId;
  name: string;
  /** The town or area the visitor serves, where the form asks for one. */
  area?: string;
  onAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
};

export function SketchTemplate({ id, name, area = "", onAnimationEnd }: SketchTemplateProps) {
  const trade = trades[id === "local" ? "other" : id];
  const c = id === "local" ? localCopy : drawnSiteOf(trade);
  const font = sketchLooks[id].font;
  const Body = templates[id];
  return (
    <div
      className={cn(s.site, s[id])}
      style={font ? ({ "--display": `${sketchFonts[font]}, sans-serif` } as CSSProperties) : undefined}
      onAnimationEnd={onAnimationEnd}
    >
      <Body trade={trade} c={c} name={name} area={area} />
    </div>
  );
}

/** The empty page the phone shows until a type of business is chosen. */
export function SketchBlueprint({ name }: { name: string }) {
  return (
    <div className={cn(s.site, s.blueprint)}>
      <div className={s.bg} />
      <div className={s.nav}>{name ? <b>{name}</b> : null}</div>
      <div className={s.box} style={{ height: "52cqi", ...at(1) }}>Your picture</div>
      <div className={s.box} style={{ height: "16cqi", ...at(2) }}>Your headline</div>
      <div className={s.box} style={{ height: "11cqi", marginRight: "34cqi", ...at(3) }}>Your button</div>
      <div className={s.box} style={{ height: "30cqi", ...at(4) }}>Your services</div>
    </div>
  );
}
