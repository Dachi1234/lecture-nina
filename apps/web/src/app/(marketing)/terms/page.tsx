import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-5 py-16">
      <h1 className="text-4xl font-bold">წესები</h1>
      <p className="text-lg leading-relaxed text-ink-muted">გაკვეთილის პირობები ნინასთან ერთად დაზუსტდება. ეს გვერდი მზადდება.</p>
      <Link href="/" className="font-semibold text-teal-deep">
        მთავარზე დაბრუნება
      </Link>
    </main>
  );
}
