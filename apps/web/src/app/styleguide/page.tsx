import { notFound } from "next/navigation";
import {
  Accordion,
  ArchMask,
  BottomSheet,
  BrushCircle,
  BrushUnderline,
  Button,
  Checkbox,
  ChoiceChip,
  EmptyState,
  FeatureCard,
  Field,
  Icon,
  Input,
  LessonCard,
  Logo,
  MaterialRow,
  Modal,
  OrganicMask,
  PinnedNote,
  SectionWave,
  Skeleton,
  Stamp,
  StatusChip,
  Textarea,
  Toast,
  type IconName,
} from "@nina/ui";

const icons: IconName[] = [
  "card",
  "vocabulary",
  "dialogue",
  "video",
  "audio",
  "document",
  "exercise",
  "pronunciation",
  "grammar",
  "homework",
  "game",
  "checkpoint",
  "home",
  "lessons",
  "materials",
  "progress",
  "restart",
  "download",
  "gift",
  "search",
  "user",
];

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-16 px-5 py-16 md:px-20">
      <header className="flex items-center gap-6">
        <Logo />
        <div>
          <p className="font-hand text-3xl text-teal-deep">Guía de estilo</p>
          <h1 className="text-5xl leading-tight font-bold">Nina Design System</h1>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">ღილაკები</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="l">დაჯავშნე საცდელი გაკვეთილი</Button>
          <Button>დაჯავშნე საცდელი გაკვეთილი</Button>
          <Button size="s">საცდელი გაკვეთილი</Button>
          <Button variant="burgundy">დაჯავშნე საცდელი გაკვეთილი</Button>
          <Button variant="outline">შესვლა</Button>
          <Button variant="text">როგორ მიმდინარეობს გაკვეთილი</Button>
          <Button disabled>დაჯავშნე საცდელი გაკვეთილი</Button>
          <Button loading>იგზავნება…</Button>
        </div>
      </section>

      <section className="grid max-w-xl gap-4">
        <h2 className="text-2xl font-bold">ფორმა</h2>
        <Field id="name" label="სახელი">
          <Input id="name" defaultValue="მარიამი" />
        </Field>
        <Field id="note" label="შენიშვნა" hint="(არასავალდებულო)">
          <Textarea id="note" defaultValue="" />
        </Field>
        <Field id="phone" label="ტელეფონი" error="ნომერი არასრულია">
          <Input id="phone" invalid defaultValue="555" />
        </Field>
        <div className="flex flex-wrap gap-2">
          <ChoiceChip pressed>WhatsApp</ChoiceChip>
          <ChoiceChip pressed={false}>Telegram</ChoiceChip>
        </div>
        <Checkbox id="consent" checked>
          ვეთანხმები, რომ ნინამ ჩემი მონაცემები გამოიყენოს დასაკავშირებლად
        </Checkbox>
      </section>

      <section className="flex flex-wrap gap-2">
        <h2 className="w-full text-2xl font-bold">სტატუსი</h2>
        <StatusChip status="new" />
        <StatusChip status="progress" />
        <StatusChip status="done" />
        <StatusChip status="homework" />
        <StatusChip status="personal" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <FeatureCard
          number="01"
          title="ესპანური ნულიდან"
          text="წინასწარი ცოდნა არ გჭირდება."
          tint="bg-teal-soft text-teal-deep"
          icon="user"
        />
        <FeatureCard
          number="06"
          title="Poco a Poco"
          text="ყოველი ახალი აგური წინაზე დგას."
          tint="bg-navy text-on-dark"
          icon="progress"
          inverted
        />
        <LessonCard number="6" date="26 სექ." title="En el café — შეკვეთა" progress="7 / 12" status="progress" />
        <div className="rounded-2xl border-[1.5px] border-line bg-card">
          <MaterialRow icon="video" title="Ana y Lucas en el café" meta="ვიდეო-დიალოგი · 2:10" ring="done" />
          <MaterialRow icon="exercise" title="ააწყე წინადადება" meta="8 ნაბიჯი · 3/8" ring="opened" />
          <MaterialRow icon="document" title="La carta del café" meta="PDF · 2 გვ." ring="empty" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">ხატულები</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {icons.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-xl bg-card py-4 text-teal-deep">
              <Icon name={name} width={28} height={28} />
              <span className="text-xs">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-end gap-8">
        <p className="text-4xl font-bold">
          <BrushUnderline>Español</BrushUnderline>
        </p>
        <BrushCircle />
        <Stamp kicker="¡Hola!" label="ესპანური" highlighted />
        <PinnedNote title="¡Viva el error!" text="თქვი, რაც თავში მოგივა." />
        <OrganicMask className="h-40 w-32 bg-sand-soft" >
          <div className="h-full w-full bg-teal-soft" />
        </OrganicMask>
        <ArchMask className="h-40 w-32">
          <div className="h-full w-full bg-mustard-soft" />
        </ArchMask>
      </section>

      <section className="overflow-hidden rounded-2xl bg-navy">
        <SectionWave />
        <p className="px-8 py-6 text-on-dark">ნავი სექციის ტალღა</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Accordion
          items={[
            { id: "q1", question: "ესპანური საერთოდ არ ვიცი. შეიძლება?", answer: "რა თქმა უნდა. კურსი ნულიდან იწყება." },
            { id: "q2", question: "რა არის კაბინეტში?", answer: "შენი გაკვეთილები და თითოეულის მასალები." },
          ]}
        />
        <div className="flex flex-col items-start gap-4">
          <Modal trigger={<Button>მოდალი</Button>} title="¡Hola!">
            <p className="mt-3 text-ink-muted">საცდელი გაკვეთილის ფორმა აქ გაიხსნება.</p>
          </Modal>
          <BottomSheet trigger={<Button variant="outline">ფურცელი</Button>} title="¡Hola!">
            <p className="mt-3 text-ink-muted">მობილურის ფურცელი.</p>
          </BottomSheet>
          <Toast>მადლობა! ნინა მალე დაგიკავშირდება</Toast>
          <Skeleton className="h-16 w-full" />
          <EmptyState title="¡Bienvenida!" text="შენი პირველი გაკვეთილი ნინასთან მალე დაიწყება." />
        </div>
      </section>
    </main>
  );
}
