"use client";

import Link from "next/link";
import { Button } from "@nina/ui";

export default function CabinetError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-4 py-10">
      <img src="/illustrations/spots/spot-map.webp" alt="" className="h-40" />
      <p className="font-hand text-5xl leading-none text-teal-deep">¡Uy!</p>
      <h2 className="text-[21px] font-bold">მასალა ვერ ჩაიტვირთა</h2>
      <p className="text-[15px] leading-relaxed text-ink-muted">შეამოწმე ინტერნეტი და სცადე თავიდან. პროგრესი შენახულია.</p>
      <div className="flex flex-wrap gap-2.5">
        <Button type="button" onClick={reset}>
          თავიდან ცდა
        </Button>
        <Link
          href="/app/lessons"
          className="inline-flex h-12 items-center rounded-xl border-[1.5px] border-teal-deep px-6 text-[15px] font-semibold text-teal-deep"
        >
          გაკვეთილზე დაბრუნება
        </Link>
      </div>
    </div>
  );
}
