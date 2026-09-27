"use client";

import { useState } from "react";
import { Checkbox } from "@nina/ui";
import { DialogueBuilder } from "./dialogue-builder";
import {
  AddButton,
  ImageStrip,
  MediaSlot,
  MiniInput,
  RowTools,
  Section,
  Segmented,
  TextField,
  arr,
  miniField,
  miniInput,
  move,
  rec,
  recs,
  removeAt,
  replaceAt,
  str,
  type Rec,
} from "./kit";

type BuilderProps = { content: Rec; onChange: (content: Rec) => void };

const RICH_HINT = "**მუქი** ტექსტისთვის · ცარიელი ხაზი = ახალი აბზაცი · „- “ ხაზის დასაწყისში = სია";

export function ContentBuilder({ type, content, onChange }: { type: string } & BuilderProps) {
  switch (type) {
    case "VOCAB":
      return <VocabBuilder content={content} onChange={onChange} />;
    case "INFO_CARD":
      return <InfoCardBuilder content={content} onChange={onChange} />;
    case "DIALOGUE":
      return <DialogueTypeBuilder content={content} onChange={onChange} />;
    case "VIDEO":
      return <VideoBuilder content={content} onChange={onChange} />;
    case "AUDIO":
      return <AudioBuilder content={content} onChange={onChange} />;
    case "STORY":
      return <StoryBuilder content={content} onChange={onChange} />;
    case "GRAMMAR":
      return <GrammarBuilder content={content} onChange={onChange} />;
    case "PRONUNCIATION":
      return <PronunciationBuilder content={content} onChange={onChange} />;
    case "DOCUMENT":
      return <DocumentBuilder content={content} onChange={onChange} />;
    case "GRADED_READER":
      return <ReaderBuilder content={content} onChange={onChange} />;
    case "HTML_EMBED":
      return <EmbedBuilder content={content} onChange={onChange} />;
    default:
      return null;
  }
}

const ARTICLES = ["", "el", "la", "los", "las"] as const;

function splitArticle(text: string) {
  const match = /^(el|la|los|las)\s+(.+)$/i.exec(text.trim());
  return match ? { article: (match[1] ?? "").toLowerCase(), es: match[2] ?? "" } : { article: "", es: text.trim() };
}

export function parseWordList(text: string): Rec[] {
  return text
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .flatMap((row) => {
      const parts = row.includes("\t") ? row.split("\t") : row.split(/\s[-–=]\s|;/);
      const [es = "", ka = "", en = ""] = parts.map((part) => part.trim());
      if (!es) return [];
      const split = splitArticle(es);
      return [{ ...(split.article ? { article: split.article } : {}), es: split.es, ka, ...(en ? { en } : {}) }];
    });
}

function VocabBuilder({ content, onChange }: BuilderProps) {
  const title = rec(content.title);
  const entries = recs(content.entries);
  const layout = content.layout === "image" ? "image" : "list";
  const [open, setOpen] = useState<number | null>(null);
  const [paste, setPaste] = useState("");
  const [panel, setPanel] = useState<"" | "paste" | "glossary">("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; es: string; ka: string; en: string | null }[]>([]);
  const [glossaryNote, setGlossaryNote] = useState("");

  function setEntries(next: Rec[]) {
    onChange({ ...content, entries: next });
  }

  async function search(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const response = await fetch(`/v1/admin/vocabulary?q=${encodeURIComponent(value.trim())}`, { credentials: "include" });
    if (!response.ok) return;
    const body = (await response.json()) as { items: { id: string; es: string; ka: string; en: string | null }[] };
    setResults(body.items.slice(0, 8));
  }

  async function saveToGlossary() {
    setGlossaryNote("");
    const response = await fetch("/v1/admin/vocabulary", { credentials: "include" });
    if (!response.ok) return;
    const body = (await response.json()) as { items: { es: string }[] };
    const known = new Set(body.items.map((item) => item.es.trim().toLowerCase()));
    const rows = entries
      .filter((entry) => str(entry.es).trim() && str(entry.ka).trim())
      .map((entry) => ({ es: [str(entry.article), str(entry.es).trim()].filter(Boolean).join(" "), ka: str(entry.ka).trim(), en: str(entry.en).trim() || undefined }))
      .filter((row) => !known.has(row.es.toLowerCase()));
    if (rows.length === 0) {
      setGlossaryNote("ყველა სიტყვა უკვე არის ლექსიკონში.");
      return;
    }
    const saved = await fetch("/v1/admin/vocabulary/import", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    setGlossaryNote(saved.ok ? `ლექსიკონს დაემატა ${rows.length} სიტყვა.` : "ვერ შეინახა.");
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="სათაური და შესავალი" hint="სათაური ჩანს ბარათის თავზე. შესავალი — ერთი წინადადება, სად გამოიყენება ეს სიტყვები.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="ესპანურად" lang="es" placeholder="En el café" value={str(title.es)} onChange={(es) => onChange({ ...content, title: { ...title, es } })} />
          <TextField label="ქართულად" placeholder="კაფეში" value={str(title.ka)} onChange={(ka) => onChange({ ...content, title: { ...title, ka } })} />
        </div>
        <TextField label="შესავალი" hint="(არასავალდებულო)" placeholder="ეს სიტყვები დაგჭირდება, როცა კაფეში შეუკვეთავ." value={str(content.introKa)} onChange={(introKa) => onChange({ ...content, introKa })} />
      </Section>

      <Section title="როგორ ნახავს მოსწავლე" hint="სია აიწყობა ავტომატურად შენი სიტყვებიდან. მზა ბარათები — თუ დიზაინი უკვე გაქვს სურათად.">
        <Segmented
          label="ხედი"
          value={layout}
          options={[{ id: "list", label: "სია + ბარათებით ვარჯიში" }, { id: "image", label: "ჩემი მზა ბარათები" }]}
          onChange={(next) => onChange({ ...content, layout: next })}
        />
        {layout === "image" ? <ImageStrip label="ბარათი" value={content.pages} onChange={(pages) => onChange({ ...content, pages })} /> : null}
      </Section>

      <Section
        title={`სიტყვები · ${entries.filter((entry) => str(entry.es).trim()).length}`}
        hint={layout === "image" ? "არასავალდებულო მზა ბარათებთან, მაგრამ სიტყვები საჭიროა ბარათებით ვარჯიშისთვის." : "არტიკლი ფერად გამოჩნდება. გახსენი ხაზი ▾ მაგალითის, სურათის და აუდიოსთვის."}
        action={
          <div className="flex gap-2">
            <button type="button" aria-pressed={panel === "paste"} onClick={() => setPanel(panel === "paste" ? "" : "paste")} className="h-10 rounded-lg border-[1.5px] border-sand px-3 text-sm font-semibold aria-pressed:border-teal-deep aria-pressed:text-teal-deep">სიის ჩასმა</button>
            <button type="button" aria-pressed={panel === "glossary"} onClick={() => setPanel(panel === "glossary" ? "" : "glossary")} className="h-10 rounded-lg border-[1.5px] border-sand px-3 text-sm font-semibold aria-pressed:border-teal-deep aria-pressed:text-teal-deep">ლექსიკონიდან</button>
          </div>
        }
      >
        {panel === "paste" ? (
          <div className="flex flex-col gap-2 rounded-xl bg-paper-deep p-3">
            <p className="text-sm text-ink-muted">ჩასვი Excel-იდან ან Google Sheets-იდან (სვეტები: ესპანური · ქართული · ინგლისური), ან აკრიფე <code>el café - ყავა - coffee</code>. არტიკლი თავისით გამოიყოფა.</p>
            <textarea value={paste} onChange={(event) => setPaste(event.target.value)} rows={6} className={`${miniInput} h-auto py-2`} aria-label="სიტყვების სია" />
            <button
              type="button"
              className="h-11 w-fit rounded-lg bg-teal-deep px-4 text-sm font-semibold text-on-dark"
              onClick={() => {
                const parsed = parseWordList(paste);
                if (!parsed.length) return;
                setEntries([...entries.filter((entry) => str(entry.es).trim()), ...parsed]);
                setPaste("");
                setPanel("");
              }}
            >
              დამატება ({parseWordList(paste).length})
            </button>
          </div>
        ) : null}
        {panel === "glossary" ? (
          <div className="flex flex-col gap-2 rounded-xl bg-paper-deep p-3">
            <MiniInput label="ძებნა ლექსიკონში" placeholder="მოძებნე: café, cuenta, quiero…" value={query} onChange={(value) => void search(value)} />
            <ul className="flex flex-col gap-1">
              {results.map((item) => {
                const exists = entries.some((entry) => [str(entry.article), str(entry.es)].filter(Boolean).join(" ").toLowerCase() === item.es.toLowerCase());
                return (
                  <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-sm">
                    <span><b lang="es">{item.es}</b> · {item.ka}{item.en ? ` · ${item.en}` : ""}</span>
                    <button
                      type="button"
                      disabled={exists}
                      className="h-9 rounded-lg px-3 font-semibold text-teal-deep disabled:text-ink-muted"
                      onClick={() => {
                        const split = splitArticle(item.es);
                        setEntries([...entries.filter((entry) => str(entry.es).trim()), { ...(split.article ? { article: split.article } : {}), es: split.es, ka: item.ka, ...(item.en ? { en: item.en } : {}) }]);
                      }}
                    >
                      {exists ? "უკვე არის" : "+ დამატება"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <ol className="flex flex-col gap-2">
          {entries.map((entry, index) => {
            const expanded = open === index;
            const extras = [str(entry.exampleEs) && "მაგალითი", entry.image && "სურათი", entry.audio && "აუდიო"].filter(Boolean);
            return (
              <li key={index} className="rounded-xl border-[1.5px] border-line bg-paper p-2">
                <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                  <span className="w-6 shrink-0 text-center text-sm font-semibold text-ink-muted">{index + 1}</span>
                  <select
                    aria-label={`სიტყვა ${index + 1}: არტიკლი`}
                    value={str(entry.article)}
                    onChange={(event) => setEntries(replaceAt(entries, index, { ...entry, article: event.target.value }))}
                    className={`${miniField} w-20 shrink-0 px-2`}
                  >
                    {ARTICLES.map((article) => <option key={article} value={article}>{article || "—"}</option>)}
                  </select>
                  <MiniInput label={`სიტყვა ${index + 1}: ესპანურად`} placeholder="café" lang="es" value={str(entry.es)} onChange={(es) => setEntries(replaceAt(entries, index, { ...entry, es }))} className="flex-1 font-semibold" />
                  <MiniInput label={`სიტყვა ${index + 1}: ქართულად`} placeholder="ყავა" value={str(entry.ka)} onChange={(ka) => setEntries(replaceAt(entries, index, { ...entry, ka }))} className="flex-1" />
                  <MiniInput label={`სიტყვა ${index + 1}: ინგლისურად`} placeholder="coffee" lang="en" value={str(entry.en)} onChange={(en) => setEntries(replaceAt(entries, index, { ...entry, en }))} className="flex-1" />
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : index)}
                    className="h-11 shrink-0 rounded-lg px-2 text-sm font-semibold text-teal-deep"
                  >
                    {extras.length ? extras.join(" · ") : "დეტალები"} {expanded ? "▴" : "▾"}
                  </button>
                  <RowTools index={index} count={entries.length} label={`სიტყვა ${index + 1}`} onMove={(direction) => setEntries(move(entries, index, direction))} onRemove={() => setEntries(removeAt(entries, index))} />
                </div>
                {expanded ? (
                  <div className="mt-2 grid gap-3 border-t border-line-soft pt-3 lg:grid-cols-[1fr_1fr]">
                    <div className="flex flex-col gap-2">
                      <MiniInput label="მაგალითი ესპანურად" placeholder="Un café con leche, por favor." lang="es" value={str(entry.exampleEs)} onChange={(exampleEs) => setEntries(replaceAt(entries, index, { ...entry, exampleEs }))} />
                      <MiniInput label="მაგალითი ქართულად" placeholder="ერთი რძიანი ყავა, თუ შეიძლება." value={str(entry.exampleKa)} onChange={(exampleKa) => setEntries(replaceAt(entries, index, { ...entry, exampleKa }))} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MediaSlot kind="image" label="სურათი" value={entry.image} onChange={(image) => setEntries(replaceAt(entries, index, { ...entry, image }))} />
                      <MediaSlot kind="audio" label="გამოთქმა (აუდიო)" value={entry.audio} onChange={(audio) => setEntries(replaceAt(entries, index, { ...entry, audio }))} />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
        <AddButton onClick={() => { setEntries([...entries, { es: "", ka: "" }]); setOpen(null); }}>სიტყვის დამატება</AddButton>
        <div className="flex flex-wrap items-center gap-3 border-t border-line-soft pt-3">
          <button type="button" onClick={() => void saveToGlossary()} className="h-10 text-sm font-semibold text-teal-deep underline decoration-mustard decoration-2 underline-offset-4">
            ახალი სიტყვების შენახვა საერთო ლექსიკონში
          </button>
          {glossaryNote ? <span className="text-sm text-sage-ink">{glossaryNote}</span> : null}
        </div>
      </Section>
    </div>
  );
}

function InfoCardBuilder({ content, onChange }: BuilderProps) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="ბარათები" hint="ატვირთე შენი მზა ბარათები (Canva, Figma, ფოტო) სწორი თანმიმდევრობით. საუკეთესოა ვერტიკალური 9:16, 1080×1920.">
        <ImageStrip label="ბარათი" value={content.pages} onChange={(pages) => onChange({ ...content, pages })} />
      </Section>
      <Section title="ტექსტი" hint="მოსწავლე ხედავს წარწერას ბარათის ქვემოთ. აღწერას კითხულობს ეკრანის წამკითხველი.">
        <TextField label="წარწერა ქვემოთ" hint="(არასავალდებულო)" placeholder="დაიმახსოვრე: la cuenta = ანგარიში" value={str(content.captionKa)} onChange={(captionKa) => onChange({ ...content, captionKa })} />
        <TextField label="რა არის ბარათზე" placeholder="კაფის მენიუ ფასებით: café 1,50 €, té 1,20 €…" rows={2} value={str(content.altKa)} onChange={(altKa) => onChange({ ...content, altKa })} />
      </Section>
    </div>
  );
}

function DialogueTypeBuilder({ content, onChange }: BuilderProps) {
  const context = rec(content.context);
  return (
    <div className="flex flex-col gap-5">
      <Section title="სიტუაცია" hint="ერთი-ორი წინადადება: სად ვართ და ვინ ლაპარაკობს. მოსწავლე ამას დიალოგამდე კითხულობს.">
        <TextField label="ქართულად" placeholder="ანა და ლუკასი კაფეში არიან. ლუკასი შეკვეთას აძლევს." value={str(context.ka)} onChange={(ka) => onChange({ ...content, context: { ...context, ka } })} />
        <TextField label="ესპანურად" hint="(არასავალდებულო)" lang="es" placeholder="En el café" value={str(context.es)} onChange={(es) => onChange({ ...content, context: { ...context, es } })} />
      </Section>
      <Section title="დიალოგი" hint="ესპანური ყოველთვის ჩანს. ინგლისური მოსწავლეს გადამრთველით ეხსნება.">
        <DialogueBuilder value={content} onChange={onChange} />
      </Section>
    </div>
  );
}

function VideoBuilder({ content, onChange }: BuilderProps) {
  const dialogue = rec(content.dialogue);
  const [withText, setWithText] = useState(recs(dialogue.lines).length > 0);
  return (
    <div className="flex flex-col gap-5">
      <Section title="ვიდეო" hint="ატვირთე ვიდეო პირდაპირ აქ. დიდ ფაილს რამდენიმე წუთი სჭირდება.">
        <MediaSlot kind="video" label="ვიდეო ფაილი" value={content.video} onChange={(video) => onChange({ ...content, video })} />
        <TextField label="რას ვუყურებთ" hint="(ჩანს ვიდეოს ზემოთ)" placeholder="უყურე, როგორ უკვეთავს ლუკასი ყავას. მიაქციე ყურადღება „quiero“-ს." rows={2} value={str(content.introKa)} onChange={(introKa) => onChange({ ...content, introKa })} />
      </Section>
      <Section
        title="დიალოგის ტექსტი ვიდეოს ქვემოთ"
        hint="არასავალდებულო, მაგრამ ძალიან ეხმარება: მოსწავლე კითხულობს, რასაც ისმენს."
        action={<Checkbox id="video-text" checked={withText} onCheckedChange={setWithText}>ტექსტის დამატება</Checkbox>}
      >
        {withText ? <DialogueBuilder value={dialogue} fullAudio={false} onChange={(next) => onChange({ ...content, dialogue: next })} /> : null}
      </Section>
    </div>
  );
}

function AudioBuilder({ content, onChange }: BuilderProps) {
  const transcript = rec(content.transcript);
  return (
    <div className="flex flex-col gap-5">
      <Section title="ჩანაწერი" hint="MP3 ან ტელეფონის ხმოვანი ჩანაწერი (M4A).">
        <MediaSlot kind="audio" label="აუდიო ფაილი" value={content.audio} onChange={(audio) => onChange({ ...content, audio })} />
        <TextField label="დავალება მოსმენამდე" placeholder="მოუსმინე და იპოვე: რას უკვეთავს ლაურა?" rows={2} value={str(content.introKa)} onChange={(introKa) => onChange({ ...content, introKa })} />
      </Section>
      <Section title="ტრანსკრიფცია" hint="მოსწავლე ხედავს ჩანაწერის ქვემოთ, ინგლისურით გადამრთველზე.">
        <DialogueBuilder value={transcript} fullAudio={false} onChange={(next) => onChange({ ...content, transcript: next })} />
      </Section>
    </div>
  );
}

function StoryBuilder({ content, onChange }: BuilderProps) {
  const place = rec(content.place);
  const dialogue = rec(content.dialogue);
  return (
    <div className="flex flex-col gap-5">
      <Section title="1 · სცენა" hint="სად ვართ და რა ხდება. ეს ისტორიის „გარეკანია“.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="ადგილი ესპანურად" lang="es" placeholder="Barcelona, la Rambla" value={str(place.es)} onChange={(es) => onChange({ ...content, place: { ...place, es } })} />
          <TextField label="ადგილი ქართულად" placeholder="ბარსელონა" value={str(place.ka)} onChange={(ka) => onChange({ ...content, place: { ...place, ka } })} />
        </div>
        <TextField label="კონტექსტი" placeholder="ანა პირველად ჩამოვიდა ბარსელონაში და გზას კითხულობს…" rows={3} value={str(content.contextKa)} onChange={(contextKa) => onChange({ ...content, contextKa })} />
        <MediaSlot kind="image" label="სცენის სურათი (არასავალდებულო)" value={content.image} onChange={(image) => onChange({ ...content, image })} />
      </Section>
      <Section title="2 · დიალოგი">
        <DialogueBuilder value={dialogue} onChange={(next) => onChange({ ...content, dialogue: next })} />
      </Section>
      <Section title="3 · რა ვისწავლეთ" hint={RICH_HINT}>
        <TextField label="გრამატიკის შენიშვნა" placeholder="**soy** = მე ვარ. **es** = ის არის." rows={3} value={str(content.grammarKa)} onChange={(grammarKa) => onChange({ ...content, grammarKa })} />
        <TextField label="კულტურის შენიშვნა" placeholder="ესპანეთში ყავას ხშირად დგომით სვამენ ბართან…" rows={3} value={str(content.cultureKa)} onChange={(cultureKa) => onChange({ ...content, cultureKa })} />
      </Section>
    </div>
  );
}

const PERSONS = ["yo", "tú", "él / ella / usted", "nosotros", "vosotros", "ellos / ellas / ustedes"];

function GrammarBuilder({ content, onChange }: BuilderProps) {
  const examples = recs(content.examples);
  const mistakes = recs(content.mistakes);
  const table = rec(content.table);
  const headers = arr(table.headers).map(str);
  const rows = arr(table.rows).map((row) => arr(row).map(str));
  const hasTable = headers.length > 0;

  function setTable(next: { headers: string[]; rows: string[][]; caption?: string } | undefined) {
    onChange({ ...content, table: next });
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="1 · წესი" hint="ერთი წინადადება — რა უნდა დაიმახსოვროს მოსწავლემ. დანარჩენი ახსნა ქვემოთ.">
        <TextField label="სათაური ესპანურად" lang="es" placeholder="Querer" value={str(content.titleEs)} onChange={(titleEs) => onChange({ ...content, titleEs })} />
        <TextField label="წესი ერთ ხაზად" placeholder="querer = მინდა. როცა რამეს უკვეთავ: Quiero un café." value={str(content.ruleKa)} onChange={(ruleKa) => onChange({ ...content, ruleKa })} />
        <TextField label="ახსნა" hint={RICH_HINT} rows={5} placeholder={"querer-ში **e** იცვლება **ie**-თი: quiero, quieres, quiere.\n\nnosotros და vosotros არ იცვლება: queremos, queréis."} value={str(content.body)} onChange={(body) => onChange({ ...content, body })} />
      </Section>

      <Section
        title="2 · ცხრილი"
        hint="უღლება, არტიკლები, შედარება — რაც ცხრილში უკეთ ჩანს."
        action={
          hasTable ? (
            <button type="button" className="h-10 px-2 text-sm font-semibold text-burgundy" onClick={() => setTable(undefined)}>ცხრილის წაშლა</button>
          ) : (
            <div className="flex gap-2">
              <button type="button" className="h-10 rounded-lg border-[1.5px] border-teal-deep px-3 text-sm font-semibold text-teal-deep" onClick={() => setTable({ headers: ["", str(content.titleEs) || "ზმნა", "ქართულად"], rows: PERSONS.map((person) => [person, "", ""]) })}>
                უღლების ცხრილი
              </button>
              <button type="button" className="h-10 rounded-lg border-[1.5px] border-sand px-3 text-sm font-semibold" onClick={() => setTable({ headers: ["", ""], rows: [["", ""], ["", ""]] })}>
                ცარიელი
              </button>
            </div>
          )
        }
      >
        {hasTable ? (
          <div className="flex flex-col gap-2">
            <MiniInput label="ცხრილის წარწერა" placeholder="წარწერა (არასავალდებულო)" value={str(table.caption)} onChange={(caption) => setTable({ headers, rows, caption })} />
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-1">
                <thead>
                  <tr>
                    {headers.map((header, column) => (
                      <th key={column} className="min-w-32">
                        <div className="flex items-center gap-1">
                          <MiniInput label={`სვეტი ${column + 1}: სათაური`} placeholder="სათაური" value={header} onChange={(value) => setTable({ headers: replaceAt(headers, column, value), rows, caption: str(table.caption) })} className="font-bold" />
                          {headers.length > 1 ? (
                            <button type="button" aria-label={`სვეტი ${column + 1}: წაშლა`} className="size-9 shrink-0 text-ink-muted hover:text-burgundy" onClick={() => setTable({ headers: removeAt(headers, column), rows: rows.map((row) => removeAt(row, column)), caption: str(table.caption) })}>×</button>
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {headers.map((_, column) => (
                        <td key={column}>
                          <MiniInput label={`ხაზი ${rowIndex + 1}, სვეტი ${column + 1}`} placeholder="" value={row[column] ?? ""} onChange={(value) => setTable({ headers, rows: replaceAt(rows, rowIndex, replaceAt(headers.map((__, index) => row[index] ?? ""), column, value)), caption: str(table.caption) })} />
                        </td>
                      ))}
                      <td className="w-11">
                        <button type="button" aria-label={`ხაზი ${rowIndex + 1}: წაშლა`} className="size-11 text-ink-muted hover:text-burgundy" onClick={() => setTable({ headers, rows: removeAt(rows, rowIndex), caption: str(table.caption) })}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button type="button" className="h-10 text-sm font-semibold text-teal-deep" onClick={() => setTable({ headers, rows: [...rows, headers.map(() => "")], caption: str(table.caption) })}>+ ხაზი</button>
              <button type="button" className="h-10 text-sm font-semibold text-teal-deep" onClick={() => setTable({ headers: [...headers, ""], rows: rows.map((row) => [...row, ""]), caption: str(table.caption) })}>+ სვეტი</button>
            </div>
          </div>
        ) : null}
      </Section>

      <Section title="3 · მაგალითები" hint="რეალური წინადადებები ამ გაკვეთილის სიტუაციიდან. ქართული თარგმანი ჩანს ქვემოთ.">
        <ol className="flex flex-col gap-2">
          {examples.map((example, index) => (
            <li key={index} className="flex items-center gap-2 rounded-xl border-[1.5px] border-line bg-paper p-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <MiniInput label={`მაგალითი ${index + 1}: ესპანურად`} placeholder="Quiero un café con leche." lang="es" value={str(example.es)} onChange={(es) => onChange({ ...content, examples: replaceAt(examples, index, { ...example, es }) })} />
                <MiniInput label={`მაგალითი ${index + 1}: ქართულად`} placeholder="მინდა რძიანი ყავა." value={str(example.ka)} onChange={(ka) => onChange({ ...content, examples: replaceAt(examples, index, { ...example, ka }) })} />
              </div>
              <RowTools index={index} count={examples.length} label={`მაგალითი ${index + 1}`} onMove={(direction) => onChange({ ...content, examples: move(examples, index, direction) })} onRemove={() => onChange({ ...content, examples: removeAt(examples, index) })} />
            </li>
          ))}
        </ol>
        <AddButton onClick={() => onChange({ ...content, examples: [...examples, { es: "", ka: "" }] })}>მაგალითის დამატება</AddButton>
      </Section>

      <Section title="4 · ხშირი შეცდომები და რჩევა" hint="ქართველ მოსწავლეებს ტიპური შეცდომები აქვთ — აჩვენე „არა / კი“ წყვილებით.">
        <ol className="flex flex-col gap-2">
          {mistakes.map((mistake, index) => (
            <li key={index} className="flex items-center gap-2 rounded-xl border-[1.5px] border-line bg-paper p-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-3">
                <MiniInput label={`შეცდომა ${index + 1}: არასწორი`} placeholder="✗ Yo quero" lang="es" value={str(mistake.wrong)} onChange={(wrong) => onChange({ ...content, mistakes: replaceAt(mistakes, index, { ...mistake, wrong }) })} />
                <MiniInput label={`შეცდომა ${index + 1}: სწორი`} placeholder="✓ Yo quiero" lang="es" value={str(mistake.right)} onChange={(right) => onChange({ ...content, mistakes: replaceAt(mistakes, index, { ...mistake, right }) })} />
                <MiniInput label={`შეცდომა ${index + 1}: რატომ`} placeholder="e → ie" value={str(mistake.noteKa)} onChange={(noteKa) => onChange({ ...content, mistakes: replaceAt(mistakes, index, { ...mistake, noteKa }) })} />
              </div>
              <RowTools index={index} count={mistakes.length} label={`შეცდომა ${index + 1}`} onMove={(direction) => onChange({ ...content, mistakes: move(mistakes, index, direction) })} onRemove={() => onChange({ ...content, mistakes: removeAt(mistakes, index) })} />
            </li>
          ))}
        </ol>
        <AddButton onClick={() => onChange({ ...content, mistakes: [...mistakes, { wrong: "", right: "", noteKa: "" }] })}>შეცდომის დამატება</AddButton>
        <TextField label="რჩევა ნინასგან" placeholder="კაფეში „quiero“-ს ნაცვლად უფრო თავაზიანია „quería“ ან „¿me pones…?“" rows={2} value={str(content.tipKa)} onChange={(tipKa) => onChange({ ...content, tipKa })} />
        <MediaSlot kind="image" label="სურათი ან სქემა (არასავალდებულო)" value={content.image} onChange={(image) => onChange({ ...content, image })} />
      </Section>
    </div>
  );
}

function PronunciationBuilder({ content, onChange }: BuilderProps) {
  const items = recs(content.items);
  const examples = arr(content.examples).map(str);
  const [word, setWord] = useState("");
  return (
    <div className="flex flex-col gap-5">
      <Section title="ბგერები" hint="ასო ან ასოთა წყვილი (პატარა ასოებით). თითოეულს — აუდიო, მინიშნება და ერთი მაგალითი.">
        <ol className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={index} className="flex flex-col gap-3 rounded-xl border-[1.5px] border-line bg-paper p-3 sm:flex-row sm:items-start">
              <div className="flex items-center gap-3 sm:w-40 sm:flex-col sm:items-start">
                <span className="flex size-16 shrink-0 items-center justify-center bg-pronunciation text-2xl text-navy lowercase" style={{ borderRadius: "46% 54% 42% 58% / 48% 42% 58% 52%" }}>
                  {str(item.grapheme).toLowerCase() || "?"}
                </span>
                <MiniInput label={`ბგერა ${index + 1}`} placeholder="c, z, ll…" lang="es" value={str(item.grapheme)} onChange={(grapheme) => onChange({ ...content, items: replaceAt(items, index, { ...item, grapheme: grapheme.toLowerCase() }) })} />
              </div>
              <div className="grid flex-1 gap-2">
                <MiniInput label={`ბგერა ${index + 1}: მინიშნება`} placeholder="როგორც ინგლისური „th“ სიტყვაში think" value={str(item.hintKa)} onChange={(hintKa) => onChange({ ...content, items: replaceAt(items, index, { ...item, hintKa }) })} />
                <MiniInput label={`ბგერა ${index + 1}: მაგალითი`} placeholder="cerveza" lang="es" value={str(item.example)} onChange={(example) => onChange({ ...content, items: replaceAt(items, index, { ...item, example }) })} />
              </div>
              <div className="flex items-center gap-1">
                <MediaSlot compact kind="audio" label={`ბგერა ${index + 1}: აუდიო`} value={item.audio} onChange={(audio) => onChange({ ...content, items: replaceAt(items, index, { ...item, audio }) })} />
                <RowTools index={index} count={items.length} label={`ბგერა ${index + 1}`} onMove={(direction) => onChange({ ...content, items: move(items, index, direction) })} onRemove={() => onChange({ ...content, items: removeAt(items, index) })} />
              </div>
            </li>
          ))}
        </ol>
        <AddButton onClick={() => onChange({ ...content, items: [...items, { grapheme: "", hintKa: "", example: "" }] })}>ბგერის დამატება</AddButton>
      </Section>
      <Section title="სავარჯიშო სიტყვები" hint="სიტყვები, რომლებიც მოსწავლემ ხმამაღლა უნდა წაიკითხოს.">
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <span key={`${example}-${index}`} className="inline-flex h-10 items-center gap-1 rounded-full border-[1.5px] border-sand bg-card pr-1 pl-4 text-[15px]" lang="es">
              {example}
              <button type="button" aria-label={`${example}: წაშლა`} className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:text-burgundy" onClick={() => onChange({ ...content, examples: removeAt(examples, index) })}>×</button>
            </span>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const added = word.split(",").map((part) => part.trim()).filter(Boolean);
            if (!added.length) return;
            onChange({ ...content, examples: [...examples, ...added] });
            setWord("");
          }}
        >
          <MiniInput label="ახალი სიტყვა" placeholder="zumo, cena, cielo (მძიმით რამდენიმე)" lang="es" value={word} onChange={setWord} className="max-w-md" />
          <button type="submit" className="h-11 rounded-lg border-[1.5px] border-teal-deep px-3 text-sm font-semibold text-teal-deep">დამატება</button>
        </form>
        <TextField label="რჩევა" hint="(არასავალდებულო)" placeholder="ლათინურ ამერიკაში c და z „ს“-ს ჰგავს — ორივე სწორია." rows={2} value={str(content.tipKa)} onChange={(tipKa) => onChange({ ...content, tipKa })} />
      </Section>
    </div>
  );
}

function DocumentBuilder({ content, onChange }: BuilderProps) {
  return (
    <Section title="ფაილი" hint="PDF ჩანს პირდაპირ გვერდზე. Word ფაილი მხოლოდ ჩამოტვირთვით იხსნება — სჯობს PDF-ად შეინახო.">
      <MediaSlot kind="document" label="დოკუმენტი" value={content.file} onChange={(file) => onChange({ ...content, file })} />
      <TextField label="შენიშვნა მოსწავლისთვის" placeholder="დაბეჭდე და შეავსე ხელით, მომდევნო გაკვეთილზე ერთად შევამოწმებთ." rows={2} value={str(content.noteKa)} onChange={(noteKa) => onChange({ ...content, noteKa })} />
      <Checkbox id="allow-download" checked={content.allowDownload !== false} onCheckedChange={(allowDownload) => onChange({ ...content, allowDownload })}>
        მოსწავლეს შეუძლია ჩამოტვირთვა
      </Checkbox>
    </Section>
  );
}

function ReaderBuilder({ content, onChange }: BuilderProps) {
  const glossary = recs(content.glossary);
  return (
    <div className="flex flex-col gap-5">
      <Section title="ტექსტი" hint={`აკრიფე ან ჩასვი ტექსტი. ${RICH_HINT}`}>
        <TextField label="ტექსტი ესპანურად" lang="es" rows={10} placeholder="Ana vive en Barcelona. Cada mañana toma un café…" value={str(content.body)} onChange={(body) => onChange({ ...content, body })} />
        <MediaSlot kind="document" label="ან PDF (არასავალდებულო)" value={content.file} onChange={(file) => onChange({ ...content, file })} />
      </Section>
      <Section title="ლექსიკონი ტექსტის ბოლოს" hint="ახალი სიტყვები, რომლებიც მოსწავლემ შეიძლება არ იცოდეს.">
        <ol className="flex flex-col gap-2">
          {glossary.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <MiniInput label={`სიტყვა ${index + 1}: ესპანურად`} lang="es" value={str(item.es)} onChange={(es) => onChange({ ...content, glossary: replaceAt(glossary, index, { ...item, es }) })} />
                <MiniInput label={`სიტყვა ${index + 1}: ქართულად`} value={str(item.ka)} onChange={(ka) => onChange({ ...content, glossary: replaceAt(glossary, index, { ...item, ka }) })} />
              </div>
              <RowTools index={index} count={glossary.length} label={`სიტყვა ${index + 1}`} onMove={(direction) => onChange({ ...content, glossary: move(glossary, index, direction) })} onRemove={() => onChange({ ...content, glossary: removeAt(glossary, index) })} />
            </li>
          ))}
        </ol>
        <AddButton onClick={() => onChange({ ...content, glossary: [...glossary, { es: "", ka: "" }] })}>სიტყვის დამატება</AddButton>
      </Section>
    </div>
  );
}

function EmbedBuilder({ content, onChange }: BuilderProps) {
  return (
    <Section title="გადმოტანილი HTML სავარჯიშო" hint="ეს ტიპი მხოლოდ ძველი სავარჯიშოებისთვისაა. ახალისთვის აირჩიე ინტერაქტიული შაბლონი.">
      <TextField label="მთავარი ფაილი" value={str(content.entry)} onChange={(entry) => onChange({ ...content, entry })} />
      <TextField label="სიმაღლე (px)" value={String(typeof content.height === "number" ? content.height : "")} onChange={(value) => onChange({ ...content, height: Number(value) || undefined })} />
      <Checkbox id="embed-completion" checked={content.reportsCompletion === true} onCheckedChange={(reportsCompletion) => onChange({ ...content, reportsCompletion })}>
        სავარჯიშო თვითონ აგზავნის დასრულებას
      </Checkbox>
    </Section>
  );
}
