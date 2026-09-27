import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-5 py-16">
      <h1 className="text-4xl font-bold">კონფიდენციალურობა</h1>
      <p className="text-lg leading-relaxed text-ink-muted">
        ეს გვერდი მზადდება. ნინა იყენებს შენს სახელს, ტელეფონს და შენიშვნას მხოლოდ იმისთვის, რომ დაგიკავშირდეს საცდელ გაკვეთილზე.
      </p>
      <Link href="/" className="font-semibold text-teal-deep">
        მთავარზე დაბრუნება
      </Link>
    </main>
  );
}
