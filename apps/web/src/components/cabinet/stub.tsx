import Link from "next/link";

const pages = {
  materials: {
    title: "მასალები",
    text: "მასალებს გაკვეთილიდან ხსნი.",
    href: "/app/lessons",
    link: "გაკვეთილები",
  },
  vocabulary: {
    title: "ლექსიკა",
    text: "სიტყვები გაკვეთილის მასალებშია.",
    href: "/app/lessons",
    link: "გაკვეთილები",
  },
  progress: {
    title: "პროგრესი",
    text: "გზა მთავარ გვერდზე ჩანს.",
    href: "/app",
    link: "მთავარი",
  },
} as const;

export function CabinetStub({ page }: { page: keyof typeof pages }) {
  const copy = pages[page];
  return (
    <section className="flex max-w-lg flex-col gap-3">
      <h1 className="text-4xl font-bold">{copy.title}</h1>
      <p className="text-lg leading-relaxed text-ink-muted">{copy.text}</p>
      <Link href={copy.href} className="font-semibold text-teal-deep">
        {copy.link}
      </Link>
    </section>
  );
}
