import Link from "next/link";
import { MATERIAL_CATALOG, MATERIAL_GROUPS, type MaterialTypeId } from "@nina/contracts";
import { MaterialRow } from "@nina/ui";
import { apiGet, redirectAdminHome } from "@/lib/api";
import { SECTION_LABELS, materialIcon, materialLabel, progressLabel, ringFor, withLesson } from "@/lib/materials";

type Item = {
  materialId: string;
  title: string;
  type: string;
  section: string;
  estMinutes: number | null;
  status: "NOT_STARTED" | "OPENED" | "COMPLETED";
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
  unitTitle: string | null;
};

type Filters = { group?: string; section?: string; status?: string };

function href(current: Filters, patch: Filters) {
  const next = { ...current, ...patch };
  const query = new URLSearchParams(Object.entries(next).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const text = query.toString();
  return text ? `/app/materials?${text}` : "/app/materials";
}

function Pill({ to, on, children }: { to: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={to}
      aria-current={on ? "page" : undefined}
      className={`inline-flex h-11 items-center rounded-full px-4 text-sm ${on ? "bg-teal-deep font-semibold text-on-dark" : "border-[1.5px] border-sand bg-card"}`}
    >
      {children}
    </Link>
  );
}

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const filters = await searchParams;
  await redirectAdminHome();
  const { items } = await apiGet<{ items: Item[] }>("/v1/me/materials");
  const groupOf = (type: string) => MATERIAL_CATALOG[type as MaterialTypeId]?.group ?? "files";
  const visible = items.filter((item) => {
    if (filters.group && groupOf(item.type) !== filters.group) return false;
    if (filters.section === "HOMEWORK" && item.section !== "HOMEWORK") return false;
    if (filters.status === "open" && item.status === "COMPLETED") return false;
    if (filters.status === "done" && item.status !== "COMPLETED") return false;
    return true;
  });
  const groups = MATERIAL_GROUPS.filter((group) => items.some((item) => groupOf(item.type) === group.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-hand text-[32px] leading-none text-burgundy">Mis materiales</p>
        <h1 className="text-[34px] font-bold">მასალები</h1>
        <p className="mt-1 text-ink-muted">ყველაფერი, რაც ნინამ გაგიზიარა — ნებისმიერ დროს შეგიძლია გაიმეორო.</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Pill to={href(filters, { group: undefined })} on={!filters.group}>
            ყველა · {items.length}
          </Pill>
          {groups.map((group) => (
            <Pill key={group.id} to={href(filters, { group: group.id })} on={filters.group === group.id}>
              {group.labelKa}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill to={href(filters, { section: filters.section === "HOMEWORK" ? undefined : "HOMEWORK" })} on={filters.section === "HOMEWORK"}>
            მხოლოდ საშინაო
          </Pill>
          <Pill to={href(filters, { status: filters.status === "open" ? undefined : "open" })} on={filters.status === "open"}>
            დაუსრულებელი
          </Pill>
          <Pill to={href(filters, { status: filters.status === "done" ? undefined : "done" })} on={filters.status === "done"}>
            დასრულებული
          </Pill>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
        {visible.length === 0 ? <p className="p-6 text-ink-muted">{items.length === 0 ? "მასალები გაკვეთილის შემდეგ გამოჩნდება." : "ამ ფილტრში მასალა არ არის."}</p> : null}
        {visible.map((item) => (
          <Link key={item.materialId} href={withLesson(`/app/m/${item.materialId}`, item.lessonId)} className="block hover:bg-paper-deep">
            <MaterialRow
              icon={materialIcon(item.type)}
              title={item.title}
              meta={`${materialLabel(item.type, item.estMinutes)} · გაკვეთილი ${item.lessonNumber}${item.section === "HOMEWORK" ? ` · ${SECTION_LABELS.HOMEWORK}` : ""}`}
              ring={ringFor(item.status)}
              action={<span className={`hidden text-[13px] font-semibold sm:inline ${item.status === "COMPLETED" ? "text-sage-ink" : "text-ink-muted"}`}>{progressLabel(item.status)}</span>}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
