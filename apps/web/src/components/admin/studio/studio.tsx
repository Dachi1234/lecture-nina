"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXERCISE_MATERIAL_TYPES, MATERIAL_CATALOG, materialReadiness, starterContent, type MaterialTypeId, type Readiness } from "@nina/contracts";
import { Button, ChoiceChip, Icon, IconTile } from "@nina/ui";
import { MaterialStage, type MaterialPayload } from "@/components/cabinet/viewers";
import { shortDate } from "@/lib/dates";
import { groupTone, materialIcon, materialLabel, templateLabel } from "@/lib/materials";
import { ContentBuilder } from "./builders";
import { ExerciseBuilder } from "./exercise-builder";
import { AssetsContext, Section, TextField, rec, str, type Rec } from "./kit";

type Topic = { id: string; number: number; titleKa: string };

export type StudioMaterial = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: unknown;
  hasDraft: boolean;
  status: string;
  tags: string[];
  estMinutes: number | null;
  updatedAt: string;
  personalFor: { id: string; name: string } | null;
  assets: Record<string, string>;
  topics: Topic[];
  usage: {
    id: string;
    kind: string;
    groupLabel: string | null;
    readyForStudent: boolean;
    studentId: string;
    studentName: string;
    lesson: { id: string; number: number; title: string } | null;
  }[];
  stats: { opened: number; completed: number };
  revisions: { id: string; title: string; note: string | null; createdAt: string }[];
};

type Tab = "basics" | "content" | "publish";
type SaveState = "saved" | "dirty" | "saving" | "error";

const kindLabel: Record<string, string> = {
  LESSON_MATERIAL: "გაკვეთილის მასალა",
  HOMEWORK: "საშინაო",
  PERSONAL: "პირადი",
  REVIEW: "გამეორება",
};

const MINUTES = [3, 5, 10, 15, 20];

export function MaterialStudio({
  material,
  topics,
  initialTab,
  returnTo,
}: {
  material: StudioMaterial;
  topics: Topic[];
  initialTab: Tab;
  returnTo: { href: string; label: string } | null;
}) {
  const router = useRouter();
  const isExercise = EXERCISE_MATERIAL_TYPES.includes(material.type as MaterialTypeId);
  const catalog = MATERIAL_CATALOG[material.type as MaterialTypeId];
  const tone = groupTone(material.type);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [title, setTitle] = useState(material.title);
  const [subtitle, setSubtitle] = useState(material.subtitle ?? "");
  const [description, setDescription] = useState(material.description ?? "");
  const [estMinutes, setEstMinutes] = useState<number | null>(material.estMinutes);
  const [tags, setTags] = useState(material.tags.join(", "));
  const [topicIds, setTopicIds] = useState(material.topics.map((topic) => topic.id));
  const [content, setContent] = useState<Rec>(() => {
    const stored = rec(material.content);
    return { ...starterContent(material.type, str(stored.templateId) || undefined), ...stored };
  });
  const [assets, setAssets] = useState(material.assets);
  const [hasDraft, setHasDraft] = useState(material.hasDraft);
  const [status, setStatus] = useState(material.status);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [device, setDevice] = useState<"phone" | "wide">("phone");
  const inflight = useRef<Promise<boolean> | null>(null);

  const readiness = useMemo(() => materialReadiness(material.type, content), [material.type, content]);
  const templateId = str(content.templateId);

  const payload = useMemo(
    () => ({
      title,
      subtitle,
      description,
      estMinutes,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      topicIds,
      content: isExercise ? { ...content, title } : content,
    }),
    [title, subtitle, description, estMinutes, tags, topicIds, content, isExercise],
  );
  const serialized = JSON.stringify(payload);
  const lastSaved = useRef(serialized);

  async function save(): Promise<boolean> {
    if (!title.trim()) {
      setSaveState("error");
      setError("სათაური ცარიელია.");
      return false;
    }
    setSaveState("saving");
    const body = serialized;
    const run = (async () => {
      const response = await fetch(`/v1/admin/materials/${material.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
      }).catch(() => null);
      if (!response?.ok) {
        setSaveState("error");
        return false;
      }
      const result = (await response.json()) as { hasDraft: boolean; assets: Record<string, string> };
      lastSaved.current = body;
      setHasDraft(result.hasDraft);
      setAssets((current) => ({ ...current, ...result.assets }));
      setSaveState("saved");
      setSavedAt(new Date());
      setError("");
      return true;
    })();
    inflight.current = run;
    return run;
  }

  useEffect(() => {
    if (serialized === lastSaved.current) return;
    setSaveState("dirty");
    const timer = window.setTimeout(() => void save(), 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  async function flush() {
    if (saveState === "dirty") return save();
    if (inflight.current) return inflight.current;
    return true;
  }

  async function post(path: string, body?: unknown) {
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch(`/v1/admin/materials/${material.id}${path}`, {
      method: path === "" ? "DELETE" : "POST",
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    setBusy(false);
    const json = (await response?.json().catch(() => null)) as { id?: string; status?: string; error?: { messageKa?: string } } | null;
    if (!response?.ok) {
      setError(json?.error?.messageKa ?? "ვერ მოხერხდა.");
      return null;
    }
    return json ?? {};
  }

  async function publish() {
    if (!(await flush())) return;
    const result = await post("/publish");
    if (!result) return;
    setStatus("PUBLISHED");
    setHasDraft(false);
    setMessage(material.usage.length ? "გამოქვეყნდა. მოსწავლეები ახლა ახალ ვერსიას ხედავენ." : "გამოქვეყნდა. ახლა შეგიძლია გაკვეთილში ჩასვა.");
    router.refresh();
  }

  async function discard() {
    if (!window.confirm("გავაუქმო ცვლილებები და დავბრუნდე გამოქვეყნებულ ვერსიაზე?")) return;
    const result = await post("/discard-draft");
    if (result) window.location.reload();
  }

  async function duplicate() {
    if (!(await flush())) return;
    const result = await post("/duplicate");
    if (result?.id) router.push(`/admin/library/${result.id}?tab=basics`);
  }

  async function archive(archived: boolean) {
    const result = await post("/archive", { archived });
    if (result?.status) setStatus(result.status);
  }

  async function remove() {
    if (!window.confirm("წავშალო მასალა სამუდამოდ?")) return;
    const result = await post("");
    if (result) router.push("/admin/library");
  }

  const preview: MaterialPayload = {
    id: material.id,
    title,
    subtitle: subtitle || null,
    description: description || null,
    type: material.type,
    content: isExercise ? { ...content, title } : content,
    status: "NOT_STARTED",
    lastStep: null,
    canMarkDone: false,
    lessonId: null,
    preview: true,
    assets,
    prev: null,
    next: null,
  };

  const steps: { id: Tab; label: string; done: boolean }[] = [
    { id: "basics", label: "ძირითადი", done: Boolean(title.trim()) },
    { id: "content", label: "შიგთავსი", done: readiness.ready },
    { id: "publish", label: "შემოწმება და გამოქვეყნება", done: status === "PUBLISHED" && !hasDraft },
  ];

  return (
    <AssetsContext.Provider value={{ assets, register: (assetId, path) => setAssets((current) => ({ ...current, [assetId]: path })) }}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={returnTo?.href ?? "/admin/library"} onClick={() => void flush()} className="text-sm font-semibold text-teal-deep">
            ← {returnTo?.label ?? "ბიბლიოთეკა"}
          </Link>
          <SaveIndicator state={saveState} savedAt={savedAt} onRetry={() => void save()} />
        </div>

        <header className="flex flex-wrap items-start gap-4">
          <IconTile name={materialIcon(material.type)} className={`${tone.tile} ${tone.ink}`} />
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${tone.ink}`}>
              {materialLabel(material.type, null)}
              {templateLabel(templateId) ? ` · ${templateLabel(templateId)}` : ""}
              {material.personalFor ? ` · პირადი: ${material.personalFor.name}` : ""}
            </p>
            <h1 className="mt-1 text-3xl leading-tight font-bold break-words">{title || "უსათაურო"}</h1>
          </div>
          <StatusBadge status={status} hasDraft={hasDraft} />
        </header>

        <nav aria-label="ნაბიჯები" className="grid gap-2 sm:grid-cols-3">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              aria-current={tab === step.id ? "step" : undefined}
              onClick={() => setTab(step.id)}
              className={`flex min-h-14 items-center gap-3 rounded-xl border-[1.5px] px-4 text-left transition ${tab === step.id ? "border-teal-deep bg-card shadow-sm" : "border-line bg-paper hover:border-sand"}`}
            >
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step.done ? "bg-sage text-on-dark" : tab === step.id ? "bg-teal-deep text-on-dark" : "bg-paper-deep text-ink-muted"}`}>
                {step.done ? <Icon name="check" width={16} height={16} /> : index + 1}
              </span>
              <span className="font-semibold">{step.label}</span>
            </button>
          ))}
        </nav>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex min-w-0 flex-col gap-5">
            {tab === "basics" ? (
              <>
                <Section title="რა არის ეს მასალა" hint={catalog?.purposeKa}>
                  <TextField label="სათაური" hint="(მოსწავლე ხედავს)" placeholder={catalog?.titleExample} value={title} onChange={setTitle} />
                  <TextField label="მოკლე აღწერა სიაში" hint="(არასავალდებულო)" placeholder="ვიდეო-დიალოგი · 2:10" value={subtitle} onChange={setSubtitle} />
                  <TextField label="შენიშვნა მოსწავლისთვის" hint="(ჩანს მასალის ბოლოს)" placeholder="ჯერ მოუსმინე, მერე წაიკითხე ხმამაღლა." rows={2} value={description} onChange={setDescription} />
                </Section>
                <Section title="დრო და თემა" hint="თემა ეხმარება ბიბლიოთეკაში ძებნას და მოსწავლის ლექსიკის ფილტრს.">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">დაახლოებით რამდენი წუთი</p>
                    <div className="flex flex-wrap gap-2">
                      {MINUTES.map((value) => (
                        <ChoiceChip key={value} pressed={estMinutes === value} onClick={() => setEstMinutes(estMinutes === value ? null : value)}>{value} წთ</ChoiceChip>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">თემები · {topicIds.length}</p>
                    <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
                      {topics.map((topic) => {
                        const pressed = topicIds.includes(topic.id);
                        return (
                          <ChoiceChip key={topic.id} pressed={pressed} className="h-10 text-sm" onClick={() => setTopicIds(pressed ? topicIds.filter((id) => id !== topic.id) : [...topicIds, topic.id])}>
                            {topic.number} · {topic.titleKa}
                          </ChoiceChip>
                        );
                      })}
                    </div>
                  </div>
                  <TextField label="თეგები" hint="(მძიმით, მხოლოდ შენთვის)" placeholder="კაფე, შეკვეთა, querer" value={tags} onChange={setTags} />
                </Section>
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setTab("content")}>შემდეგი: შიგთავსი →</Button>
                </div>
              </>
            ) : null}

            {tab === "content" ? (
              <>
                {isExercise ? <ExerciseBuilder content={content} onChange={setContent} /> : <ContentBuilder type={material.type} content={content} onChange={setContent} />}
                <div className="flex flex-wrap justify-between gap-3">
                  <Button type="button" variant="outline" onClick={() => setTab("basics")}>← ძირითადი</Button>
                  <Button type="button" onClick={() => setTab("publish")}>შემდეგი: შემოწმება →</Button>
                </div>
              </>
            ) : null}

            {tab === "publish" ? (
              <PublishPanel
                readiness={readiness}
                status={status}
                hasDraft={hasDraft}
                busy={busy}
                usage={material.usage}
                stats={material.stats}
                revisions={material.revisions}
                message={message}
                error={error}
                onPublish={() => void publish()}
                onDiscard={() => void discard()}
                onDuplicate={() => void duplicate()}
                onArchive={(archived) => void archive(archived)}
                onDelete={() => void remove()}
                onFix={() => setTab("content")}
              />
            ) : null}
            {tab !== "publish" && error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
            <ReadinessCard readiness={readiness} onOpen={() => setTab("content")} />
            <section className="rounded-2xl border-[1.5px] border-line bg-paper-deep p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-muted">როგორც მოსწავლე ხედავს</p>
                <div role="group" aria-label="ეკრანი" className="flex gap-1">
                  <button type="button" aria-pressed={device === "phone"} onClick={() => setDevice("phone")} className={`h-9 rounded-lg px-2 text-xs font-semibold ${device === "phone" ? "bg-card text-teal-deep" : "text-ink-muted"}`}>ტელეფონი</button>
                  <button type="button" aria-pressed={device === "wide"} onClick={() => setDevice("wide")} className={`h-9 rounded-lg px-2 text-xs font-semibold ${device === "wide" ? "bg-card text-teal-deep" : "text-ink-muted"}`}>ფართო</button>
                </div>
              </div>
              <div className={`mx-auto max-h-[75vh] overflow-y-auto rounded-2xl bg-paper p-3 ${device === "phone" ? "max-w-[390px] ring-8 ring-card" : ""}`}>
                <MaterialStage key={`${templateId}-${Array.isArray(content.steps) ? content.steps.length : 0}`} material={preview} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AssetsContext.Provider>
  );
}

function SaveIndicator({ state, savedAt, onRetry }: { state: SaveState; savedAt: Date | null; onRetry: () => void }) {
  if (state === "saving") return <p className="text-sm text-ink-muted" aria-live="polite">ინახება…</p>;
  if (state === "dirty") return <p className="text-sm text-ink-muted" aria-live="polite">შეუნახავი ცვლილებები</p>;
  if (state === "error") {
    return (
      <p className="text-sm text-burgundy" aria-live="polite">
        ვერ შეინახა · <button type="button" className="font-semibold underline" onClick={onRetry}>თავიდან ცდა</button>
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1 text-sm text-sage-ink" aria-live="polite">
      <Icon name="check" width={16} height={16} />
      {savedAt ? `შენახულია · ${savedAt.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tbilisi" })}` : "ყველაფერი შენახულია"}
    </p>
  );
}

function StatusBadge({ status, hasDraft }: { status: string; hasDraft: boolean }) {
  if (status === "ARCHIVED") return <span className="rounded-full bg-sand-soft px-3 py-1.5 text-sm font-semibold">არქივში</span>;
  if (status === "PUBLISHED" && hasDraft) return <span className="rounded-full bg-mustard-soft px-3 py-1.5 text-sm font-semibold text-mustard-ink">გამოუქვეყნებელი ცვლილებები</span>;
  if (status === "PUBLISHED") return <span className="rounded-full bg-sage-soft px-3 py-1.5 text-sm font-semibold text-sage-ink">გამოქვეყნებული</span>;
  return <span className="rounded-full bg-teal-soft px-3 py-1.5 text-sm font-semibold text-teal-deep">მონახაზი</span>;
}

function ReadinessCard({ readiness, onOpen }: { readiness: Readiness; onOpen: () => void }) {
  const percent = readiness.requiredTotal ? Math.round((readiness.requiredDone / readiness.requiredTotal) * 100) : 0;
  const required = readiness.checks.filter((check) => check.required);
  const optional = readiness.checks.filter((check) => !check.required);
  return (
    <section className="rounded-2xl border-[1.5px] border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">{readiness.ready ? "მზადაა გამოსაქვეყნებლად" : "რა აკლია"}</h2>
        <span className={`text-sm font-semibold ${readiness.ready ? "text-sage-ink" : "text-mustard-ink"}`}>{readiness.requiredDone} / {readiness.requiredTotal}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line-soft">
        <div className={`h-full rounded-full transition-all ${readiness.ready ? "bg-sage" : "bg-mustard"}`} style={{ width: `${percent}%` }} />
      </div>
      <ul className="mt-3 flex flex-col gap-1.5 text-sm">
        {required.map((check) => (
          <li key={check.id} className="flex items-start gap-2">
            <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${check.done ? "bg-sage text-on-dark" : "border-[1.5px] border-mustard-deep"}`}>{check.done ? <Icon name="check" width={12} height={12} /> : null}</span>
            <button type="button" onClick={onOpen} className={`text-left ${check.done ? "text-ink-muted line-through decoration-line" : "font-semibold"}`}>{check.labelKa}</button>
          </li>
        ))}
      </ul>
      {optional.length ? (
        <>
          <p className="mt-3 text-xs font-semibold text-ink-muted">უკეთესისთვის</p>
          <ul className="mt-1 flex flex-col gap-1.5 text-sm">
            {optional.map((check) => (
              <li key={check.id} className="flex items-start gap-2 text-ink-muted">
                <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${check.done ? "bg-sage-soft text-sage-ink" : "border-[1.5px] border-line"}`}>{check.done ? <Icon name="check" width={12} height={12} /> : null}</span>
                {check.labelKa}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function PublishPanel({
  readiness,
  status,
  hasDraft,
  busy,
  usage,
  stats,
  revisions,
  message,
  error,
  onPublish,
  onDiscard,
  onDuplicate,
  onArchive,
  onDelete,
  onFix,
}: {
  readiness: Readiness;
  status: string;
  hasDraft: boolean;
  busy: boolean;
  usage: StudioMaterial["usage"];
  stats: StudioMaterial["stats"];
  revisions: StudioMaterial["revisions"];
  message: string;
  error: string;
  onPublish: () => void;
  onDiscard: () => void;
  onDuplicate: () => void;
  onArchive: (archived: boolean) => void;
  onDelete: () => void;
  onFix: () => void;
}) {
  const live = status === "PUBLISHED";
  const upToDate = live && !hasDraft;
  const missing = readiness.checks.filter((check) => check.required && !check.done);
  const students = new Set(usage.map((item) => item.studentName));
  return (
    <div className="flex flex-col gap-5">
      <Section title={upToDate ? "გამოქვეყნებულია" : live ? "ცვლილებების გამოქვეყნება" : "გამოქვეყნება"}>
        {upToDate ? (
          <p className="text-[15px] leading-relaxed">მოსწავლეები ხედავენ ბოლო ვერსიას. ახალი ცვლილებები ჯერ მონახაზად შეინახება და შენ გადაწყვეტ, როდის გამოჩნდეს.</p>
        ) : live ? (
          <p className="text-[15px] leading-relaxed">
            შენი ცვლილებები შენახულია მონახაზად. {students.size ? `${[...students].join(", ")} ჯერ ძველ ვერსიას ხედავს.` : ""} გამოქვეყნების შემდეგ ახალი ვერსია ყველას გამოუჩნდება, ვისაც ეს მასალა აქვს.
          </p>
        ) : (
          <p className="text-[15px] leading-relaxed">გამოქვეყნებული მასალა შეგიძლია ჩასვა ნებისმიერი მოსწავლის გაკვეთილში. ერთი მასალა — ბევრ გაკვეთილში, ასლების გარეშე.</p>
        )}
        {missing.length && !upToDate ? (
          <div className="rounded-xl bg-mustard-soft px-4 py-3 text-sm text-mustard-ink">
            <p className="font-semibold">გამოქვეყნებამდე შეავსე:</p>
            <ul className="mt-1 list-disc pl-5">
              {missing.map((check) => <li key={check.id}>{check.labelKa}</li>)}
            </ul>
            <button type="button" className="mt-2 font-semibold underline" onClick={onFix}>შიგთავსზე დაბრუნება</button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {!upToDate ? (
            <Button type="button" loading={busy} disabled={!readiness.ready} onClick={onPublish}>
              {live ? "ცვლილებების გამოქვეყნება" : "გამოქვეყნება"}
            </Button>
          ) : null}
          {live && hasDraft ? <Button type="button" variant="outline" disabled={busy} onClick={onDiscard}>ცვლილებების გაუქმება</Button> : null}
        </div>
        {message ? <p className="text-sm font-medium text-sage-ink" aria-live="polite">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-burgundy" aria-live="polite">{error}</p> : null}
      </Section>

      <Section title="სად გამოიყენება" hint={usage.length ? `${students.size} მოსწავლე · ${usage.length} გაკვეთილი · გახსნა ${stats.opened} · დაასრულა ${stats.completed}` : undefined}>
        {usage.length === 0 ? (
          <p className="text-sm text-ink-muted">ჯერ არც ერთ გაკვეთილში არ არის. გაკვეთილის რედაქტორში მოძებნე სათაურით და დაამატე.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {usage.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-4 py-3 text-sm">
                <span>
                  <b>{item.studentName}</b>
                  {item.lesson ? ` · გაკვეთილი ${item.lesson.number} · ${item.lesson.title}` : " · გაკვეთილის გარეთ"}
                  {` · ${kindLabel[item.kind] ?? item.kind}`}
                </span>
                <span className="flex items-center gap-3">
                  <span className={item.readyForStudent ? "text-sage-ink" : "text-ink-muted"}>{item.readyForStudent ? "უჩანს" : "დამალულია"}</span>
                  {item.lesson ? <Link href={`/admin/students/${item.studentId}/lessons/${item.lesson.id}`} className="font-semibold text-teal-deep">გაკვეთილი →</Link> : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {revisions.length ? (
        <Section title="ისტორია">
          <ul className="flex flex-col gap-1 text-sm text-ink-muted">
            {revisions.map((revision) => (
              <li key={revision.id}>{shortDate(revision.createdAt)} · {revision.note === "update" ? "განახლდა" : "გამოქვეყნდა"} · {revision.title}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="სხვა მოქმედებები">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" size="s" disabled={busy} onClick={onDuplicate}>ასლის შექმნა</Button>
          {status === "ARCHIVED" ? (
            <Button type="button" variant="outline" size="s" disabled={busy} onClick={() => onArchive(false)}>არქივიდან დაბრუნება</Button>
          ) : (
            <Button type="button" variant="outline" size="s" disabled={busy} onClick={() => onArchive(true)}>არქივში გადატანა</Button>
          )}
          {usage.length === 0 ? (
            <button type="button" disabled={busy} onClick={onDelete} className="h-10 px-3 text-sm font-semibold text-burgundy">წაშლა</button>
          ) : null}
        </div>
        <p className="text-sm text-ink-muted">ასლი გამოგადგება, თუ სხვა მოსწავლისთვის ოდნავ განსხვავებული ვერსია გინდა.</p>
      </Section>
    </div>
  );
}
