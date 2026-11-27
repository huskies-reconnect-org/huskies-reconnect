import { Avatar } from "@/components/Avatar";
import { PawIcon } from "@/components/PawLogo";

// Illustration of a match (fictional demo students, not live data). Motion lives in
// globals.css (`hero-*`): the cards arrive and float, a paw trail walks toward them,
// the intro types out and the safety pill pops in. Static under reduced motion.
const TRAIL = [
  { left: 0, top: 4, size: "h-16 w-16", rotate: -20, delay: 0 },
  { left: 70, top: 96, size: "h-11 w-11", rotate: 10, delay: 0.5 },
  { left: 8, top: 176, size: "h-8 w-8", rotate: -14, delay: 1 },
  { left: 92, top: 236, size: "h-7 w-7", rotate: 16, delay: 1.5 },
];

export function LoginHero() {
  return (
    <div aria-hidden="true" className="relative h-[470px] w-[440px] shrink-0 [zoom:0.74] min-[400px]:[zoom:0.82] sm:[zoom:1]">
      {TRAIL.map((p, i) => (
        <span key={i} className="hero-paw absolute" style={{ left: p.left, top: p.top, animationDelay: `${p.delay}s` }}>
          <PawIcon className={`${p.size} fill-[#f1dcdf]`} />
        </span>
      ))}

      {/* Daniel */}
      <div className="absolute -right-2 top-6 w-[330px] rotate-[5deg]">
        <div className="hero-in" style={{ animationDelay: "0.15s" }}>
          <div className="hero-float-b flex items-center gap-3.5 rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(26,26,26,0.06)]">
            <Avatar id="demo-daniel" name="Daniel Okafor" color="peach" size="sm" />
            <div className="flex flex-col">
              <span className="font-semibold">Daniel Okafor</span>
              <span className="whitespace-nowrap text-[13px] text-muted">You both need an AI project partner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aisha */}
      <div className="absolute left-10 top-[150px] w-[360px] -rotate-3">
        <div className="hero-in" style={{ animationDelay: "0.4s" }}>
          <div className="hero-float-a flex flex-col gap-4 rounded-[22px] border border-line bg-white p-6 shadow-[0_24px_60px_rgba(26,26,26,0.14)]">
            <div className="flex items-start gap-3.5">
              <Avatar id="demo-aisha" name="Aisha Hassan" color="sky" badge="AI ethics and policy" size="md" />
              <div className="flex flex-1 flex-col pt-1">
                <span className="text-lg font-semibold leading-tight">Aisha Hassan</span>
                <span className="text-[13px] leading-snug text-muted">CS5100 · MS Artificial Intelligence</span>
              </div>
              <span className="hero-badge mt-1 shrink-0 rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-husky-ink">
                Good match
              </span>
            </div>
            <p className="font-display text-[22px] font-semibold leading-snug">
              You both want to start an LLM safety reading group.
            </p>
            <p className="rounded-xl bg-cream px-4 py-3 text-sm leading-relaxed text-[#3f3a36]">
              <span className="hero-type block">
                &quot;Hi Aisha! I&apos;m Maya, also in CS5100. Want to start that LLM safety reading group together?&quot;
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Safety pill */}
      <div className="absolute right-0 top-[418px] rotate-2">
        <div className="hero-pop flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(26,26,26,0.2)]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-[#7fd49b] stroke-[2.2]">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" strokeLinejoin="round" />
            <path className="hero-check" pathLength={1} d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Intro drafted and safety-checked
        </div>
      </div>
    </div>
  );
}
