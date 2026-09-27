import type { ReactNode } from "react";
import { cn } from "./cn";

export function BrushUnderline({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        className="absolute -bottom-3 left-[-4px] h-[18px] w-[calc(100%+8px)]"
        viewBox="0 0 300 22"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M4 13 C 70 6, 160 3, 296 8 C 298 12, 292 15, 286 14 C 190 12, 96 14, 9 19 C 3 19, 1 15, 4 13 Z"
          className="fill-mustard"
        />
      </svg>
    </span>
  );
}

export function BrushCircle({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-flex size-[120px] items-center justify-center", className)}>
      <svg className="absolute inset-0 size-full" viewBox="0 0 120 120" fill="none" aria-hidden>
        <path d="M96 22 A 50 50 0 1 0 108 70" className="stroke-mustard" strokeWidth="5" strokeLinecap="round" />
        <path d="M90 16 A 48 48 0 0 0 30 18" className="stroke-mustard-deep" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  );
}

export function OrganicMask({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden", className)} style={{ borderRadius: "var(--mask-blob)" }}>
      {children}
    </div>
  );
}

export function ArchMask({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden", className)} style={{ borderRadius: "var(--mask-arch)" }}>
      {children}
    </div>
  );
}

export function SectionWave({ className }: { className?: string }) {
  return (
    <svg className={cn("block h-10 w-full", className)} viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden>
      <path d="M0 0 H1440 V14 C 1200 34, 980 6, 720 20 C 460 34, 240 8, 0 24 Z" className="fill-paper" />
    </svg>
  );
}

export function Stamp({ kicker, label, highlighted = false }: { kicker: string; label: string; highlighted?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-32 w-[108px] -rotate-2 flex-col items-center justify-center rounded-md border-2 border-dashed border-sand bg-card text-center",
        highlighted && "rotate-1 border-mustard bg-mustard-soft",
      )}
    >
      <span className="font-hand text-2xl leading-none text-burgundy">{kicker}</span>
      <span className="mt-1 text-sm font-semibold">{label}</span>
    </div>
  );
}

export function PinnedNote({ title, text }: { title: string; text: string }) {
  return (
    <article className="relative h-[206px] w-[220px] rotate-1 rounded bg-card px-4 pt-8 shadow-[0_10px_20px_-14px_rgba(10,65,79,0.5)]">
      <span className="absolute top-0 left-1/2 h-[22px] w-[70px] -translate-x-1/2 bg-mustard/65" aria-hidden />
      <p className="font-hand text-2xl leading-none text-burgundy">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
    </article>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-sand-soft", className)} />;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border-[1.5px] border-line bg-card p-8">
      <p className="font-hand text-5xl leading-none text-burgundy">{title}</p>
      <p className="max-w-md text-lg leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}

export function Logo({ className, alt = "Nina – Tu Profe de Español" }: { className?: string; alt?: string }) {
  return <img src="/brand/nina-logo.webp" alt={alt} className={cn("h-[68px] w-auto", className)} />;
}
