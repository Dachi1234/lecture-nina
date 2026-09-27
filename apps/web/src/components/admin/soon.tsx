import Link from "next/link";

export function AdminSoon({ title }: { title: string }) {
  return (
    <section className="flex max-w-xl flex-col gap-3">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-lg leading-relaxed text-ink-muted">ეს ნაწილი ჯერ არ არის აწყობილი. მასალები ბიბლიოთეკაშია.</p>
      <Link href="/admin/library" className="font-semibold text-teal-deep">
        ბიბლიოთეკაში გადასვლა
      </Link>
    </section>
  );
}
