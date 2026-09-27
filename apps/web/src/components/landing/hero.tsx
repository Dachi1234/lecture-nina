import { BrushUnderline } from "@nina/ui";
import { landing } from "@/content/landing.ka";
import { BookButton } from "./booking";

const copy = landing.hero;

export function Hero() {
  return (
    <section id="top" className="scroll-mt-24 overflow-hidden">
      <img src="/illustrations/scene-stone-wall.webp" alt={copy.mobileAlt} className="h-[420px] w-full object-cover object-[center_62%] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] md:hidden" />
      <div className="mx-auto grid max-w-[1280px] items-center gap-8 px-5 py-10 md:px-10 md:py-16 lg:grid-cols-[minmax(0,700px)_minmax(0,1fr)] lg:py-8">
        <div className="flex flex-col gap-5">
          <p className="animate-write w-fit -rotate-6 font-hand text-5xl text-burgundy md:text-[56px]">{copy.kicker}</p>
          <h1 className="flex flex-col" aria-label={copy.ariaLabel}>
            <span className="font-[family-name:var(--font-montserrat)] text-[72px] leading-none font-bold text-navy md:text-[120px]">{copy.name}</span>
            <span className="font-[family-name:var(--font-montserrat)] text-[32px] leading-tight font-bold md:text-[54px]">
              {copy.titleBefore}
              <BrushUnderline>{copy.titleAccent}</BrushUnderline>
            </span>
          </h1>
          <p className="max-w-[640px] text-[22px] leading-snug font-medium md:text-[25px]">
            <span className="mr-2 font-hand text-5xl text-mustard" aria-hidden>
              “
            </span>
            {copy.quote}
          </p>
          <p className="max-w-[640px] text-[19px] leading-relaxed text-ink-muted">{copy.descriptor}</p>
          <ul className="flex flex-wrap gap-2">
            {copy.chips.map((chip) => (
              <li key={chip} className="rounded-full border border-sand bg-card px-3.5 py-1.5 text-[15px] font-semibold">
                {chip}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-col items-start gap-3">
            <BookButton source="hero" />
            <p className="inline-flex items-center gap-2 font-semibold text-burgundy">
              <GiftIcon />
              {landing.giftLine}
            </p>
            <a href="#metodo" className="font-semibold text-teal-deep underline decoration-mustard decoration-2 underline-offset-[6px]">
              {copy.methodLink}
            </a>
          </div>
        </div>
        <div className="relative hidden min-h-[640px] lg:block">
          <div className="absolute top-16 right-8 size-[460px] rounded-[46%_54%_48%_52%/42%_38%_62%_58%] bg-sand-soft" />
          <svg className="absolute top-8 right-0 size-[280px]" viewBox="0 0 120 120" fill="none" aria-hidden>
            <path d="M96 22 A 50 50 0 1 0 108 70" className="stroke-mustard" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <p className="absolute top-10 left-6 -rotate-6 font-hand text-4xl text-burgundy">
            {copy.note}
            <svg className="mt-1 block" width="72" height="28" viewBox="0 0 72 28" fill="none" aria-hidden>
              <path d="M4 8 C 24 4, 40 18, 66 14" className="stroke-burgundy" strokeWidth="2" strokeLinecap="round" />
              <path d="M54 8 l12 6 l-10 2" className="stroke-burgundy" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
          <img src="/illustrations/nina-standing.webp" alt={copy.imageAlt} className="animate-floaty relative z-10 ml-auto h-[760px] w-auto max-w-none object-contain" />
        </div>
      </div>
    </section>
  );
}

function GiftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="8" width="18" height="5" rx="1" />
      <path d="M5 13v7h14v-7M12 8v12M12 8c-1-3-5-4-5-1.5S10 8 12 8zM12 8c1-3 5-4 5-1.5S14 8 12 8z" />
    </svg>
  );
}
