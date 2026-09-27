import { landing } from "@/content/landing.ka";

const copy = landing.cabinet;

export function CabinetPreview() {
  return (
    <section className="bg-paper">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:py-24">
        <div className="flex flex-col gap-5">
          <p className="font-hand text-4xl text-teal-deep md:text-[44px]">{copy.kicker}</p>
          <h2 className="text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          <p className="text-lg leading-relaxed text-ink-muted">{copy.text}</p>
          <ul className="flex flex-col gap-3">
            {copy.checks.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[17px] font-medium">
                <Check />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[460px]">
          <img src="/illustrations/scene-terrace-desk.webp" alt={copy.imageAlt} className="ml-auto h-[420px] w-[280px] object-cover" style={{ borderRadius: "160px 160px 24px 24px" }} loading="lazy" />
          <div className="absolute top-8 left-0 hidden w-[min(100%,420px)] rounded-[28px] border-8 border-navy bg-paper p-4 shadow-[var(--shadow-device)] md:block">
            <MockHome />
          </div>
          <div className="absolute right-0 bottom-0 w-[180px] rounded-[28px] border-8 border-navy bg-paper p-3 shadow-[var(--shadow-device)]">
            <p className="font-hand text-2xl text-burgundy">{copy.hello}</p>
            <p className="mt-2 text-xs font-semibold">{copy.continueLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockHome() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-hand text-3xl text-burgundy">{copy.hello}</p>
      <div className="rounded-xl bg-teal-soft p-3">
        <p className="text-xs text-teal-deep">გაგრძელება</p>
        <p className="font-bold">{copy.continueLabel}</p>
      </div>
      <div className="rounded-xl bg-burgundy-soft p-3 font-semibold text-burgundy">{copy.homework}</div>
      <p className="text-ink-muted">{copy.fromNina}</p>
    </div>
  );
}

function Check() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-sage" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}
