import { PawIcon } from "@/components/PawLogo";

// Background paw prints that "walk" across the page in a slow loop: each print appears
// in turn, lingers, then fades. Decorative only: fixed behind everything, no pointer
// events, hidden from screen readers, and hidden entirely under reduced motion.
const TRAILS = [
  // Kept near the edges so prints rarely cross text.
  { left: "-1%", top: "93%", angle: -7, delay: 0 },
  { left: "74%", top: "13%", angle: 12, delay: 6 },
  { left: "97%", top: "88%", angle: -100, delay: 3 },
];
const STEPS = 9;

export function PawTrail() {
  return (
    <div aria-hidden="true" className="paw-trail pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {TRAILS.map((t, ti) => (
        <div
          key={ti}
          className="absolute flex items-center gap-7"
          style={{ left: t.left, top: t.top, transform: `rotate(${t.angle}deg)`, transformOrigin: "left center" }}
        >
          {Array.from({ length: STEPS }, (_, i) => (
            <span
              key={i}
              className="paw-print block"
              style={{
                animationDelay: `${t.delay + i * 0.45}s`,
                transform: `translateY(${i % 2 ? 11 : -11}px) rotate(90deg)`,
              }}
            >
              <PawIcon className="h-6 w-6 fill-[#efd0d5]" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
