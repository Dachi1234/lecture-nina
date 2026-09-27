import type { ReactNode } from "react";
import { Logo } from "@nina/ui";

export function AuthPanel({ title, accent, children }: { title: string; accent: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[minmax(280px,440px)_1fr]">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <img
          src="/illustrations/scene-cafe-chalkboard.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ borderRadius: "0 0 220px 220px" }}
        />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
        <Logo className="h-16" />
        <p className="font-hand text-[40px] leading-none text-burgundy">{accent}</p>
        <h1 className="text-[34px] leading-tight font-bold">{title}</h1>
        {children}
      </div>
    </main>
  );
}
