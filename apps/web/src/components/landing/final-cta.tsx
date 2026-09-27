import { landing } from "@/content/landing.ka";
import { BookButton } from "./booking";

const copy = landing.final;

export function FinalCta() {
  return (
    <section className="overflow-hidden bg-mustard-soft">
      <div className="mx-auto grid max-w-[1280px] items-center gap-8 px-5 py-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-20">
        <div className="flex flex-col items-start gap-5">
          <p className="w-fit -rotate-3 font-hand text-6xl text-burgundy md:text-[76px]">{copy.kicker}</p>
          <h2 className="max-w-[720px] text-[36px] leading-tight font-bold md:text-[54px]">{copy.title}</h2>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <BookButton source="final" />
            <p className="font-semibold text-burgundy">{landing.giftLine}</p>
          </div>
        </div>
        <div className="relative">
          <svg className="absolute -top-6 right-0 size-[320px]" viewBox="0 0 120 120" fill="none" aria-hidden>
            <path d="M96 22 A 50 50 0 1 0 108 70" className="stroke-mustard" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <img src="/illustrations/nina-sitting-coffee.webp" alt={copy.imageAlt} className="relative h-[360px] w-auto md:h-[470px]" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
