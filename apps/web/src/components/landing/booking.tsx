"use client";

import { leadInputSchema } from "@nina/contracts";
import { Button, Checkbox, ChoiceChip, Field, Input, Textarea } from "@nina/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { landing } from "@/content/landing.ka";

export type BookSource = "header" | "hero" | "stories" | "gift" | "pricing" | "final" | "menu";

const BookContext = createContext<(source: BookSource) => void>(() => undefined);

export function useBook() {
  return useContext(BookContext);
}

const copy = landing.booking;

type Channel = (typeof copy.channels)[number]["id"];
type Goal = (typeof copy.goals)[number]["id"];
type Day = (typeof copy.week)[number]["id"];
type TimeOfDay = (typeof copy.times)[number]["id"];

export function BookProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const open = params.get("book") === "1";
  const source = (params.get("source") as BookSource | null) ?? "header";

  function openBook(nextSource: BookSource) {
    const next = new URLSearchParams(params.toString());
    next.set("book", "1");
    next.set("source", nextSource);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function closeBook() {
    const next = new URLSearchParams(params.toString());
    next.delete("book");
    next.delete("source");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <BookContext.Provider value={openBook}>
      {children}
      <BookingDialog open={open} source={source} onClose={closeBook} />
    </BookContext.Provider>
  );
}

export function BookButton({
  source,
  children,
  variant = "primary",
  size = "l",
  className,
  arrow = true,
  onOpen,
}: {
  source: BookSource;
  children?: ReactNode;
  variant?: "primary" | "burgundy" | "outline" | "text";
  size?: "l" | "m" | "s";
  className?: string;
  arrow?: boolean;
  onOpen?: () => void;
}) {
  const open = useBook();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        onOpen?.();
        open(source);
      }}
    >
      {children ?? landing.cta}
      {arrow ? <Arrow /> : null}
    </Button>
  );
}

function trackLead(source: string) {
  const plausible = (window as Window & { plausible?: (event: string, options?: { props: Record<string, string> }) => void }).plausible;
  plausible?.("lead_submitted", { props: { source } });
}

function Arrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function BookingDialog({ open, source, onClose }: { open: boolean; source: BookSource; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openedAt = useRef(0);
  const [sent, setSent] = useState<{ channel: string; time?: string } | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openedAt.current = Date.now();
      setSent(null);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="m-0 h-dvh w-full max-w-none rounded-none bg-card p-0 text-ink backdrop:bg-navy/55 open:flex md:m-auto md:h-auto md:max-h-[min(880px,calc(100dvh-32px))] md:w-[min(1000px,calc(100%-32px))] md:rounded-3xl"
      onClose={onClose}
    >
      <div className="grid min-h-0 w-full md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-4 bg-mustard-soft p-8 md:flex">
          <img src="/illustrations/spots/spot-standing.webp" alt="" className="h-44 w-auto object-contain" />
          <p className="font-hand text-5xl text-burgundy">{copy.hello}</p>
          <p className="text-2xl leading-tight font-bold">
            Nina
            <span className="mt-1 block text-lg font-semibold">Tu Profe de Español</span>
          </p>
          <p className="font-semibold text-burgundy">{landing.giftLine}</p>
          <p className="text-base leading-relaxed text-ink-muted">{copy.aside}</p>
        </aside>
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between px-5 py-4 md:px-8">
            <p className="font-hand text-4xl text-burgundy md:hidden">{copy.hello}</p>
            <button type="button" className="ml-auto inline-flex size-11 items-center justify-center rounded-xl bg-sand-soft" aria-label={landing.close} onClick={onClose}>
              <span aria-hidden className="text-2xl leading-none">×</span>
            </button>
          </div>
          {sent ? (
            <Success channel={sent.channel} time={sent.time} onClose={onClose} />
          ) : (
            <LeadForm source={source} openedAt={openedAt} onSent={setSent} />
          )}
        </div>
      </div>
    </dialog>
  );
}

function LeadForm({
  source,
  openedAt,
  onSent,
}: {
  source: BookSource;
  openedAt: { current: number };
  onSent: (value: { channel: string; time?: string }) => void;
}) {
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const noteId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<Channel>("WHATSAPP");
  const [goal, setGoal] = useState<Goal | "">("");
  const [days, setDays] = useState<Day[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | "">("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const order = ["name", "phone", "email", "consent"] as const;
    const key = order.find((item) => errors[item]);
    if (!key) return;
    const id = { name: nameId, phone: phoneId, email: emailId, consent: "lead-consent" }[key];
    document.getElementById(id)?.focus();
  }, [errors, emailId, nameId, phoneId]);

  function toggleDay(day: Day) {
    setDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const localErrors: Record<string, string> = {};
    if (!name.trim()) localErrors.name = copy.nameError;
    if (!consent) localErrors.consent = copy.consentError;
    const digits = phone.replace(/\D/g, "");
    const national = digits.startsWith("995") ? digits.slice(3) : digits;
    const fullPhone = `+995${national}`;
    const parsed = leadInputSchema.safeParse({
      name,
      phone: fullPhone,
      email: email.trim(),
      channel,
      goal: goal || undefined,
      days,
      timeOfDay: timeOfDay || undefined,
      note: note.trim() || undefined,
      consent: consent ? true : undefined,
      source,
      hp: hp || undefined,
      t: Math.max(0, Date.now() - openedAt.current),
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key === "phone") localErrors.phone = copy.phoneError;
        if (key === "email") localErrors.email = copy.emailError;
        if (key === "name" && !localErrors.name) localErrors.name = copy.nameError;
        if (key === "consent") localErrors.consent = copy.consentError;
      }
    }
    if (Object.keys(localErrors).length > 0 || !parsed.success) {
      setErrors(localErrors);
      setSummary(copy.summary);
      return;
    }
    setErrors({});
    setSummary("");
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) throw new Error("lead");
      trackLead(source);
      const channelLabel = copy.channels.find((item) => item.id === channel)?.label ?? channel;
      const timeLabel = copy.times.find((item) => item.id === timeOfDay)?.label;
      onSent({ channel: channelLabel, time: timeLabel });
    } catch {
      setSummary(copy.sendError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className={`flex min-h-0 flex-1 flex-col ${loading ? "opacity-70" : ""}`} noValidate>
      <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-4 md:px-8">
        {summary ? (
          <p role="alert" className="text-sm font-semibold text-burgundy">
            {summary}
          </p>
        ) : null}
        <Field id={nameId} label={copy.name} error={errors.name}>
          <Input id={nameId} name="name" autoComplete="name" value={name} invalid={Boolean(errors.name)} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field id={phoneId} label={copy.phone} error={errors.phone}>
          <div className="flex gap-2">
            <span className="inline-flex h-[52px] items-center rounded-xl border-[1.5px] border-sand bg-card px-3 font-semibold">+995</span>
            <Input id={phoneId} name="phone" inputMode="tel" autoComplete="tel" className="flex-1" value={phone} invalid={Boolean(errors.phone)} onChange={(event) => setPhone(event.target.value)} />
          </div>
        </Field>
        <Field id={emailId} label={copy.email} hint={copy.optional} error={errors.email}>
          <Input id={emailId} name="email" type="email" autoComplete="email" value={email} invalid={Boolean(errors.email)} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <ChipGroup label={copy.channel}>
          {copy.channels.map((item) => (
            <ChoiceChip key={item.id} pressed={channel === item.id} onClick={() => setChannel(item.id)}>
              {item.label}
            </ChoiceChip>
          ))}
        </ChipGroup>
        <ChipGroup label={copy.goal}>
          {copy.goals.map((item) => (
            <ChoiceChip key={item.id} pressed={goal === item.id} onClick={() => setGoal(goal === item.id ? "" : item.id)}>
              {item.label}
            </ChoiceChip>
          ))}
        </ChipGroup>
        <ChipGroup label={copy.days}>
          {copy.week.map((item) => (
            <ChoiceChip key={item.id} pressed={days.includes(item.id)} onClick={() => toggleDay(item.id)}>
              {item.label}
            </ChoiceChip>
          ))}
        </ChipGroup>
        <ChipGroup label={copy.time}>
          {copy.times.map((item) => (
            <ChoiceChip key={item.id} pressed={timeOfDay === item.id} onClick={() => setTimeOfDay(timeOfDay === item.id ? "" : item.id)}>
              {item.label}
            </ChoiceChip>
          ))}
        </ChipGroup>
        <Field id={noteId} label={copy.note} hint={copy.optional}>
          <Textarea id={noteId} name="note" value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <Checkbox id="lead-consent" checked={consent} invalid={Boolean(errors.consent)} onCheckedChange={setConsent}>
          {copy.consent}
        </Checkbox>
        {errors.consent ? <p className="text-[13px] font-medium text-burgundy">{errors.consent}</p> : null}
        <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
          website
          <input tabIndex={-1} autoComplete="off" value={hp} onChange={(event) => setHp(event.target.value)} />
        </label>
      </div>
      <div className="sticky bottom-0 border-t border-line bg-card px-5 py-4 md:px-8">
        <Button type="submit" size="l" className="w-full" loading={loading}>
          {loading ? copy.sending : copy.submit}
        </Button>
      </div>
    </form>
  );
}

function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Success({ channel, time, onClose }: { channel: string; time?: string; onClose: () => void }) {
  const recap = time ? `არხი: ${channel} · ${time}. ერთად შევთანხმდებით პირველი გაკვეთილის დროზე.` : `არხი: ${channel}. ერთად შევთანხმდებით პირველი გაკვეთილის დროზე.`;
  return (
    <div className="flex flex-1 flex-col items-start gap-4 px-5 pb-8 md:px-8">
      <img src="/illustrations/spots/spot-coffee.webp" alt="" className="h-36" />
      <p className="font-hand text-6xl text-burgundy">{copy.thanks}</p>
      <p className="text-2xl font-bold">{copy.success}</p>
      <p className="text-ink-muted">{recap}</p>
      <Button onClick={onClose}>{landing.close}</Button>
      <p className="font-hand text-3xl text-teal-deep md:hidden">{copy.back}</p>
      <p className="font-hand text-4xl text-teal-deep">{copy.soon}</p>
    </div>
  );
}
