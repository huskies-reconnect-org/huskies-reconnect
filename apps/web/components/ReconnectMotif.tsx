// The pitch in one small loop: classmates connected this semester, the links fade
// "after finals", then redraw. Inline SVG + CSS keyframes (globals.css, `.rm-*`);
// no JS, no images. Decorative, so hidden from screen readers; the headline says it.
const NODES = [
  { x: 28, initials: "MP", fill: "#f6e3cf", ink: "#7a4a1e", drift: -4 },
  { x: 100, initials: "DO", fill: "#dce6f7", ink: "#23407a", drift: -2 },
  { x: 172, initials: "AH", fill: "#ddefe3", ink: "#2c5e3d", drift: 2 },
  { x: 244, initials: "JK", fill: "#fbe9ec", ink: "#8e0b21", drift: 4 },
];
const R = 18;

export function ReconnectMotif() {
  return (
    <div aria-hidden="true" className="rm flex flex-col items-start gap-1.5">
      <svg viewBox="0 0 272 44" className="h-11 w-[272px] max-w-full overflow-visible">
        {NODES.slice(0, -1).map((n, i) => {
          const x1 = n.x + R + 2;
          const x2 = NODES[i + 1].x - R - 2;
          return (
            <g key={i} style={{ ["--rm-i" as string]: i }}>
              <line x1={x1} x2={x2} y1={22} y2={22} className="rm-gap" />
              <line x1={x1} x2={x2} y1={22} y2={22} className="rm-link" pathLength={1} />
            </g>
          );
        })}
        {NODES.map((n) => (
          <g key={n.initials} className="rm-node" style={{ ["--rm-drift" as string]: `${n.drift}px` }}>
            <circle cx={n.x} cy={22} r={R} fill={n.fill} />
            <text x={n.x} y={22} dy="0.35em" textAnchor="middle" fill={n.ink} className="rm-initials">
              {n.initials}
            </text>
          </g>
        ))}
      </svg>
      <span className="rm-captions grid text-xs font-semibold uppercase tracking-wider text-muted">
        <span className="rm-cap rm-cap-1">This semester</span>
        <span className="rm-cap rm-cap-2">After finals</span>
        <span className="rm-cap rm-cap-3 text-husky-deep">Still connected</span>
      </span>
    </div>
  );
}
