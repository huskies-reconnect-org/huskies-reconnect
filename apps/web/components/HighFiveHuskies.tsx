// Two graduate huskies, sitting upright, meet in a high-five: the "reconnect" moment.
// Original inline SVG in the app's flat style. Motion is CSS (`hf-*` in globals.css):
// they slide in as their paws meet, a burst flashes, speech bubbles pop, then tails
// wag and the high-five repeats every few seconds. Decorative; static under reduced motion.

type Coat = { fur: string; dark: string };

/** One husky facing right, paw raised to x≈190, y≈44 (local coordinates). */
function Husky({ coat }: { coat: Coat }) {
  return (
    <g>
      <ellipse cx="102" cy="249" rx="64" ry="4" fill="#1a1a1a" opacity="0.07" />
      {/* tail */}
      <g className="hf-tail" style={{ transformOrigin: "70px 230px" }}>
        <path d="M72 232 C 30 240 8 210 20 172" fill="none" stroke={coat.fur} strokeWidth="17" strokeLinecap="round" />
        <path d="M20 172 C 14 186 16 198 24 206" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      </g>
      {/* far front leg, resting */}
      <rect x="120" y="150" width="13" height="94" rx="6.5" fill={coat.dark} />
      {/* haunch, body, chest */}
      <ellipse cx="92" cy="210" rx="40" ry="34" fill={coat.fur} />
      <path d="M62 214 C 56 168 72 128 104 104 L 142 114 C 140 152 138 192 138 240 L 96 242 Z" fill={coat.fur} />
      <path d="M118 112 C 142 124 144 178 136 238 L 121 238 C 125 192 119 150 110 118 Z" fill="#fff" />
      <ellipse cx="106" cy="244" rx="22" ry="6" fill="#fff" />
      <path d="M70 196 C 78 206 92 210 104 206" fill="none" stroke={coat.dark} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* raised paw, behind the head */}
      <path d="M128 128 L 186 48" stroke={coat.fur} strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="189" cy="44" rx="8.5" ry="10.5" fill="#fff" transform="rotate(35 189 44)" />
      {/* head */}
      <g className="hf-head" style={{ transformOrigin: "124px 96px" }}>
        <path d="M120 54 L132 20 L143 52 Z" fill={coat.dark} />
        <path d="M103 58 L106 22 L124 50 Z" fill={coat.fur} />
        <path d="M108 51 L109 32 L119 48 Z" fill="#f3c1c8" />
        <circle cx="124" cy="76" r="28" fill={coat.fur} />
        <ellipse cx="136" cy="86" rx="20" ry="14" fill="#fff" />
        <ellipse cx="154" cy="84" rx="15" ry="9.5" fill="#fff" />
        <ellipse cx="133" cy="62" rx="5.5" ry="3.2" fill="#fff" />
        <circle cx="136" cy="69" r="3.8" fill="#1a1a1a" />
        <circle cx="137.3" cy="67.8" r="1.2" fill="#fff" />
        <ellipse cx="168" cy="80" rx="5" ry="4" fill="#1a1a1a" />
        <path d="M150 90 Q 159 101 168 90 Z" fill="#3a1f1f" />
        <ellipse cx="160" cy="97" rx="4.2" ry="4.8" fill="#e88a98" />
        {/* graduation cap */}
        <path d="M108 54 L138 47 L138 55 C 128 61 116 61 108 58 Z" fill="#2b2b2b" />
        <path d="M96 48 L128 35 L158 45 L126 58 Z" fill="#1a1a1a" />
        <path d="M127 46 L104 56 L103 70" fill="none" stroke="#c8102e" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="100.5" y="68" width="5" height="7" rx="1.5" fill="#c8102e" />
        <circle cx="127" cy="46" r="2.2" fill="#c8102e" />
      </g>
    </g>
  );
}

export function HighFiveHuskies({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 8 360 250" className={`h-[250px] w-[360px] shrink-0 overflow-visible ${className}`}>
      <circle cx="180" cy="132" r="100" fill="#fbe9ec" />
      <circle className="hf-glow" cx="180" cy="40" r="26" fill="#fff" opacity="0.85" />

      {/* left: tan husky */}
      <g className="hf-left">
        <g className="hf-lean-left">
          <g transform="translate(-13 0)">
            <Husky coat={{ fur: "#c98a5b", dark: "#a86c43" }} />
          </g>
        </g>
      </g>
      {/* right: dark husky, mirrored */}
      <g className="hf-right">
        <g className="hf-lean-right">
          <g transform="translate(360 0) scale(-1 1)">
            <g transform="translate(-13 0)">
              <Husky coat={{ fur: "#3f4a5a", dark: "#2c3440" }} />
            </g>
          </g>
        </g>
      </g>

      {/* burst where the paws meet */}
      <g className="hf-burst" stroke="#e0a526" strokeWidth="2.4" strokeLinecap="round" style={{ transformOrigin: "180px 40px" }}>
        {[-90, -55, -125, -20, -160, 20, 160].map((a) => {
          const r = (a * Math.PI) / 180;
          return (
            <line key={a} x1={180 + 16 * Math.cos(r)} y1={40 + 16 * Math.sin(r)}
              x2={180 + (a === -90 ? 34 : 27) * Math.cos(r)} y2={40 + (a === -90 ? 34 : 27) * Math.sin(r)} />
          );
        })}
      </g>

      {/* speech bubbles: a book (learning together) and typing dots (saying hi) */}
      <g className="hf-bubble-l" style={{ transformOrigin: "56px 128px" }}>
        <path d="M18 76 h46 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-12 l10 10 h-14 l-10 -10 h-20 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10 z" fill="#c8102e" />
        <path d="M26 89 c 6 -2 11 -1 15 2 v 18 c -4 -3 -9 -4 -15 -2 z M56 89 c -6 -2 -11 -1 -15 2 v 18 c 4 -3 9 -4 15 -2 z"
          fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
      <g className="hf-bubble-r" style={{ transformOrigin: "304px 128px" }}>
        <path d="M296 76 h46 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-20 l-10 10 h-14 l10 -10 h-12 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10 z" fill="#1a1a1a" />
        <circle cx="305" cy="98" r="3.6" fill="#fff" />
        <circle cx="319" cy="98" r="3.6" fill="#fff" />
        <circle cx="333" cy="98" r="3.6" fill="#fff" />
      </g>
    </svg>
  );
}
