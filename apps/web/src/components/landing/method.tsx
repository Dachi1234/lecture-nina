import { BrushCircle, Icon, PinnedNote } from "@nina/ui";
import { landing } from "@/content/landing.ka";

const copy = landing.method;

export function Method() {
  return (
    <section id="metodo" className="scroll-mt-24 bg-paper-deep">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-5 py-16 md:px-10 lg:py-24">
        <header className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center">
          <p className="font-hand text-4xl text-burgundy md:text-[44px]">{copy.kicker}</p>
          <h2 className="text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          <p className="text-lg text-ink-muted">{copy.text}</p>
        </header>
        <ol className="relative grid gap-8 md:grid-cols-4">
          <span className="absolute top-14 right-8 left-8 hidden border-t-2 border-dashed border-sand md:block" aria-hidden />
          {copy.steps.map((step) => (
            <li key={step.step} className="relative flex flex-col items-center gap-3 text-center">
              <BrushCircle className="size-[120px] bg-card">
                <Icon name={step.icon} className="text-teal-deep" />
              </BrushCircle>
              <p className="font-hand text-3xl text-burgundy">{step.step}</p>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-base leading-relaxed text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="rounded-3xl bg-sand-soft px-5 py-8 md:px-10 md:py-12">
          <div className="mb-8 flex flex-col gap-2">
            <p className="font-hand text-4xl text-burgundy">{copy.rulesKicker}</p>
            <h3 className="text-3xl font-bold">{copy.rulesTitle}</h3>
            <p className="text-ink-muted">{copy.rulesText}</p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {copy.rules.map((rule) => (
              <li key={rule.title}>
                <PinnedNote title={rule.title} text={`${rule.lead} — ${rule.text}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
