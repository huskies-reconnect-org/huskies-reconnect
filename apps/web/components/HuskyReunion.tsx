// Two huskies run in from opposite sides, meet nose to nose, a heart pops up, and
// their tails keep wagging. Original inline SVG; motion is CSS (`hr-*` in globals.css)
// and plays once when the page opens. Decorative, so hidden from screen readers.

type Coat = { fur: string; dark: string; accent?: string };

function Husky({ coat, scarf }: { coat: Coat; scarf?: string }) {
  return (
    <svg viewBox="0 0 140 110" className="h-full w-full overflow-visible">
      {/* tail, wagging from its base */}
      <g className="hr-tail" style={{ transformOrigin: "36px 56px" }}>
        <path d="M36 56 C 18 52 14 32 28 26" fill="none" stroke={coat.fur} strokeWidth="11" strokeLinecap="round" />
        <circle cx="28" cy="26" r="5.5" fill="#fff" />
      </g>
      {/* far legs */}
      <g className="hr-leg-b" style={{ transformOrigin: "52px 70px" }}><rect x="47" y="68" width="9" height="28" rx="4.5" fill={coat.dark} /></g>
      <g className="hr-leg-a" style={{ transformOrigin: "88px 70px" }}><rect x="83" y="68" width="9" height="28" rx="4.5" fill={coat.dark} /></g>
      {/* body */}
      <ellipse cx="62" cy="62" rx="34" ry="20" fill={coat.fur} />
      <ellipse cx="66" cy="71" rx="25" ry="10" fill="#fff" />
      {/* near legs with white paws */}
      <g className="hr-leg-a" style={{ transformOrigin: "42px 70px" }}>
        <rect x="37" y="68" width="10" height="29" rx="5" fill={coat.fur} />
        <rect x="37" y="89" width="10" height="8" rx="4" fill="#fff" />
      </g>
      <g className="hr-leg-b" style={{ transformOrigin: "78px 70px" }}>
        <rect x="73" y="68" width="10" height="29" rx="5" fill={coat.fur} />
        <rect x="73" y="89" width="10" height="8" rx="4" fill="#fff" />
      </g>
      {/* neck and chest */}
      <ellipse cx="86" cy="52" rx="15" ry="17" fill={coat.fur} />
      <ellipse cx="91" cy="61" rx="10" ry="12" fill="#fff" />
      {scarf && <path d="M78 50 L98 55 L87 69 Z" fill={scarf} />}
      {/* ears */}
      <path d="M95 25 L104 5 L111 25 Z" fill={coat.dark} />
      <path d="M84 27 L89 5 L100 23 Z" fill={coat.fur} />
      <path d="M88 22 L90 11 L96 21 Z" fill="#f3c1c8" />
      {/* head */}
      <circle cx="98" cy="40" r="20" fill={coat.fur} />
      <ellipse cx="105" cy="48" rx="15" ry="11" fill="#fff" />
      <ellipse cx="116" cy="48" rx="11" ry="7.5" fill="#fff" />
      <ellipse cx="103" cy="31" rx="4.2" ry="2.6" fill="#fff" />
      {/* face */}
      <circle cx="104" cy="38" r="2.8" fill="#1a1a1a" />
      <circle cx="105" cy="37" r="0.9" fill="#fff" />
      <circle cx="126" cy="46" r="3.4" fill="#1a1a1a" />
      <path d="M116 53 q 4 3.5 8.5 0" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="120" cy="56.5" rx="2.6" ry="3.2" fill="#e88a98" />
    </svg>
  );
}

export function HuskyReunion({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative h-[130px] w-[300px] ${className}`}>
      {/* left husky (grey, red scarf) faces right */}
      <div className="hr-run-left absolute bottom-0 left-[14px] h-[110px] w-[140px]">
        <div className="hr-hop h-full w-full">
          <Husky coat={{ fur: "#6b7079", dark: "#4a4e55" }} scarf="#c8102e" />
        </div>
      </div>
      {/* right husky (copper) faces left */}
      <div className="hr-run-right absolute bottom-0 right-[14px] h-[110px] w-[140px]">
        <div className="hr-hop h-full w-full -scale-x-100">
          <Husky coat={{ fur: "#b06a4f", dark: "#8a4f3a" }} />
        </div>
      </div>
      {/* the reunion */}
      <svg viewBox="0 0 24 24" className="hr-heart absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 fill-husky">
        <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3.2 1.7-2 3.1-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
      </svg>
    </div>
  );
}
