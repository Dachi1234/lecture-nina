import { landing } from "@/content/landing.ka";
import { BookButton } from "./booking";

const copy = landing.gift;

export function Gift({ giftLessons }: { giftLessons: number }) {
  const title = `პირველი ${giftLessons} გაკვეთილი — საჩუქრად`;
  return (
    <section className="bg-paper">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,700px)_minmax(0,1fr)] lg:items-center">
        <div className="relative hidden h-[800px] overflow-hidden lg:block">
          <img src="/illustrations/scene-stone-wall.webp" alt={copy.imageAlt} className="absolute inset-0 h-full w-full object-cover object-[50%_62%]" style={{ borderRadius: "0 360px 360px 0 / 0 50% 50% 0" }} loading="lazy" />
        </div>
        <img src="/illustrations/scene-walking.webp" alt={copy.walkingAlt} className="h-72 w-full object-cover lg:hidden" loading="lazy" />
        <div className="flex flex-col gap-5 px-5 py-16 md:px-16 lg:py-16 lg:pr-20 lg:pl-16">
          <p className="w-fit -rotate-2 font-hand text-4xl text-burgundy md:text-[44px]">{copy.kicker}</p>
          <h2 className="text-[36px] leading-tight font-bold md:text-[50px]">{title}</h2>
          <p className="max-w-[560px] text-[19px] leading-relaxed text-ink-muted">{copy.text}</p>
          <ul className="flex flex-col gap-3">
            {copy.checks.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[17px] font-medium">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-sage" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 13c2 1.5 3.5 3.5 5 6 3-6 6.5-10.5 11-14" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <BookButton source="gift" variant="burgundy" className="mt-2 w-fit" />
        </div>
      </div>
    </section>
  );
}
