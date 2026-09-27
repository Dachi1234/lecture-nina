import type { ReactNode } from "react";
import { cn } from "./cn";
import { Icon, type IconName } from "./icons";

type Status = "new" | "progress" | "done" | "homework" | "personal";

const statusClass: Record<Status, string> = {
  new: "bg-teal-soft text-teal-deep",
  progress: "bg-mustard-soft text-mustard-ink",
  done: "bg-sage-soft text-sage-ink",
  homework: "bg-burgundy-soft text-burgundy",
  personal: "bg-navy text-on-dark",
};

const statusLabel: Record<Status, string> = {
  new: "ახალი",
  progress: "მიმდინარე",
  done: "დასრულებული",
  homework: "საშინაო",
  personal: "პირადი",
};

export function StatusChip({ status, children }: { status: Status; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-[13px] font-semibold", statusClass[status])}>
      {children ?? statusLabel[status]}
    </span>
  );
}

export function StatusRing({ status }: { status: "empty" | "opened" | "done" }) {
  if (status === "done") {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-sage text-on-dark" aria-hidden>
        <Icon name="check" width={14} height={14} strokeWidth={3} />
      </span>
    );
  }
  if (status === "opened") {
    return (
      <span
        className="inline-block size-6 rounded-full border-[2.5px] border-sage bg-[linear-gradient(90deg,var(--color-sage)_50%,transparent_50%)]"
        aria-hidden
      />
    );
  }
  return <span className="inline-block size-6 rounded-full border-[2.5px] border-sand" aria-hidden />;
}

export function FeatureCard({
  number,
  title,
  text,
  tint,
  icon,
  inverted = false,
}: {
  number: string;
  title: string;
  text: string;
  tint: string;
  icon: IconName;
  inverted?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex h-60 overflow-hidden rounded-2xl border-[1.5px] border-line bg-card transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]",
        inverted && "border-navy bg-navy text-on-dark",
      )}
    >
      <div className={cn("flex w-[140px] shrink-0 items-center justify-center", tint)}>
        <Icon name={icon} width={42} height={42} />
      </div>
      <div className="flex flex-col gap-2 px-6 py-6">
        <p className="font-hand text-[30px] leading-none text-burgundy">{number}</p>
        <h3 className="text-[21px] leading-tight font-bold">{title}</h3>
        <p className={cn("text-base leading-relaxed text-ink-muted", inverted && "text-on-dark-muted")}>{text}</p>
      </div>
    </article>
  );
}

export function LessonCard({
  number,
  date,
  title,
  progress,
  status,
}: {
  number: string;
  date: string;
  title: string;
  progress: string;
  status: Status;
}) {
  return (
    <article className="rounded-2xl border-[1.5px] border-line bg-card p-5">
      <p className="text-[13px] font-semibold tracking-wide text-teal-deep uppercase">
        LECCIÓN {number} · {date}
      </p>
      <h3 className="mt-1 text-xl font-bold">{title}</h3>
      <div className="mt-3 flex items-center justify-between gap-3">
        <StatusChip status={status} />
        <span className="text-sm text-ink-muted">{progress}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full w-1/2 rounded-full bg-sage" />
      </div>
    </article>
  );
}

const materialTint: Partial<Record<IconName, string>> = {
  video: "bg-teal-soft text-teal-deep",
  dialogue: "bg-teal-soft text-teal-deep",
  vocabulary: "bg-mustard-soft text-burgundy",
  exercise: "bg-teal-deep text-on-dark",
  document: "bg-sand-soft text-navy",
  pronunciation: "bg-sage-soft text-sage-ink",
  grammar: "bg-mustard-soft text-burgundy",
  homework: "bg-burgundy-soft text-burgundy",
};

export function MaterialRow({
  icon,
  title,
  meta,
  ring,
  action,
}: {
  icon: IconName;
  title: string;
  meta: string;
  ring: "empty" | "opened" | "done";
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 border-b border-line-soft px-4 py-3.5 last:border-b-0">
      <span className={cn("inline-flex size-12 items-center justify-center rounded-xl", materialTint[icon] ?? "bg-sand-soft text-navy")}>
        <Icon name={icon} width={22} height={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold">{title}</p>
        <p className="text-[13px] text-ink-muted">{meta}</p>
      </div>
      {action}
      <StatusRing status={ring} />
    </div>
  );
}
