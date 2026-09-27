import { Stamp } from "@nina/ui";
import { landing } from "@/content/landing.ka";

const copy = landing.meet;

export function MeetNina() {
  return (
    <section id="nina" className="scroll-mt-24 bg-paper">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 md:px-10 lg:grid-cols-[520px_minmax(0,1fr)] lg:py-24">
        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
          <img
            src="/illustrations/scene-study-room.webp"
            alt={copy.imageAlt}
            className="aspect-[520/640] w-full object-cover"
            style={{ borderRadius: "46% 54% 40% 60% / 34% 36% 64% 66%" }}
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-5">
          <p className="font-hand text-4xl text-teal-deep md:text-[44px]">{copy.kicker}</p>
          <h2 className="text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-[640px] text-[19px] leading-relaxed">
              {paragraph}
            </p>
          ))}
          <ul className="mt-2 flex flex-wrap gap-3">
            {copy.stamps.map((stamp) => (
              <li key={stamp.kicker}>
                <Stamp kicker={stamp.kicker} label={stamp.label} highlighted={"highlighted" in stamp && stamp.highlighted} />
                <span className="sr-only md:hidden">{stamp.short}</span>
              </li>
            ))}
          </ul>
          <p className="font-hand text-4xl text-teal-deep md:text-[44px]">{copy.closing}</p>
        </div>
      </div>
    </section>
  );
}
