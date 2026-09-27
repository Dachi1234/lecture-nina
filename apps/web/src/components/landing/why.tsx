import { landing } from "@/content/landing.ka";

const copy = landing.why;

export function WhyNina() {
  return (
    <section className="bg-paper">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-5 py-16 md:px-10 lg:py-20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <p className="font-hand text-4xl text-burgundy md:text-[44px]">{copy.kicker}</p>
            <h2 className="text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          </div>
          <p className="max-w-[420px] text-lg leading-relaxed text-ink-muted lg:text-right">{copy.aside}</p>
        </div>
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {copy.cards.map((card) => {
            const inverted = "inverted" in card && card.inverted;
            return (
            <li key={card.number}>
              <article className={`flex h-auto min-h-[150px] overflow-hidden rounded-2xl border-[1.5px] border-line bg-card transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] md:h-60 ${inverted ? "border-navy bg-navy text-on-dark" : ""}`}>
                <div className={`flex w-[120px] shrink-0 items-end justify-center md:w-[140px] ${card.tint}`}>
                  <img src={card.image} alt="" className="h-[120px] w-auto object-contain md:h-[160px]" loading="lazy" />
                </div>
                <div className="flex flex-col gap-2 px-5 py-5">
                  <p className={`font-hand text-[30px] leading-none ${inverted ? "text-mustard" : "text-burgundy"}`}>{card.number}</p>
                  <h3 className="text-[21px] leading-tight font-bold">{card.title}</h3>
                  <p className={`text-base leading-relaxed ${inverted ? "text-on-dark-muted" : "text-ink-muted"}`}>{card.text}</p>
                </div>
              </article>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
