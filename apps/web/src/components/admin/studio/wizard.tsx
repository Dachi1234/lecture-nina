"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { EXERCISE_TEMPLATE_CATALOG, MATERIAL_CATALOG, MATERIAL_GROUPS, exerciseTemplateMeta, type MaterialTypeMeta } from "@nina/contracts";
import { Button, ChoiceChip, Icon, IconTile } from "@nina/ui";
import { groupTone, materialIcon } from "@/lib/materials";
import { Segmented, TextField } from "./kit";

export type AttachTarget = { kind: "plan" | "lesson"; id: string; label: string; section: string; returnTo: string };
type Choice = { type: string; templateId?: string };

const LEVELS = ["A1", "A2", "B1", "B2"];
const SECTIONS = [
  { id: "WARMUP", label: "გახურება" },
  { id: "CLASS", label: "გაკვეთილზე" },
  { id: "HOMEWORK", label: "საშინაო" },
  { id: "REVIEW", label: "გამეორება" },
];

const buildLabel: Record<MaterialTypeMeta["build"], string> = {
  builder: "აწყობა აქვე",
  upload: "ფაილის ატვირთვა",
  mixed: "ატვირთვა + ტექსტი",
};

const MINUTES = [3, 5, 10, 15, 20];

export function NewMaterialWizard({ target }: { target: AttachTarget | null }) {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [estMinutes, setEstMinutes] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>("A1");
  const [section, setSection] = useState(target?.section ?? "CLASS");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const meta = choice ? MATERIAL_CATALOG[choice.type as keyof typeof MATERIAL_CATALOG] : null;
  const template = choice?.templateId ? exerciseTemplateMeta(choice.templateId) : null;

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!choice || !title.trim()) return;
    setBusy(true);
    setError("");
    const response = await fetch("/v1/admin/materials", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: choice.type,
        templateId: choice.templateId,
        title,
        subtitle,
        estMinutes,
        level,
        ...(target ? { attach: { [target.kind === "plan" ? "planId" : "lessonId"]: target.id, section } } : {}),
      }),
    }).catch(() => null);
    const body = (await response?.json().catch(() => null)) as { id?: string; error?: { messageKa?: string } } | null;
    if (!response?.ok || !body?.id) {
      setBusy(false);
      setError(body?.error?.messageKa ?? "ვერ შეიქმნა.");
      return;
    }
    const back = target ? `&returnTo=${encodeURIComponent(target.returnTo)}` : "";
    router.push(`/admin/library/${body.id}?tab=content${back}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-wrap gap-2 text-sm" aria-label="ნაბიჯები">
        {["ტიპი", "ძირითადი", "შიგთავსი", "გამოქვეყნება"].map((label, index) => {
          const current = (choice ? 1 : 0) === index;
          const done = index === 0 && choice !== null;
          return (
            <li key={label} className={`flex h-10 items-center gap-2 rounded-full px-4 font-semibold ${current ? "bg-teal-deep text-on-dark" : done ? "bg-sage-soft text-sage-ink" : "bg-paper-deep text-ink-muted"}`}>
              {done ? <Icon name="check" width={16} height={16} /> : <span>{index + 1}</span>}
              {label}
            </li>
          );
        })}
      </ol>

      {target ? (
        <p className="rounded-xl bg-teal-soft px-4 py-3 text-[15px] text-teal-deep">
          ახალი მასალა ჩაემატება: <b>{target.label}</b>. ბიბლიოთეკაშიც შეინახება, რომ სხვა გეგმებშიც გამოიყენო.
        </p>
      ) : null}

      {!choice ? (
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold">რას ქმნი?</h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">აირჩიე ტიპი — ყოველ ტიპს თავისი რედაქტორი აქვს. ქვემოთ წერია, რას დაინახავს მოსწავლე.</p>
          </div>
          {MATERIAL_GROUPS.map((group) => {
            const tone = { words: "VOCAB", listen: "DIALOGUE", explain: "GRAMMAR", files: "DOCUMENT", practice: "EXERCISE" }[group.id];
            const types = Object.values(MATERIAL_CATALOG).filter((item) => item.group === group.id && item.inWizard);
            return (
              <section key={group.id} className="flex flex-col gap-3">
                <div className="flex items-baseline gap-3">
                  <h2 className={`text-xl font-bold ${groupTone(tone).ink}`}>{group.labelKa}</h2>
                  <p className="text-sm text-ink-muted">{group.hintKa}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {group.id === "practice"
                    ? EXERCISE_TEMPLATE_CATALOG.map((item) => (
                        <TypeCard
                          key={item.id}
                          icon={materialIcon(item.materialType)}
                          toneType={item.materialType}
                          label={item.labelKa}
                          purpose={item.purposeKa}
                          example={item.exampleKa}
                          badge={MATERIAL_CATALOG[item.materialType].labelKa}
                          onPick={() => { setChoice({ type: item.materialType, templateId: item.id }); setTitle(""); }}
                        />
                      ))
                    : types.map((item) => (
                        <TypeCard
                          key={item.type}
                          icon={materialIcon(item.type)}
                          toneType={item.type}
                          label={item.labelKa}
                          purpose={item.purposeKa}
                          example={`მოსწავლე ხედავს ${item.studentSeesKa}`}
                          badge={buildLabel[item.build]}
                          onPick={() => { setChoice({ type: item.type }); setTitle(""); }}
                        />
                      ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <form onSubmit={(event) => void create(event)} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-5 rounded-2xl border-[1.5px] border-line bg-card p-5 sm:p-6">
            <h1 className="text-2xl font-bold">ძირითადი</h1>
            <TextField label="სათაური" hint="(მოსწავლე ხედავს)" placeholder={meta?.titleExample} value={title} onChange={setTitle} />
            <TextField label="მოკლე აღწერა სიაში" hint="(არასავალდებულო)" placeholder="მაგ. ვიდეო-დიალოგი · 2:10" value={subtitle} onChange={setSubtitle} />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">დაახლოებით რამდენი წუთი</p>
              <div className="flex flex-wrap gap-2">
                {MINUTES.map((value) => (
                  <ChoiceChip key={value} pressed={estMinutes === value} onClick={() => setEstMinutes(estMinutes === value ? null : value)}>{value} წთ</ChoiceChip>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">დონე</p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((value) => (
                  <ChoiceChip key={value} pressed={level === value} onClick={() => setLevel(level === value ? null : value)}>{value}</ChoiceChip>
                ))}
              </div>
            </div>
            {target ? (
              <div className="flex flex-col gap-3 rounded-xl bg-paper-deep p-4">
                <Segmented label="სექცია" value={section} options={SECTIONS} onChange={setSection} />
                <p className="text-sm text-ink-muted">მოსწავლე ამას დაინახავს მხოლოდ მაშინ, როცა მასალა გამოქვეყნდება და გაკვეთილი გაეგზავნება.</p>
              </div>
            ) : null}
            {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
            <div className="flex flex-wrap justify-between gap-3">
              <Button type="button" variant="outline" onClick={() => setChoice(null)}>← ტიპის შეცვლა</Button>
              <Button type="submit" loading={busy} disabled={!title.trim()}>შექმნა და შევსება →</Button>
            </div>
          </div>
          <aside className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-paper-deep p-5">
            <div className="flex items-center gap-3">
              <IconTile name={materialIcon(choice.type)} className={`${groupTone(choice.type).tile} ${groupTone(choice.type).ink}`} />
              <div>
                <p className="text-sm text-ink-muted">{meta?.labelKa}</p>
                <p className="font-bold">{template?.labelKa ?? meta?.labelKa}</p>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed">{template?.purposeKa ?? meta?.purposeKa}</p>
            <p className="text-sm leading-relaxed text-ink-muted">მოსწავლე ხედავს {meta?.studentSeesKa}</p>
            {template ? <p className="rounded-lg bg-card px-3 py-2 text-sm" lang="es">{template.exampleKa}</p> : null}
            <p className="text-sm text-ink-muted">შემდეგ ნაბიჯზე გაიხსნება ამ ტიპის რედაქტორი — მზა ველებით, რომ ცარიელ ფურცელზე არ დაიწყო.</p>
          </aside>
        </form>
      )}
    </div>
  );
}

function TypeCard({ icon, toneType, label, purpose, example, badge, onPick }: { icon: ReturnType<typeof materialIcon>; toneType: string; label: string; purpose: string; example: string; badge: string; onPick: () => void }) {
  const tone = groupTone(toneType);
  return (
    <button
      type="button"
      onClick={onPick}
      className="group flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-teal-deep hover:shadow-md focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mustard"
    >
      <div className="flex items-start justify-between gap-3">
        <IconTile name={icon} className={`${tone.tile} ${tone.ink}`} />
        <span className="rounded-full bg-paper-deep px-3 py-1 text-xs font-semibold text-ink-muted">{badge}</span>
      </div>
      <div>
        <p className="text-lg font-bold">{label}</p>
        <p className="mt-1 text-[15px] leading-relaxed">{purpose}</p>
      </div>
      <p className="mt-auto text-sm leading-relaxed text-ink-muted">{example}</p>
    </button>
  );
}
