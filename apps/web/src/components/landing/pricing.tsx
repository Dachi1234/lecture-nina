import type { PublicSettings } from "@/lib/settings";
import { landing } from "@/content/landing.ka";
import { BookButton } from "./booking";

const copy = landing.pricing;

export function Pricing({ settings }: { settings: PublicSettings }) {
  return (
    <section id="precio" className="scroll-mt-24 bg-paper">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_560px] lg:py-24">
        <div className="flex flex-col gap-4">
          <p className="font-hand text-4xl text-teal-deep">{copy.kicker}</p>
          <h2 className="text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          <p className="max-w-[520px] text-lg leading-relaxed text-ink-muted">{copy.text}</p>
          <img src="/illustrations/spots/spot-coffee.webp" alt="" className="mt-2 h-auto w-[190px] max-w-full shrink-0 self-start" loading="lazy" />
        </div>
        <div className="grid gap-6">
          <PriceCard
            name={copy.name}
            price={settings.price_gel}
            minutes={settings.lesson_minutes}
            gift={settings.gift_lessons}
          />
        </div>
      </div>
    </section>
  );
}

export function PriceCard({
  name,
  price,
  minutes,
  gift,
}: {
  name: string;
  price: number;
  minutes: number;
  gift: number;
}) {
  return (
    <article className="relative flex flex-col gap-5 rounded-3xl border-[1.5px] border-line bg-card p-8 shadow-[0_30px_60px_-40px_rgba(10,65,79,0.45)] md:p-11">
      <p className="absolute -top-5 right-4 inline-flex rotate-3 items-center gap-2 rounded-xl bg-mustard px-4 py-2 text-[15px] font-bold text-navy">
        პირველი {gift} გაკვეთილი — საჩუქრად
      </p>
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-montserrat)] text-7xl leading-none font-bold md:text-[88px]">{price}</span>
        <span className="font-[family-name:var(--font-montserrat)] text-2xl font-bold">GEL</span>
        <span className="text-[17px] text-ink-muted">{copy.per}</span>
      </p>
      <ul className="flex flex-wrap gap-2">
        {[`${minutes} წუთი`, copy.online, copy.oneToOne].map((chip) => (
          <li key={chip} className="rounded-full bg-teal-soft px-3.5 py-1.5 text-[15px] font-semibold text-teal-deep">
            {chip}
          </li>
        ))}
      </ul>
      <hr className="border-line" />
      <ul className="flex flex-col gap-3 text-[17px]">
        {copy.includes.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-sage" strokeLinecap="round" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
      <BookButton source="pricing" arrow={false} className="w-full" />
      <p className="text-center text-sm text-ink-muted">{copy.note}</p>
    </article>
  );
}
