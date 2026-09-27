import { Accordion } from "@nina/ui";
import { landing } from "@/content/landing.ka";

const copy = landing.faq;

export function Faq({ minutes }: { minutes: number }) {
  const items = copy.items.map((item) =>
    item.id === "how" ? { ...item, answer: item.answer.replace("75", String(minutes)) } : item,
  );
  return (
    <section id="preguntas" className="scroll-mt-24 bg-paper-deep">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 md:px-10 lg:grid-cols-[400px_minmax(0,1fr)] lg:py-24">
        <div className="flex flex-col gap-4">
          <p className="font-hand text-4xl text-burgundy">{copy.kicker}</p>
          <h2 className="text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          <p className="text-lg leading-relaxed text-ink-muted">{copy.text}</p>
          <img src="/illustrations/spots/spot-portrait.webp" alt="" className="mt-4 h-auto w-[230px] max-w-full shrink-0 self-start" loading="lazy" />
        </div>
        <Accordion items={items.map((item) => ({ id: item.id, question: item.question, answer: item.answer }))} />
      </div>
    </section>
  );
}
