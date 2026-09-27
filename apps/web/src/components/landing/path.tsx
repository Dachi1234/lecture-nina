import { landing } from "@/content/landing.ka";

const copy = landing.path;
const showDraft = process.env.NEXT_PUBLIC_SHOW_DRAFT_NOTES === "true";

export function Path() {
  return (
    <section className="bg-paper-deep">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-16 md:px-10 lg:py-20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-hand text-4xl text-burgundy md:text-[44px]">{copy.kicker}</p>
            <h2 className="mt-2 text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          </div>
          <p className="max-w-[360px] text-lg leading-relaxed text-ink-muted lg:text-right">{copy.text}</p>
        </div>
        <div className="hidden md:block">
          <PathSvg />
        </div>
        <ol className="flex flex-col gap-4 border-l-2 border-dashed border-sand pl-6 md:hidden">
          {copy.stops.map((stop, index) => (
            <li key={stop.es}>
              <p className="font-hand text-2xl text-burgundy">{stop.es}</p>
              <p className="font-semibold">
                {index + 1} · {stop.ka}
              </p>
            </li>
          ))}
        </ol>
        <ul className="hidden flex-wrap gap-x-8 gap-y-3 md:flex">
          {copy.stops.map((stop) => (
            <li key={stop.es}>
              <p className="font-hand text-2xl text-burgundy">{stop.es}</p>
              <p className="text-[15px] font-semibold">{stop.ka}</p>
            </li>
          ))}
        </ul>
        {showDraft ? <p className="text-[13px] text-ink-muted">{copy.draft}</p> : null}
      </div>
    </section>
  );
}

function PathSvg() {
  return (
    <svg viewBox="0 0 1280 460" className="h-auto w-full" role="img" aria-label={copy.aria}>
      <path d="M0 360 C 180 300, 320 340, 480 310 S 820 280, 980 320 S 1200 300, 1280 290 V460 H0 Z" className="fill-sand-soft" />
      <path d="M0 400 C 220 360, 420 400, 640 380 S 1060 350, 1280 380 V460 H0 Z" className="fill-sage-soft" />
      <g>
        <rect x="1060" y="200" width="46" height="60" className="fill-card stroke-sand" strokeWidth="1.5" />
        <path d="M1054 202 L1083 180 L1112 202 Z" className="fill-terracotta" />
        <rect x="1112" y="180" width="54" height="80" className="fill-card stroke-sand" strokeWidth="1.5" />
        <path d="M1106 182 L1139 156 L1172 182 Z" className="fill-terracotta" />
        <ellipse cx="1216" cy="226" rx="9" ry="34" className="fill-sage" />
        <ellipse cx="90" cy="300" rx="8" ry="28" className="fill-sage" />
      </g>
      <path d="M40 380 C 120 300, 180 250, 200 190 S 330 110, 380 180 S 470 300, 560 250 S 660 120, 720 150 S 820 290, 890 250 S 980 120, 1040 130 S 1120 110, 1180 100" className="stroke-card" strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M40 380 C 120 300, 180 250, 200 190 S 330 110, 380 180 S 470 300, 560 250 S 660 120, 720 150 S 820 290, 890 250 S 980 120, 1040 130 S 1120 110, 1180 100" className="stroke-sand" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" fill="none" />
      <Stop x={70} y={346} n="1" done />
      <Stop x={200} y={190} n="2" done />
      <Stop x={380} y={180} n="3" done />
      <Stop x={560} y={250} n="4" />
      <Stop x={720} y={150} n="5" />
      <Stop x={890} y={250} n="6" />
      <Stop x={1040} y={130} n="7" />
      <circle cx="1180" cy="100" r="26" className="fill-mustard" />
      <path d="M1169 100 l7 7 l13 -14" className="stroke-navy" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stop({ x, y, n, done = false }: { x: number; y: number; n: string; done?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="20" className={done ? "fill-teal-deep" : "fill-card stroke-teal-deep"} strokeWidth={done ? 0 : 2.5} />
      <text x={x} y={y + 5} textAnchor="middle" className={done ? "fill-on-dark" : "fill-teal-deep"} fontSize="15" fontWeight="700">
        {n}
      </text>
    </g>
  );
}
