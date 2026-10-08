/*
 * The drawn picture on each trade's example site. Flat shapes in the trade's
 * own colours, sized by the layout that holds them (see site.module.css).
 * Only one trade is drawn at a time, so the gradient and pattern ids stay
 * unique on the page.
 */

import site from "./site.module.css";

const svg = { "aria-hidden": true, focusable: false } as const;

/** A four-point sparkle centred on (x, y). */
function sparkle(x: number, y: number, r: number) {
  return `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;
}

/* ----- Utility: a picture card above the headline ----- */

export function HvacArt() {
  return (
    <svg {...svg} viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hvac-ring" x1="0" x2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="0.5" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <rect width="200" height="130" fill="#1e3a8a" />
      <g fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="2.4" strokeLinecap="round">
        <path d="M6 44c8-6 14 6 22 0s14 6 22 0" />
        <path d="M6 64c8-6 14 6 22 0s14 6 22 0" />
        <path d="M6 84c8-6 14 6 22 0s14 6 22 0" />
        <path d="M150 44c8-6 14 6 22 0s14 6 22 0" />
        <path d="M150 64c8-6 14 6 22 0s14 6 22 0" />
        <path d="M150 84c8-6 14 6 22 0s14 6 22 0" />
      </g>
      <circle cx="100" cy="66" r="52" fill="#172f6e" />
      <path d="M70.3 95.7A42 42 0 1 1 129.7 95.7" fill="none" stroke="url(#hvac-ring)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="100" cy="66" r="33" fill="#f8fafc" />
      <circle cx="127" cy="33.8" r="5" fill="#fff" stroke="#fb923c" strokeWidth="2.5" />
      <text x="100" y="73" textAnchor="middle" fontSize="23" fontWeight="800" fill="#0c1a3d" letterSpacing="-1">72°</text>
      <text x="100" y="85" textAnchor="middle" fontSize="6.4" fontWeight="600" fill="#2563eb">Cooling to 70°</text>
    </svg>
  );
}

export function ElectricalArt() {
  return (
    <svg {...svg} viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="elec-glow">
          <stop offset="0" stopColor="#facc15" stopOpacity="0.5" />
          <stop offset="1" stopColor="#facc15" stopOpacity="0" />
        </radialGradient>
        <pattern id="elec-hazard" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="14" fill="#facc15" />
        </pattern>
      </defs>
      <rect width="200" height="130" fill="#0b1120" />
      <g fill="none" stroke="#facc15" strokeOpacity="0.28" strokeWidth="1.6">
        <path d="M0 30H40L52 42H70M0 84H30L44 70H62M200 36H160L148 48H132M200 92H168L156 80H138" />
      </g>
      <g fill="#facc15" fillOpacity="0.5">
        <circle cx="70" cy="42" r="2.6" />
        <circle cx="62" cy="70" r="2.6" />
        <circle cx="132" cy="48" r="2.6" />
        <circle cx="138" cy="80" r="2.6" />
      </g>
      <circle cx="100" cy="60" r="48" fill="url(#elec-glow)" />
      <path d="M113 12L70 70H97L86 114L132 52H104Z" fill="#facc15" />
      <path d="M113 12L104 52H132" fill="none" stroke="#fef9c3" strokeWidth="1.6" strokeLinejoin="round" opacity="0.8" />
      <rect y="116" width="200" height="14" fill="#0b1120" />
      <rect y="116" width="200" height="14" fill="url(#elec-hazard)" />
    </svg>
  );
}

export function RoofingArt() {
  return (
    <svg {...svg} viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="roof-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset="1" stopColor="#fff1e6" />
        </linearGradient>
        <pattern id="roof-tiles" width="12" height="8" patternUnits="userSpaceOnUse">
          <rect width="12" height="8" fill="#9a3412" />
          <path d="M0 8A6 6 0 0 1 12 8" fill="none" stroke="#5b1d0a" strokeWidth="1.1" />
        </pattern>
      </defs>
      <rect width="200" height="130" fill="url(#roof-sky)" />
      <circle cx="152" cy="34" r="17" fill="#fff7ed" opacity="0.9" />
      <rect y="116" width="200" height="14" fill="#e8c9b2" />
      <rect x="124" y="30" width="13" height="26" fill="#7c2d12" />
      <rect x="52" y="68" width="96" height="50" fill="#fffaf5" />
      <rect x="64" y="80" width="22" height="18" fill="#fde3cf" stroke="#9a3412" strokeWidth="2" />
      <path d="M75 80V98M64 89H86" stroke="#9a3412" strokeWidth="1.4" />
      <rect x="106" y="86" width="18" height="32" fill="#9a3412" />
      <path d="M34 72L100 22L166 72Z" fill="url(#roof-tiles)" />
      <path d="M34 72L100 22L166 72" fill="none" stroke="#5b1d0a" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

export function OtherArt() {
  return (
    <svg {...svg} viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="other-awning" width="20" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#1f5fd6" />
          <rect x="10" width="10" height="10" fill="#fff" />
        </pattern>
      </defs>
      <rect width="200" height="130" fill="#0e2f56" />
      <rect x="40" y="36" width="120" height="84" fill="#e8effd" />
      <path d="M34 26H166V44C166 50 158 50 158 44C158 50 150 50 150 44C150 50 142 50 142 44C142 50 134 50 134 44C134 50 126 50 126 44C126 50 118 50 118 44C118 50 110 50 110 44C110 50 102 50 102 44C102 50 94 50 94 44C94 50 86 50 86 44C86 50 78 50 78 44C78 50 70 50 70 44C70 50 62 50 62 44C62 50 54 50 54 44C54 50 46 50 46 44C46 50 38 50 38 44V44H34Z" fill="url(#other-awning)" />
      <rect x="52" y="62" width="52" height="40" rx="2" fill="#bcd0f5" />
      <rect x="116" y="62" width="30" height="58" rx="2" fill="#1f5fd6" />
      <rect x="60" y="70" width="34" height="13" rx="6.5" fill="#d4ff35" />
      <text x="77" y="79.4" textAnchor="middle" fontSize="8" fontWeight="800" fill="#071a33">OPEN</text>
      <rect y="120" width="200" height="10" fill="#14365f" />
    </svg>
  );
}

export function PlumbingArt() {
  return (
    <svg {...svg} viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="plumb-tiles" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0.5H0.5V20" fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="200" height="130" fill="#12324f" />
      <rect width="200" height="130" fill="url(#plumb-tiles)" />
      <path d="M-4 40H110C123 40 132 49 132 62V70" fill="none" stroke="#a85c2a" strokeWidth="13" />
      <path d="M-4 40H110C123 40 132 49 132 62V70" fill="none" stroke="#e09a5f" strokeWidth="9" />
      <path d="M-4 37.5H110" stroke="#f6c79c" strokeWidth="1.6" strokeOpacity="0.8" />
      <rect x="40" y="31" width="9" height="18" rx="2" fill="#c47a40" />
      <rect x="92" y="31" width="9" height="18" rx="2" fill="#c47a40" />
      <path d="M70 34V28" stroke="#a85c2a" strokeWidth="4" />
      <circle cx="70" cy="18" r="11" fill="#f8fafc" stroke="#a85c2a" strokeWidth="3" />
      <path d="M70 18L76 12" stroke="#12324f" strokeWidth="2" strokeLinecap="round" />
      <circle cx="70" cy="18" r="1.8" fill="#12324f" />
      <rect x="129" y="58" width="6" height="12" fill="#cbd5e1" />
      <rect x="115" y="56" width="34" height="5" rx="2.5" fill="#e2e8f0" />
      <rect x="122" y="68" width="20" height="13" rx="3" fill="#cbd5e1" />
      <path d="M128 81H136V86C136 88.5 134.2 90 132 90S128 88.5 128 86Z" fill="#94a3b8" />
      <path d="M132 97C128 103 126 106 126 109A6 6 0 0 0 138 109C138 106 136 103 132 97Z" fill="#7dd3fc" />
      <ellipse cx="132" cy="123" rx="22" ry="4" fill="none" stroke="#7dd3fc" strokeOpacity="0.45" strokeWidth="1.5" />
      <ellipse cx="132" cy="123" rx="10" ry="1.8" fill="none" stroke="#7dd3fc" strokeOpacity="0.7" strokeWidth="1.5" />
    </svg>
  );
}

export function MovingArt() {
  return (
    <svg {...svg} viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="#0d3b7a" />
      <circle cx="164" cy="26" r="46" fill="#1765c9" opacity="0.45" />
      <path d="M0 102V74H14V62H30V80H42V58H60V102ZM150 102V70H164V56H178V76H190V64H200V102Z" fill="#0b3266" />
      <rect y="100" width="200" height="30" fill="#082a55" />
      <path d="M0 118H200" stroke="#fbbf24" strokeOpacity="0.6" strokeWidth="2.5" strokeDasharray="14 10" />
      <g stroke="#fff" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 56H28M0 68H24M10 80H30" />
      </g>
      <rect x="38" y="42" width="88" height="56" rx="4" fill="#fff" />
      <rect x="38" y="80" width="88" height="6" fill="#fbbf24" />
      <rect x="54" y="54" width="22" height="18" rx="1.5" fill="#d6a86a" />
      <rect x="80" y="58" width="18" height="14" rx="1.5" fill="#c99556" />
      <path d="M65 54V72M89 58V72" stroke="#f3dfbf" strokeWidth="2.2" />
      <path d="M126 56H148C152 56 155 58 157 61L166 75C167.5 77.5 168 79.5 168 82V98H126Z" fill="#1765c9" />
      <path d="M132 61H147C149 61 150.5 62 151.5 63.5L158 74H132Z" fill="#bfdbfe" />
      <rect x="163" y="86" width="4.5" height="5" rx="1" fill="#fde68a" />
      <rect x="122" y="96" width="48" height="4" rx="2" fill="#0b1b3f" />
      <circle cx="62" cy="100" r="10" fill="#0b1b3f" />
      <circle cx="62" cy="100" r="4" fill="#cbd5e1" />
      <circle cx="146" cy="100" r="10" fill="#0b1b3f" />
      <circle cx="146" cy="100" r="4" fill="#cbd5e1" />
    </svg>
  );
}

/* ----- Poster: big type and a tall picture ----- */

export function BarberArt() {
  const bands = Array.from({ length: 14 }, (_, i) => i);
  const colours = ["#dc2626", "#f5f5f4", "#1d4ed8"];
  return (
    <svg {...svg} viewBox="0 0 40 220">
      <defs>
        <clipPath id="barber-tube">
          <rect x="8" y="30" width="24" height="160" rx="3" />
        </clipPath>
        <linearGradient id="barber-shade" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="barber-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#57534e" />
          <stop offset="0.4" stopColor="#e7e5e4" />
          <stop offset="1" stopColor="#78716c" />
        </linearGradient>
      </defs>
      <rect x="8" y="30" width="24" height="160" fill="#f5f5f4" />
      <g clipPath="url(#barber-tube)">
        <g className={site.pole}>
          {bands.map((i) => {
            const y = i * 12 + 6;
            return <path key={i} d={`M0 ${y}L40 ${y - 24}V${y - 12}L0 ${y + 12}Z`} fill={colours[i % 3]} />;
          })}
        </g>
      </g>
      <rect x="8" y="30" width="24" height="160" fill="url(#barber-shade)" />
      <rect x="5" y="18" width="30" height="13" rx="3" fill="url(#barber-metal)" />
      <circle cx="20" cy="11" r="7" fill="url(#barber-metal)" />
      <rect x="5" y="189" width="30" height="13" rx="3" fill="url(#barber-metal)" />
    </svg>
  );
}

export function FitnessArt() {
  const plate = "#160803";
  return (
    <svg {...svg} viewBox="0 0 40 220">
      <defs>
        <linearGradient id="fit-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#57534e" />
          <stop offset="0.45" stopColor="#f5f5f4" />
          <stop offset="1" stopColor="#78716c" />
        </linearGradient>
      </defs>
      <rect x="16" y="56" width="8" height="108" rx="2" fill="url(#fit-metal)" />
      <path d="M16 98H24M16 103H24M16 108H24M16 113H24M16 118H24M16 123H24" stroke="#57534e" strokeWidth="0.8" />
      <rect x="5" y="16" width="30" height="14" rx="3" fill={plate} />
      <rect x="2" y="30" width="36" height="18" rx="3" fill={plate} />
      <rect x="9" y="48" width="22" height="9" rx="2" fill="#2a1208" />
      <rect x="9" y="163" width="22" height="9" rx="2" fill="#2a1208" />
      <rect x="2" y="172" width="36" height="18" rx="3" fill={plate} />
      <rect x="5" y="190" width="30" height="14" rx="3" fill={plate} />
      <g stroke="#fff" strokeOpacity="0.18" strokeWidth="1">
        <path d="M6 34V44M6 176V186" />
        <path d="M9 19V27M9 193V201" />
      </g>
    </svg>
  );
}

/* ----- Editorial: an arched frame ----- */

export function RestaurantArt() {
  return (
    <svg {...svg} viewBox="0 0 100 116" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="rest-glow" cx="0.5" cy="0.85" r="0.6">
          <stop offset="0" stopColor="#f97316" stopOpacity="0.45" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <pattern id="rest-bricks" width="14" height="16" patternUnits="userSpaceOnUse">
          <rect width="14" height="16" fill="#9a3b1b" />
          <path d="M0 0.5H14M0 8.5H14M0.5 0V8M7.5 8V16" stroke="#6b220d" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100" height="116" fill="#250606" />
      <rect width="100" height="116" fill="url(#rest-glow)" />
      <path d="M8 116V84C8 52 30 30 50 30C70 30 92 52 92 84V116Z" fill="url(#rest-bricks)" />
      <path d="M8 116V84C8 52 30 30 50 30C70 30 92 52 92 84V116" fill="none" stroke="#6b220d" strokeWidth="1.5" />
      <path d="M30 116V96C30 80 40 72 50 72C60 72 70 80 70 96V116Z" fill="#120303" />
      <path d="M30 116V96C30 80 40 72 50 72C60 72 70 80 70 96" fill="none" stroke="#fb923c" strokeOpacity="0.55" strokeWidth="1.6" />
      <g className={site.flame}>
        <path d="M50 112C40 110 37 99 45 90C45 96 49 97 49 92C49 86 53 82 56 78C56 86 64 92 62 102C61 108 56 112 50 112Z" fill="#f97316" />
        <path d="M50 112C45 111 43 105 47 100C48 104 50 104 51 101C52 98 54 96 55 94C56 100 58 104 56 108C55 110 53 112 50 112Z" fill="#fcd34d" />
      </g>
      <path d="M36 113L64 109M36 109L64 113" stroke="#3f1d0b" strokeWidth="3" strokeLinecap="round" />
      <g fill="#fcd34d">
        <circle cx="44" cy="66" r="0.9" />
        <circle cx="57" cy="60" r="0.7" />
        <circle cx="51" cy="54" r="0.6" />
      </g>
    </svg>
  );
}

export function SalonArt() {
  const palette = ["#831843", "#9d174d", "#be185d", "#db2777", "#ec4899", "#f472b6", "#f9a8d4"];
  const strands = Array.from({ length: 15 }, (_, i) => i);
  return (
    <svg {...svg} viewBox="0 0 100 116" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="salon-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf2f8" />
          <stop offset="1" stopColor="#fbcfe8" />
        </linearGradient>
      </defs>
      <rect width="100" height="116" fill="url(#salon-bg)" />
      <g fill="none" strokeLinecap="round">
        {strands.map((i) => {
          const x = 14 + i * 4.2;
          const sway = 18 + (i % 4) * 5;
          return (
            <path
              key={i}
              d={`M${x} -6C${x + 6} 30 ${x - sway} 52 ${x + 4} 78S${x + sway + 10} 104 ${x + 22} 124`}
              stroke={palette[i % palette.length]}
              strokeWidth={i % 3 === 0 ? 5.4 : 3.6}
            />
          );
        })}
        <path d="M30 -6C36 30 12 52 34 78S64 104 72 124" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" />
        <path d="M52 -6C58 30 34 52 56 78S86 104 94 124" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />
      </g>
      <path d={sparkle(84, 20, 6)} fill="#fff" />
      <path d={sparkle(14, 100, 4)} fill="#fff" />
    </svg>
  );
}

export function MedspaArt() {
  const leaves: [number, number, number][] = [
    [17, 104, -30], [25, 96, 32], [23, 86, -36], [31, 78, 26], [29, 68, -40], [36, 60, 22], [35, 50, -42], [41, 42, 16],
  ];
  return (
    <svg {...svg} viewBox="0 0 100 116" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="spa-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7eef4" />
          <stop offset="1" stopColor="#f5d0c5" />
        </linearGradient>
        <radialGradient id="spa-orb" cx="0.4" cy="0.38" r="0.65">
          <stop offset="0" stopColor="#fffaf7" />
          <stop offset="0.55" stopColor="#f5d0c5" />
          <stop offset="1" stopColor="#c99bb9" />
        </radialGradient>
      </defs>
      <rect width="100" height="116" fill="url(#spa-bg)" />
      <circle cx="56" cy="58" r="40" fill="#fff" opacity="0.3" />
      <circle cx="56" cy="58" r="30" fill="url(#spa-orb)" />
      <path d="M12 116C18 92 30 66 44 38" fill="none" stroke="#7f9a7a" strokeWidth="1.6" strokeLinecap="round" />
      {leaves.map(([x, y, angle], index) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="6.2" ry="4" transform={`rotate(${angle} ${x} ${y})`} fill={index % 2 ? "#b9cdb4" : "#9fb79a"} />
      ))}
      <g fill="#fff" opacity="0.75">
        <circle cx="78" cy="26" r="1.8" />
        <circle cx="84" cy="34" r="1.1" />
        <circle cx="72" cy="96" r="1.4" />
      </g>
    </svg>
  );
}

/* ----- Soft: a round picture with a sticker ----- */

export function CafeArt() {
  const beans: [number, number, number][] = [[15, 22, 30], [86, 82, -20], [16, 80, 70], [84, 16, -50]];
  return (
    <svg {...svg} viewBox="0 0 100 100">
      {beans.map(([x, y, angle]) => (
        <g key={`${x}-${y}`} transform={`rotate(${angle} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="5.5" ry="3.8" fill="#3b2412" />
          <path d={`M${x - 4.5} ${y}C${x - 1.5} ${y - 1.6} ${x + 1.5} ${y + 1.6} ${x + 4.5} ${y}`} stroke="#8a5a32" strokeWidth="0.9" fill="none" />
        </g>
      ))}
      <circle cx="48" cy="52" r="36" fill="#fffaf2" />
      <circle cx="48" cy="52" r="36" fill="none" stroke="#eadccb" strokeWidth="1" />
      <circle cx="48" cy="52" r="29" fill="none" stroke="#efe3d4" strokeWidth="1" />
      <rect x="70" y="47" width="17" height="10" rx="5" fill="#fff" stroke="#eadccb" />
      <circle cx="48" cy="52" r="25" fill="#fff" stroke="#eadccb" />
      <circle cx="48" cy="52" r="20.5" fill="#6b4423" />
      <circle cx="48" cy="52" r="20.5" fill="none" stroke="#9a6a3d" strokeWidth="2" />
      <path d="M48 63C37 56 37 46 43 45C46 45 48 48 48 50C48 48 50 45 53 45C59 46 59 56 48 63Z" fill="#f6e7d4" />
    </svg>
  );
}

export function CleaningArt() {
  return (
    <svg {...svg} viewBox="0 0 100 100">
      <g fill="none" stroke="#fff" strokeWidth="1.6">
        <circle cx="22" cy="30" r="6" />
        <circle cx="15" cy="46" r="3.4" />
        <circle cx="80" cy="76" r="5" />
        <circle cx="86" cy="63" r="2.4" />
      </g>
      <path d="M36 28H62L69 34H61V38H40Z" fill="#0f1a4a" />
      <path d="M55 38L59 49" stroke="#0f1a4a" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="41" y="38" width="13" height="8" fill="#e2e8f0" />
      <path d="M36 46H59L64 57V86A4 4 0 0 1 60 90H36A4 4 0 0 1 32 86V57Z" fill="#1f3a9e" />
      <rect x="37" y="61" width="22" height="18" rx="2.5" fill="#fff" fillOpacity="0.92" />
      <path d={sparkle(48, 70, 5)} fill="#1f3a9e" />
      <g fill="#fff">
        <circle cx="74" cy="29" r="1.6" />
        <circle cx="79" cy="25" r="1.3" />
        <circle cx="78" cy="33" r="1.2" />
        <circle cx="84" cy="29" r="1.5" />
        <circle cx="83" cy="22" r="1" />
        <circle cx="86" cy="36" r="1" />
      </g>
      <path d={sparkle(78, 12, 5.5)} fill="#fff" />
      <path d={sparkle(22, 76, 4)} fill="#1f3a9e" opacity="0.45" />
    </svg>
  );
}

export function EcommerceArt() {
  return (
    <svg {...svg} viewBox="0 0 100 100">
      <rect x="12" y="68" width="18" height="16" rx="1.5" fill="#d6a86a" />
      <path d="M21 68V84" stroke="#f3dfbf" strokeWidth="2.2" />
      <path d="M40 42V33A10 10 0 0 1 60 33V42" fill="none" stroke="#1c1a3a" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 42H70L74 85A4 4 0 0 1 70 89H30A4 4 0 0 1 26 85Z" fill="#3f3a8c" />
      <rect x="30" y="42" width="40" height="5" fill="#2f2a72" />
      <circle cx="40" cy="44.5" r="1.6" fill="#f7c8a8" />
      <circle cx="60" cy="44.5" r="1.6" fill="#f7c8a8" />
      <path d={sparkle(50, 66, 7)} fill="#f3f1fb" />
      <path d="M60 46C64 50 66 54 68 58" fill="none" stroke="#1c1a3a" strokeWidth="1" />
      <g transform="rotate(20 76 64)">
        <path d="M68 56H86V72H68L63 64Z" fill="#fff" />
        <circle cx="68.5" cy="64" r="1.6" fill="#3f3a8c" />
        <path d="M72 61H82M72 66.5H79" stroke="#3f3a8c" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <path d={sparkle(20, 26, 5)} fill="#fff" />
      <path d={sparkle(80, 22, 3.5)} fill="#3f3a8c" opacity="0.5" />
    </svg>
  );
}

export function DentalArt() {
  return (
    <svg {...svg} viewBox="0 0 100 100">
      <g transform="rotate(-35 50 50)">
        <rect x="6" y="46" width="64" height="8" rx="4" fill="#0e7490" />
        <rect x="68" y="44" width="24" height="12" rx="4" fill="#155e75" />
        <rect x="70" y="35" width="20" height="10" rx="2" fill="#ecfeff" />
        <path d="M74 35V45M78 35V45M82 35V45M86 35V45" stroke="#a5f3fc" strokeWidth="1" />
      </g>
      <path d="M34 30C26 30 22 38 24 48C26 58 30 62 31 72C32 80 34 86 38 86C42 86 42 76 44 70C45 66 47 64 50 64C53 64 55 66 56 70C58 76 58 86 62 86C66 86 68 80 69 72C70 62 74 58 76 48C78 38 74 30 66 30C60 30 56 33 50 33C44 33 40 30 34 30Z" fill="#fff" stroke="#0e7490" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M31 40C29 46 30 52 32 56" fill="none" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" />
      <path d={sparkle(80, 24, 7)} fill="#fff" />
      <path d={sparkle(20, 22, 4.5)} fill="#fff" />
      <path d={sparkle(84, 70, 3.5)} fill="#0e7490" opacity="0.5" />
    </svg>
  );
}

export function LandscapingArt() {
  return (
    <svg {...svg} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id="land-lawn">
          <path d="M0 72C30 62 66 66 100 74V100H0Z" />
        </clipPath>
      </defs>
      <rect width="100" height="100" fill="#ecfccb" />
      <circle cx="72" cy="28" r="10" fill="#fef08a" />
      <path d="M0 60C20 46 44 48 60 56C74 62 88 54 100 50V100H0Z" fill="#6aa84f" />
      <path d="M0 72C30 62 66 66 100 74V100H0Z" fill="#2f7a32" />
      <g clipPath="url(#land-lawn)" fill="#3f9142">
        {[-20, 4, 28, 52, 76].map((x) => (
          <path key={x} d={`M${x} 100L${x + 26} 60H${x + 38}L${x + 12} 100Z`} />
        ))}
      </g>
      <rect x="27" y="48" width="5" height="22" fill="#5b3a1e" />
      <circle cx="30" cy="40" r="13" fill="#1b4a1d" />
      <circle cx="21" cy="47" r="9" fill="#1b4a1d" />
      <circle cx="39" cy="47" r="10" fill="#1b4a1d" />
      <circle cx="25" cy="36" r="5" fill="#2f7a32" />
      <g>
        <circle cx="62" cy="80" r="2" fill="#f472b6" />
        <circle cx="68" cy="84" r="2" fill="#fde047" />
        <circle cx="56" cy="86" r="2" fill="#fff" />
      </g>
    </svg>
  );
}
