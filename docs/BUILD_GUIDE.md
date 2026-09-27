# NINA – TU PROFE DE ESPAÑOL
# Build Guide for Cursor (single source of truth)

> **Who reads this:** Cursor (and any developer). Read this whole file before writing code.
> **What it covers:** the public landing page, the student cabinet, the admin panel, the backend on Railway, media handling, the AI assistant, and the reserved Social Studio module.
> **Precedence when sources disagree:**
> 1. This guide (architecture, data model, contracts, decisions)
> 2. `design/handoff/screens/*.html` + `design/handoff/screenshots/*` (visual truth: exact spacing, colors, copy)
> 3. `design/handoff/docs/*.md` (landing-spec, cabinet-spec, components, assets)
> 4. `docs/brief/Nina_Claude_Design_Brief.md` and `docs/brief/nina-design-decisions-log.md` (background, reasoning)
>
> If this guide says "see screen X", open that HTML **and** its screenshot, and match them.

---

## TABLE OF CONTENTS

0. Repo setup: where every file goes
1. Product in one page
2. Final decisions (locked)
3. Brand and design system (summary for code)
4. System architecture
5. Tech stack
6. Monorepo layout
7. Data model (Prisma schema)
8. Content contracts: material types and exercises
9. API design
10. Auth, roles, security
11. Media storage and processing (Railway volume)
12. Landing page: build spec
13. Booking flow and leads
14. Student cabinet: build spec
15. Admin panel: build spec (not designed, build from this)
16. AI Assistant (admin agent chat)
17. Social Studio (reserved module)
18. Background jobs
19. Notifications and email
20. Copy, i18n, dates
21. SEO, analytics, accessibility, performance
22. Environments, deployment, env vars
23. Testing and visual QA
24. Seed data and content migration
25. Build phases with ready-to-paste Cursor prompts
26. Open items and placeholders
27. Appendix: UI label glossary (Georgian)

---

## 0. REPO SETUP: WHERE EVERY FILE GOES

### 0.1 What you have
| Item | What it is |
|---|---|
| `nina-design-handoff.zip` | Output of Claude Design: `screens/`, `screenshots/`, `tokens/`, `assets/`, `docs/`, `.cursor/rules/nina-design-system.mdc`, `source/` |
| `nina-original-illustrations.zip` | Original full-resolution illustrations (PNG, ~2.5 MB each) |
| 3 exported canvas HTML bundles | Landing canvas, cabinet canvas, design system canvas (the same content as `screens/`, bundled) |
| `Nina_Claude_Design_Brief.md` | The design brief |
| `nina-design-decisions-log.md` | What the designer decided and why |
| `NINA_BUILD_GUIDE.md` | This file |
| `nina-architecture.mdc` | Cursor rule for architecture (delivered alongside this guide) |

### 0.2 Target repo tree (after setup, before any code)
```
nina/                                   ← repo root
├─ .cursor/
│  └─ rules/
│     ├─ nina-design-system.mdc         ← COPY from handoff zip (.cursor/rules/)
│     └─ nina-architecture.mdc          ← COPY the file delivered with this guide
├─ design/                              ← READ-ONLY reference. Never imported by app code.
│  ├─ handoff/                          ← UNZIP nina-design-handoff.zip here, as is
│  │  ├─ screens/                       (24 HTML reference screens)
│  │  ├─ screenshots/                   (full-page JPGs, used for visual QA)
│  │  ├─ tokens/                        (tokens.css, tailwind configs, tokens.json)
│  │  ├─ assets/                        (logo, illustrations, spots, fonts)
│  │  ├─ docs/                          (landing-spec, cabinet-spec, components, assets, open-items, CURSOR_PROMPTS)
│  │  └─ source/                        (raw canvas files; reference only)
│  ├─ canvas-exports/                   ← the 3 bundled canvas HTML files (optional, reference)
│  └─ originals/                        ← UNZIP nina-original-illustrations.zip (use Git LFS, see 0.3)
├─ docs/
│  ├─ BUILD_GUIDE.md                    ← THIS FILE (rename from NINA_BUILD_GUIDE.md)
│  └─ brief/
│     ├─ Nina_Claude_Design_Brief.md
│     └─ nina-design-decisions-log.md
├─ apps/                                (created in Phase 0)
├─ packages/                            (created in Phase 0)
└─ ...
```

### 0.3 Rules for these folders
- `design/**` is **reference only**. App code never imports from it. When an asset is needed in production, **copy** it into the app (`apps/web/public/...` or `apps/web/src/fonts/...`) during Phase 1.
- Keep `.cursor/rules/nina-design-system.mdc` exactly as delivered. It is always applied.
- `design/originals/` is heavy. Either track it with **Git LFS** (`git lfs track "design/originals/**"`) or leave it out of git (add to `.gitignore`) and keep the zip in a shared drive. The webp versions in `design/handoff/assets/` are what the site uses.
- Add `design/handoff/screenshots/**` and `design/originals/**` to `.cursorignore` so Cursor does not index large binaries; keep `screens/` and `docs/` indexed.

### 0.4 Asset copying map (done in Phase 1)
| From `design/handoff/assets/` | To |
|---|---|
| logo files | `apps/web/public/brand/` |
| illustrations (webp) | `apps/web/public/illustrations/` |
| transparent spot poses (webp) | `apps/web/public/illustrations/spots/` |
| fonts (woff2) + OFL licences | `apps/web/src/fonts/` (loaded with `next/font/local`) |
| `tokens/tailwind-v4-theme.css` + `tokens/tokens.css` | `packages/ui/src/styles/` (imported by web app) |
| `tokens/tokens.json` | `packages/ui/src/tokens.json` (used by admin theme and Social Studio templates) |

---

## 1. PRODUCT IN ONE PAGE

**Nina – Tu Profe de Español** is an independent Spanish teacher in Georgia teaching adults **from zero (A1)** in **individual online lessons** (75 min, 30 GEL, first 2 lessons free). Her method teaches through **stories, situations and recurring characters** (სიუჟეტები: Ana, Laura, Lucas, Nina) at a step-by-step pace (**Poco a Poco**), with purpose-built visual materials.

The platform has three parts:

1. **Public landing page** (Georgian, with Spanish accents): sells the course, introduces Nina and her world, and collects trial-lesson requests through a **booking form** that creates a **Lead**.
2. **Student cabinet** (after login): *"This is my Spanish journey."* A student sees **their lessons**; inside each lesson are **the materials** for it (cards, vocabulary, dialogues, video, audio, documents, pronunciation, interactive exercises, homework). The student sees **only** what Nina marked as ready.
3. **Admin panel** (Nina): a central **content library** of reusable materials, curriculum, students, per-student lessons, assignments, progress, leads, an **exercise builder**, an **AI assistant chat** that drafts exercises/materials from Nina's prompts, and later a **Social Studio** that drafts social-media posts.

**The big idea:** not "lessons + PDFs", but Nina + a structured Spanish world + a personalized cabinet + reusable story-based content.
**North star for every UI decision:** *"This feels like Nina's own beautiful, intelligent, playful Spanish world."* Never "an LMS", never "a kids' app".

---

## 2. FINAL DECISIONS (LOCKED)

### 2.1 From the owner
| # | Decision |
|---|---|
| 1 | Brand name: **Nina – Tu Profe de Español**. Signature: *Nina - Tu Profe De Español* (italic). |
| 2 | Palette: **Nina Colors** (`#196166 #0A414F #841B22 #F5B246 #D0AC84 #5B8A81`) on paper `#FCF7E6`. Logo keeps its own colors. |
| 3 | Fonts: **Montserrat** (Latin), **FiraGO** (Georgian, via `unicode-range`), **Caveat** (short Spanish accents only). |
| 4 | Dialogues: **Spanish + English**. |
| 5 | Structure: **Lesson → Materials**. Materials live once in a library and are reused. |
| 6 | Offer: 75 min · 30 GEL · online · 1:1. **First 2 lessons are a gift**; paid from the 3rd. |
| 7 | Illustrations: no sneaker/device brand logos; Spanish flag allowed as a scene detail only; never show the textbook name "Nuevo Sueña". |
| 8 | Logo: use the supplied file exactly. Never redraw or recolor. On dark backgrounds, place it on a cream circle. |
| 9 | Nina's own Spanish level is **not** mentioned anywhere. |
| 10 | Hero leads with the brand: **Nina – Tu Profe de Español**. |
| 11 | Booking: a **form** → Lead in admin. |
| 12 | Logged-in exercises have **no name entry**. Exercises are created in admin, manually or by the AI agent. |
| 13 | Hosting: frontend on **Vercel**, backend + Postgres + file **volume** on **Railway**. |
| 14 | Files handled: **images, documents (PDF/DOC/DOCX), video, audio (MP3 and others)**. |
| 15 | Admin panel is not designed; build it from Section 15 using the same tokens, in the Calm tone. |

### 2.2 Additions from the design phase (accepted, build them)
| Topic | Build this |
|---|---|
| Dialogue translation | An explicit **EN toggle button** (not hover). Works on touch. |
| Booking "days and times" | **Multi-select day chips** (ორშ–კვ) + **single time-of-day** choice (დილა / დღე / საღამო). |
| Landing H2 | **46px** on landing; cabinet keeps 36px. Hero "Nina" 120px desktop / 72px mobile. |
| Rules | Each of Nina's 4 rules has a Spanish hand-lettered title (¡Nos divertimos! · Con calma · ¡Viva el error! · ¡Desde el día uno!). |
| Lesson materials | Grouped under **Nina's own group headings** (e.g. "1 · ვხედავთ სიტუაციას"). Needs an optional `groupLabel` on each lesson item. |
| Mobile header CTA | Shortened to **„საცდელი გაკვეთილი"**; the full text is used everywhere else. |
| Mobile gift section | Uses the **walking Nina** illustration (not the stone wall, which is the mobile hero). |
| Extra tokens | Tints, surfaces, hover shades, status inks (see 3.1). |
| Completion rule | Passive materials: student taps "mark as done". Exercises/games/checkpoints: complete automatically. Opening sets "opened". |
| Status visuals | Lesson: new = teal-soft · in progress = mustard-soft · done = sage. Material: empty ring → half ring → sage check. |

---

## 3. BRAND AND DESIGN SYSTEM (SUMMARY FOR CODE)

The full visual system is in `design/handoff/screens/design-system.html` and `design/handoff/tokens/`. **Use the token files; never hardcode hex values in components.**

### 3.1 Color tokens
| Token | Hex | Use |
|---|---|---|
| `paper` | `#FCF7E6` | Page background |
| `paper-deep` | `#F6EDD3` | Alternate section background |
| `sand-soft` | `#F1E3C8` | Soft surfaces |
| `card` | `#FFFCF3` | Cards, inputs |
| `exercise` | `#F3EAD6` | Exercise body background |
| `teal` (teal-deep) | `#196166` | Primary UI: buttons, links, active |
| `teal-hover` | `#124D51` | Hover for teal |
| `navy` (navy-teal) | `#0A414F` | Headings, main text, dark sections, footer |
| `burgundy` | `#841B22` | Accent, CTA variant, errors |
| `burgundy-hover` | `#6C141A` | Hover for burgundy |
| `mustard` | `#F5B246` | Brush underlines, badges, **focus ring** |
| `sand` (warm-sand) | `#D0AC84` | Dividers, borders |
| `sage` | `#5B8A81` | Calm accent, completed state |
| `teal-soft` | `#DCEAE6` | Tint |
| `burgundy-soft` | `#F4DEDA` | Tint (homework) |
| `mustard-soft` | `#FCE8C0` | Tint (in progress, gift) |
| `sage-soft` | `#E0EAE3` | Tint |
| `pronun-green` | `#D6E9C9` | Pronunciation circles only |
| `line` | `#E4D3B4` | Hairlines |
| `line-soft` | `#EFE3CB` | Soft hairlines |
| `tile-border` | `#C9B08E` | Exercise word tiles |
| `muted` | `#4A6268` | Secondary text |
| `ink-mustard` | `#7A4A00` | Text on mustard-soft |
| `ink-sage` | `#34605A` | Text on sage-soft |
| `terracotta` | `#C8734B` | Illustration detail on the path map only |

Rules: **no dark mode**, anywhere. Mustard and sand are never used for text on cream. Saturated navy fills only for Stories, the footer and one feature card.

### 3.2 Typography
- Stack: `font-family: "FiraGO", "Montserrat", system-ui, sans-serif`. FiraGO is registered **only** for `unicode-range: U+10A0-10FF, U+1C90-1CBF`, so Georgian renders in FiraGO and Latin in Montserrat automatically in mixed lines. Keep this when moving to `next/font/local` (example in `design/handoff/docs/assets.md`).
- Caveat: only short Spanish accents (¡Hola!, Conóceme, Poco a Poco, ¡Vamos!, Mis reglas, Un día a la vez, character name tags, "¡Hola, {name}!"). Never Georgian, never body text, never inside exercises.
- Scale: Display 64/1.1 · H1 48/1.15 · H2 36/1.2 (landing 46) · H3 24/1.3 · Body 18/1.6 (mobile 16) · Small 14/1.5 · Overline 12, 600, +10%, uppercase (Latin only; Georgian has no case).

### 3.3 Shape, spacing, motion
- Radii: 8 tags/tiles · 12 inputs/buttons · 14 large CTAs · 16 cards · 20 exercise panels · 24 modal/big panels. **Pills only for chips.**
- 4pt spacing. Desktop 12 cols, 80 margin, 24 gutter, max 1280. Mobile 4 cols, 20 margin. Section padding 96–120 (mobile 64).
- Elevation: 0 line · 1 hover/lift · 2 modal/device.
- Motion: hover lift −2px buttons / −4px cards, 180–250ms ease. Hero "¡Hola!" clip-path write-on 1.2s. Nina float 7s. Accordion 250ms with + → × rotate. **All motion off under `prefers-reduced-motion`.**
- Masks: organic blob, Mediterranean arch, curved half-bleed edge, soft wave edge for dark sections.
- Graphic motifs: mustard brush underline (one word only), open brush circle (always around something), doodles (max 2–3 sections), washi-taped pinned notes, dashed "stamp" borders, dotted paths.

### 3.4 Icons
Custom line set: 24px grid, 1.75 stroke, round caps/joins, teal/navy. Copy SVG paths from `screens/design-system.html` section 06 into one `<Icon name="…"/>` component in `packages/ui`. Every material type has its own icon and tint (table in `design/handoff/docs/components.md`). Icons: card, vocabulary, dialogue, video, audio, document, exercise, pronunciation, grammar, homework, game, checkpoint, home, lessons, materials, progress, restart, download, gift, search. **No emoji in UI.**

### 3.5 Components (build in `packages/ui`)
Button (primary teal / CTA burgundy / secondary outline / text link; sizes L 60–64, M 48–56, S 40; states default, hover, focus, disabled, loading) · Input · Textarea · ChoiceChip (single/multi, `aria-pressed`) · Checkbox · Badge/StatusChip · FeatureCard · LessonCard · MaterialRow · StatusRing · Accordion · Modal / BottomSheet · Toast · Skeleton · EmptyState · BrushUnderline · BrushCircle · PinnedNote · Stamp · OrganicMask/ArchMask · SectionWave · Icon · Logo.
A `/styleguide` route in the web app renders all of them for visual QA (dev/staging only).

---

## 4. SYSTEM ARCHITECTURE

```
                         ┌─────────────────────── Vercel ───────────────────────┐
 Visitor / Student /     │  apps/web  (Next.js App Router)                      │
 Nina (browser) ────────▶│   (marketing)  /            landing + booking form   │
                         │   (cabinet)    /app/...     student cabinet          │
                         │   (admin)      /admin/...   admin panel + AI chat    │
                         └───────────────┬──────────────────────────────────────┘
                                         │ HTTPS (cookies on .{DOMAIN})
                         ┌───────────────▼────────────── Railway ───────────────┐
                         │  apps/api  (Fastify, TypeScript)                     │
                         │   ├─ REST API (public / student / admin)             │
                         │   ├─ Auth (Better Auth, sessions in Postgres)        │
                         │   ├─ Media service (upload, signed URLs, Range)      │
                         │   ├─ Job worker (pg-boss) — same service in v1       │
                         │   │    media processing (sharp, ffmpeg)              │
                         │   │    AI agent runs, Social Studio renders          │
                         │   └─ Volume mounted at /data  (files)                │
                         │  Postgres (Railway plugin)                           │
                         └───────────────┬──────────────────────────────────────┘
                                         │
                   External: Anthropic API (AI assistant) · Resend (email) ·
                   Telegram Bot API (lead alerts, optional) · image-gen APIs (Social Studio, later)
```

**Why the worker runs inside the API service in v1:** a Railway volume attaches to **one** service. Media processing must read/write the same files, so the job worker runs in the API process (or as a second process in the same service). Everything goes through a `StorageDriver` interface, so later you can switch to S3-compatible object storage (Cloudflare R2 or similar) and split the worker into its own service without touching business code.

**Separation of concerns (from the brand context; keep it in code):**
Brand (tokens, copy) · Content (Material library) · Curriculum (Course → Block → Topic) · Lessons & Assignments (what a student gets) · Student data (progress, attempts, notes) · Presentation (web renderers). Content must evolve without rebuilding the site.

---

## 5. TECH STACK

| Layer | Choice | Notes |
|---|---|---|
| Monorepo | **pnpm workspaces + Turborepo** | |
| Language | **TypeScript** everywhere, `strict: true` | |
| Web | **Next.js (latest stable, App Router)** on Vercel | RSC for landing and cabinet reads; client components for interactive parts |
| Styling | **Tailwind CSS v4** with `tokens/tailwind-v4-theme.css` | v3 config exists in handoff; use v4 |
| UI primitives | **Radix UI** (Dialog, Accordion, Tabs, Popover, Toggle) | Styled with tokens, not default looks |
| Admin tables/forms | **shadcn/ui** (copied components) themed with Nina tokens | Admin only |
| Forms | react-hook-form + zod | |
| Data fetching (client) | TanStack Query | Cabinet interactivity, admin |
| Animation | Motion (framer-motion) | Swipe, springs; respects reduced motion |
| Drag and drop | **dnd-kit** | Exercises (drag_sort, sentence_builder) and admin ordering; keyboard sensors required |
| Audio | wavesurfer.js | Audio viewer waveform |
| Video | native `<video>` with custom controls (or Vidstack) | Captions (VTT), speeds |
| PDF | react-pdf (pdf.js) | Inline preview + download |
| Rich text | TipTap (stored as JSON) | Grammar explanations, notes |
| API | **Fastify** + `fastify-type-provider-zod` | Schemas shared from `packages/contracts` |
| ORM | **Prisma** + PostgreSQL | |
| Auth | **Better Auth** (email + password, invitations, password reset) with Prisma adapter | Sessions in Postgres, httpOnly cookies |
| Jobs | **pg-boss** (Postgres-backed queue) | No Redis needed |
| Images | sharp | webp/avif variants, thumbnails |
| Video/audio | ffmpeg (via Nixpacks/Docker on Railway) | Transcode, posters, durations |
| Email | Resend | Invites, reset, lead alerts |
| AI | Anthropic TypeScript SDK (tool use, streaming); Claude Agent SDK for heavier agentic tasks | Model name from env, never hardcoded |
| Validation | zod | Single source for API, exercise content, AI tool I/O |
| Testing | Vitest (unit), Playwright (e2e + screenshots) | |
| Lint/format | ESLint + Prettier | |

---

## 6. MONOREPO LAYOUT

```
nina/
├─ apps/
│  ├─ web/                         Next.js (Vercel)
│  │  ├─ src/app/
│  │  │  ├─ (marketing)/           page.tsx (landing), privacy/, terms/
│  │  │  ├─ (auth)/                login/, forgot-password/, reset-password/, invite/[token]/
│  │  │  ├─ (cabinet)/app/         page.tsx (home), lessons/, lessons/[id]/, m/[materialId]/,
│  │  │  │                         materials/, vocabulary/, progress/
│  │  │  ├─ (admin)/admin/         dashboard, leads, students, lessons, library, curriculum,
│  │  │  │                         vocabulary, media, assistant, social, settings
│  │  │  └─ styleguide/            dev/staging only
│  │  ├─ src/components/
│  │  │  ├─ landing/               one component per landing section
│  │  │  ├─ cabinet/               shell, cards, viewers/
│  │  │  ├─ exercises/             ExerciseFrame + templates/ (registry)
│  │  │  └─ admin/
│  │  ├─ src/lib/                  api client, auth helpers, formatters (ka dates)
│  │  ├─ src/content/landing.ka.ts landing copy (typed), FAQ, dialogue sample
│  │  ├─ src/fonts/
│  │  └─ public/brand, public/illustrations
│  └─ api/                         Fastify (Railway)
│     ├─ src/modules/
│     │  ├─ auth/  leads/  students/  curriculum/  materials/  lessons/
│     │  ├─ assignments/  progress/  vocabulary/  media/  settings/
│     │  ├─ ai/                    agent runtime, tools, threads
│     │  └─ social/                reserved (Section 17)
│     ├─ src/jobs/                 pg-boss workers
│     ├─ src/storage/              StorageDriver (LocalVolumeDriver, S3Driver later)
│     └─ src/server.ts
├─ packages/
│  ├─ db/                          Prisma schema, migrations, seed
│  ├─ contracts/                   zod schemas: API DTOs, material content, exercise templates
│  ├─ ui/                          tokens, Tailwind theme, shared components, Icon set
│  ├─ exercise-engine/             pure TS: grading, step navigation, scoring (no React)
│  └─ config/                      eslint, tsconfig, prettier
├─ design/  docs/  .cursor/        (Section 0)
└─ turbo.json, pnpm-workspace.yaml
```

**Key rule:** `packages/contracts` is imported by **web** (renderers, forms), **api** (validation), and **ai** (tool schemas). One definition per content type.

---

## 7. DATA MODEL (PRISMA SCHEMA)

This is the canonical model. Cursor may add indexes, `createdAt/updatedAt` and minor fields, but not change the concepts.

```prisma
// ───────── Identity ─────────
enum Role { ADMIN STUDENT }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String                      // Georgian display name, e.g. "მარიამი"
  nameLatin     String?                     // e.g. "Mariam" (used in "¡Hola, Mariam!")
  role          Role     @default(STUDENT)
  isActive      Boolean  @default(true)
  // Better Auth manages sessions/accounts/verification tables alongside this model
  student       StudentProfile?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model StudentProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  phone           String?
  preferredChannel ContactChannel?
  goal            Goal?
  goalNote        String?
  courseId        String?                   // current course (A1)
  course          Course?  @relation(fields: [courseId], references: [id])
  nextLessonAt    DateTime?                 // shown on cabinet home
  giftLessonsLeft Int      @default(2)
  leadId          String?  @unique          // converted from which lead
  lead            Lead?    @relation(fields: [leadId], references: [id])
  lessons         Lesson[]
  assignments     Assignment[]
  progress        MaterialProgress[]
  attempts        ExerciseAttempt[]
  notes           TeacherNote[]
  checklist       ChecklistItem[]
  personalVocab   VocabularyEntry[]  @relation("PersonalVocab")
  personalMaterials Material[]       @relation("PersonalMaterial")
  onboardedAt     DateTime?                 // first login
}

// ───────── Leads (booking form) ─────────
enum ContactChannel { PHONE WHATSAPP TELEGRAM EMAIL }
enum Goal { TRAVEL STUDY RELOCATION FUN OTHER }
enum TimeOfDay { MORNING DAY EVENING }
enum LeadStatus { NEW CONTACTED TRIAL_SCHEDULED TRIAL_DONE CONVERTED LOST }

model Lead {
  id          String         @id @default(cuid())
  name        String
  phone       String
  email       String?
  channel     ContactChannel
  goal        Goal?
  days        String[]                      // ["MON","WED",...]
  timeOfDay   TimeOfDay?
  note        String?
  consentAt   DateTime
  source      String?                       // "hero" | "header" | "gift" | "pricing" | "final" | utm...
  utm         Json?
  status      LeadStatus     @default(NEW)
  adminNote   String?
  student     StudentProfile?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

// ───────── Curriculum ─────────
model Course {
  id        String   @id @default(cuid())
  slug      String   @unique               // "a1", "survival", "spanish-in-action"
  title     String                          // student-facing (never the textbook name)
  level     String?                         // "A1"
  order     Int      @default(0)
  blocks    Block[]
  students  StudentProfile[]
}

model Block {
  id        String   @id @default(cuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  order     Int
  titleEs   String                          // "En el café"
  titleKa   String                          // "კაფეში"
  topics    Topic[]
  checkpointMaterialId String?              // the checkpoint exercise for this block
  @@unique([courseId, order])
}

model Topic {
  id        String   @id @default(cuid())
  blockId   String
  block     Block    @relation(fields: [blockId], references: [id])
  number    Int                             // global 1..45 within the course (for "up to topic N")
  titleKa   String                          // "საკვები და სასმელი"
  titleEs   String?                         // "querer / quiero"
  internalRef String?                       // admin-only mapping to textbook units. NEVER exposed to students.
  materials MaterialTopic[]
  lessons   LessonTopic[]
  vocabulary VocabularyEntry[]
  @@unique([blockId, number])
}

// ───────── Content library ─────────
enum MaterialType {
  INFO_CARD          // image(s) 9:16
  VOCAB              // structured list or image
  DIALOGUE           // lines ES + EN (+ audio per line)
  STORY              // structured scenario
  VIDEO
  AUDIO
  DOCUMENT           // PDF/DOC/DOCX
  GRAMMAR            // rich text and/or image
  EXERCISE           // template-based JSON (Section 8.3)
  GAME               // template-based JSON (same engine as EXERCISE)
  PRONUNCIATION
  GRADED_READER      // document or rich text
  CHECKPOINT         // exercise with result screen
  HTML_EMBED         // legacy/bespoke HTML interactive in sandboxed iframe (Section 8.4)
}
enum MaterialStatus { DRAFT PUBLISHED ARCHIVED }
enum MaterialOrigin { MANUAL AI_AGENT IMPORTED }

model Material {
  id            String         @id @default(cuid())
  type          MaterialType
  title         String                      // student-facing title (often Spanish)
  subtitle      String?                     // "ვიდეო-დიალოგი · 2:10" style meta can be derived
  description   String?
  content       Json                        // validated by packages/contracts per type
  contentSchemaVersion Int     @default(1)
  status        MaterialStatus @default(DRAFT)
  origin        MaterialOrigin @default(MANUAL)
  tags          String[]
  estMinutes    Int?
  // personal material: exists only for one student (null = library material)
  personalForId String?
  personalFor   StudentProfile? @relation("PersonalMaterial", fields: [personalForId], references: [id])
  assets        MaterialAsset[]
  topics        MaterialTopic[]
  assignments   Assignment[]
  progress      MaterialProgress[]
  revisions     MaterialRevision[]
  createdById   String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model MaterialTopic {
  materialId String
  topicId    String
  material   Material @relation(fields: [materialId], references: [id])
  topic      Topic    @relation(fields: [topicId], references: [id])
  @@id([materialId, topicId])
}

model MaterialRevision {                    // snapshot on each publish/AI edit; enables undo + review
  id          String   @id @default(cuid())
  materialId  String
  material    Material @relation(fields: [materialId], references: [id])
  content     Json
  title       String
  note        String?                       // "AI draft from thread X", "edited by Nina"
  createdById String?
  createdAt   DateTime @default(now())
}

// ───────── Media ─────────
enum AssetKind { IMAGE VIDEO AUDIO DOCUMENT OTHER }
enum AssetStatus { UPLOADING PROCESSING READY FAILED }

model MediaAsset {
  id          String      @id @default(cuid())
  kind        AssetKind
  originalName String
  mime        String
  sizeBytes   BigInt
  storageKey  String      @unique            // e.g. "orig/2026/09/<id>.mp4"
  checksum    String?
  status      AssetStatus @default(UPLOADING)
  width       Int?
  height      Int?
  durationSec Float?
  pageCount   Int?
  variants    Json?       // { webp_800: key, webp_1600: key, poster: key, mp3: key, thumb_p1: key, vtt: key }
  alt         String?
  tags        String[]
  usedBy      MaterialAsset[]
  createdAt   DateTime    @default(now())
}

model MaterialAsset {
  materialId String
  assetId    String
  role       String        // "card_page" | "video" | "audio" | "line_audio" | "document" | "poster" | "image" | "captions"
  order      Int           @default(0)
  material   Material   @relation(fields: [materialId], references: [id])
  asset      MediaAsset @relation(fields: [assetId], references: [id])
  @@id([materialId, assetId, role])
}

// ───────── Lessons & assignments ─────────
enum LessonStatusOverride { AUTO DONE }

model Lesson {                              // a session with ONE student ("LECCIÓN 6")
  id            String   @id @default(cuid())
  studentId     String
  student       StudentProfile @relation(fields: [studentId], references: [id])
  number        Int                         // per-student sequence
  title         String                      // "En el café — შეკვეთა"
  date          DateTime                    // when it happened / will happen
  noteFromNina  String?                     // "ნინას შენიშვნა"
  readyForStudent Boolean @default(false)   // only ready lessons are visible
  statusOverride LessonStatusOverride @default(AUTO)
  isGift        Boolean  @default(false)    // one of the 2 free lessons
  topics        LessonTopic[]
  items         Assignment[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@unique([studentId, number])
}

model LessonTopic {
  lessonId String
  topicId  String
  lesson   Lesson @relation(fields: [lessonId], references: [id])
  topic    Topic  @relation(fields: [topicId], references: [id])
  @@id([lessonId, topicId])
}

enum AssignmentKind { LESSON_MATERIAL HOMEWORK PERSONAL REVIEW }

model Assignment {                          // "this material is given to this student"
  id              String   @id @default(cuid())
  studentId       String
  student         StudentProfile @relation(fields: [studentId], references: [id])
  materialId      String
  material        Material @relation(fields: [materialId], references: [id])
  lessonId        String?                   // null = outside a lesson (e.g. personal from Nina)
  lesson          Lesson?  @relation(fields: [lessonId], references: [id])
  kind            AssignmentKind @default(LESSON_MATERIAL)
  groupLabel      String?                   // "1 · ვხედავთ სიტუაციას"
  order           Int      @default(0)
  dueAt           DateTime?                 // homework
  readyForStudent Boolean  @default(false)
  assignedAt      DateTime @default(now())
  @@index([studentId, readyForStudent])
}

// ───────── Student data ─────────
enum ProgressStatus { NOT_STARTED OPENED COMPLETED }

model MaterialProgress {                    // per student per material (not per assignment)
  studentId   String
  materialId  String
  status      ProgressStatus @default(NOT_STARTED)
  openedAt    DateTime?
  completedAt DateTime?
  lastStep    Int?                           // exercise resume point (desktop)
  bestScore   Float?                         // 0..1
  student     StudentProfile @relation(fields: [studentId], references: [id])
  material    Material @relation(fields: [materialId], references: [id])
  @@id([studentId, materialId])
}

model ExerciseAttempt {
  id          String   @id @default(cuid())
  studentId   String
  student     StudentProfile @relation(fields: [studentId], references: [id])
  materialId  String
  contentRevisionId String?                  // which revision was attempted
  answers     Json                           // per-step answers
  score       Float?                         // 0..1
  correct     Int?
  total       Int?
  finishedAt  DateTime?
  createdAt   DateTime @default(now())
}

model TeacherNote {                          // "ნინასგან" on cabinet home
  id          String   @id @default(cuid())
  studentId   String
  student     StudentProfile @relation(fields: [studentId], references: [id])
  body        String
  materialId  String?                        // optional linked personal material
  visibleToStudent Boolean @default(true)
  createdAt   DateTime @default(now())
}

model ChecklistItem {                        // teacher-only per-student checklist
  id          String   @id @default(cuid())
  studentId   String
  student     StudentProfile @relation(fields: [studentId], references: [id])
  lessonId    String?
  text        String
  done        Boolean  @default(false)
  order       Int      @default(0)
}

// ───────── Vocabulary ─────────
model VocabularyEntry {
  id            String   @id @default(cuid())
  es            String                      // "la cuenta"
  ka            String                      // "ანგარიში"
  en            String?                     // "the bill"
  pronunciation String?                     // tricky letters only, e.g. "cu", "z", "ce"
  audioAssetId  String?
  topicId       String?
  topic         Topic?   @relation(fields: [topicId], references: [id])
  category      String?                     // "მისალმება" | "რიცხვები" | "კაფეში" | "ზმნები"
  personalForId String?                     // ★ personal words
  personalFor   StudentProfile? @relation("PersonalVocab", fields: [personalForId], references: [id])
  personalLabel String?                     // "პირადი · Valencia"
}

// ───────── Lesson templates (reuse a lesson plan across students) ─────────
model LessonTemplate {
  id        String   @id @default(cuid())
  title     String
  topicIds  String[]
  items     Json      // [{ materialId, groupLabel, order, kind, dueInDays? }]
  note      String?
}

// ───────── Site settings (editable by Nina) ─────────
model SiteSetting {
  key   String @id                         // "price_gel", "lesson_minutes", "gift_lessons", "contact_email",
  value Json                               // "contact_phone", "telegram", "instagram_url", "facebook_url", "tiktok_url",
}                                          // "lesson_platform", "faq_overrides"...

// ───────── AI assistant (Section 16) ─────────
model AgentThread {
  id        String   @id @default(cuid())
  title     String?
  createdById String
  messages  AgentMessage[]
  runs      AgentRun[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
model AgentMessage {
  id        String   @id @default(cuid())
  threadId  String
  thread    AgentThread @relation(fields: [threadId], references: [id])
  role      String                          // "user" | "assistant" | "tool"
  content   Json                            // text blocks, tool calls, tool results, draft refs
  createdAt DateTime @default(now())
}
model AgentRun {
  id          String   @id @default(cuid())
  threadId    String
  thread      AgentThread @relation(fields: [threadId], references: [id])
  status      String                        // "running" | "done" | "failed" | "cancelled"
  model       String
  inputTokens Int?
  outputTokens Int?
  costUsd     Float?
  error       String?
  createdAt   DateTime @default(now())
  finishedAt  DateTime?
}
model PromptTemplate {                      // Nina's saved prompts
  id    String @id @default(cuid())
  name  String
  body  String
  tags  String[]
}

// ───────── Social Studio (reserved, Section 17) ─────────
// Tables are created in Phase 9. Keep the names reserved: BrandKit, SocialPost, SocialTemplate, SocialAsset, GenerationJob.
```

### 7.1 Derived logic (implement in `api`, unit-test it)
- **Visible to student** = `Lesson.readyForStudent = true` for lessons; `Assignment.readyForStudent = true` for items (an item inside a ready lesson still needs its own `readyForStudent`, which defaults to true when the lesson is marked ready; Nina can hold back single items).
- **Material status for student** = `MaterialProgress.status` (default NOT_STARTED).
- **Lesson status** (derived unless `statusOverride = DONE`):
  - `NEW`: no visible item opened.
  - `IN_PROGRESS`: at least one item opened, not all non-homework items completed.
  - `DONE`: all non-homework items completed.
- **Lesson counter** "7 / 12 მასალა" = completed visible items / visible items (homework included in the count, as in the design).
- **Covered topics** for a student = union of topics of their ready lessons. **Max covered topic number** drives the vocabulary "up to topic N" filter and the library topic filter.
- **Student vocabulary** = entries whose `topic.number ≤ selected N` among covered topics, plus `personalForId = student`.
- **Block progress** = topics covered in the block / topics in the block (e.g. "3/5"). Checkpoint "passed" = best score ≥ 0.7 (configurable in SiteSetting `checkpoint_pass`).
- **Home "continue learning"** = the most recent ready lesson that is IN_PROGRESS (else NEW), and inside it the first item (in order) not COMPLETED.
- **Material update propagation:** editing a library Material updates it for every student (no copies). Each publish writes a `MaterialRevision`. Exercise attempts store the revision id.

---

## 8. CONTENT CONTRACTS: MATERIAL TYPES AND EXERCISES

All contracts live in `packages/contracts/src/content/*.ts` as zod schemas, with `contentSchemaVersion`. The admin editors, the API, the AI tools and the cabinet renderers all use them. `design/handoff/docs/cabinet-spec.md` contains a suggested exercise JSON; **this section is canonical**. Keep field names compatible where they match.

### 8.1 Shared primitives
```ts
const LocalizedText = z.object({ es: z.string().optional(), ka: z.string().optional(), en: z.string().optional() });
const AssetRef = z.object({ assetId: z.string() });
const Speaker = z.object({ id: z.string(), name: z.string(), initial: z.string().max(2), tone: z.enum(["burgundy","teal","sage","mustard","navy"]) });
```

### 8.2 Non-exercise material content (by type)
| Type | `content` shape (summary) | Viewer (screen) |
|---|---|---|
| `INFO_CARD` | `{ pages: AssetRef[] /* 9:16 images */, altKa?: string }` | Image card viewer: zoom, prev/next, swipe on mobile (C5, mobile card viewer) |
| `VOCAB` | `{ layout: "list" \| "image", title: {es, ka}, entries?: {es, ka, en?, audio?: AssetRef, image?: AssetRef}[], pages?: AssetRef[] }` | Vocabulary card (list rendered as a branded card) |
| `DIALOGUE` | `{ context?: {ka?, es?}, speakers: Speaker[], lines: {speakerId, es, en, audio?: AssetRef}[], fullAudio?: AssetRef }` | Chat bubbles, **ES / ES+EN toggle**, ▶ per line if audio exists |
| `STORY` | `{ characters: Speaker[], place: {es, ka}, contextKa: string, vocabularyIds: string[], dialogue: DIALOGUE, grammarKa?: RichText, cultureKa?: RichText, followUpMaterialIds: string[] }` | Composite: renders its parts in order |
| `VIDEO` | `{ video: AssetRef, captions?: AssetRef /*vtt*/, dialogue?: DIALOGUE }` | Video player + dialogue text below with current line highlighted |
| `AUDIO` | `{ audio: AssetRef, transcript?: DIALOGUE }` | Waveform, 0.75× / 1× / 1.25×, transcript with EN toggle |
| `DOCUMENT` | `{ file: AssetRef, allowDownload: boolean }` | PDF inline preview with thumbnails + download; DOC/DOCX = download + server-generated PDF preview when possible |
| `GRAMMAR` | `{ body: RichText /*TipTap JSON*/, image?: AssetRef, examples?: {es, ka, en?}[] }` | Short, visual, contextual |
| `PRONUNCIATION` | `{ title: string, items: {grapheme: string /*lowercase*/, audio?: AssetRef}[], examples: string[] }` | Pale-green organic circles; tap = play audio |
| `GRADED_READER` | `{ file?: AssetRef, body?: RichText, chapter?: number, series?: "ana-danelia" }` | Document or reader view |
| `HTML_EMBED` | `{ bundle: AssetRef /* zip or html */, entry: string, height?: number, reportsCompletion: boolean }` | Sandboxed iframe (8.4) |

### 8.3 Exercises (EXERCISE, GAME, CHECKPOINT)
One **shared frame** + a **pluggable body per `templateId`**. See screens C6 (desktop) and mobile exercise.

```ts
const ExerciseContent = z.object({
  schemaVersion: z.literal(1),
  templateId: z.enum([
    "multiple_choice", "swipe_true_false", "drag_sort", "sentence_builder",
    "fill_blank", "matching_pairs", "branching_dialogue", "listening", "checkpoint"
  ]),
  title: z.string(),                       // "¿Qué vas a tomar?"
  instructionKa: z.string(),               // one line, Georgian: "აირჩიე სწორი პასუხი"
  variant: z.string().optional(),          // UX variant within the template (see "variety" below)
  illustration: z.string().optional(),     // spot pose id from public/illustrations/spots
  passThreshold: z.number().min(0).max(1).default(0.7),
  steps: z.array(Step).min(1),             // Step is a discriminated union by templateId (below)
  feedback: z.object({ correctKa: z.string().optional(), finishTitleEs: z.string().default("¡Muy bien!") }).optional(),
});
```

**Step shapes per template:**
| templateId | Step fields | Grading |
|---|---|---|
| `multiple_choice` | `prompt: {es?, ka?}`, `context?: string` (e.g. dialogue line with `___`), `options: {id, text}[]`, `correctId`, `explanationKa?` | exact id |
| `swipe_true_false` | `statement: string`, `isTrue: boolean`, `context?: string` | boolean |
| `drag_sort` | `buckets: {id, label}[]` (e.g. "el", "la"), `items: {id, text, bucketId}[]` | all items in correct bucket (partial credit per item) |
| `sentence_builder` | `promptKa: string` (sentence to build), `tiles: string[]` (shuffled), `answer: string[]`, `acceptAlso?: string[][]` | exact sequence or any `acceptAlso` |
| `fill_blank` | `verbHint?: string` ("ser"), `rows: {before: string, after: string, answer: string, options?: string[]}[]` | case/accent-insensitive compare (configurable `strictAccents`) |
| `matching_pairs` | `mode: "word_image" \| "word_translation"`, `pairs: {left: string, right: string \| AssetRef}[]` | all pairs |
| `branching_dialogue` | `nodes: {id, speakerId, text, choices?: {text, next, isGood?: boolean}[]}[]`, `start`, `speakers` | completion-based; optional score from `isGood` |
| `listening` | `audio: AssetRef`, `questionEs`, `questionKa?`, `options`, `correctId` | exact id |
| `checkpoint` | `sections: {labelKa, stepRefs: Step[]}[]` (mix of other step types) | score per section + total → result screen |

**Frame behaviour (must match C6):**
- Header: type overline, "N / M", title, close (returns to lesson; progress saved).
- Instruction line in Georgian. Teal progress bar.
- Body: template component from a **registry** `templates[templateId]`. Adding a template = add a zod schema + a React body + an engine grader. Nothing else changes.
- Footer: restart (↺, back to the start of **this exercise**), feedback line, "შემოწმება" → "შემდეგი →".
- States: selected = teal border; correct = sage border + ✓; wrong = burgundy border + show the correct answer.
- Completion screen: "¡Muy bien!" + "სავარჯიშო დასრულებულია" + "8 / 8 · მასალა მოინიშნა დასრულებულად" + restart + "შემდეგი მასალა →".
- Desktop: one step per screen. **Mobile: continuous scroll** with a sticky "შემოწმება".
- Beige `exercise` background, printed fonts only, thin tile outlines, **no name entry**.
- Accessibility: keyboard alternatives for drag (dnd-kit keyboard sensor) and swipe (← / → buttons + keys).
- Completion: when the student finishes, the API sets `MaterialProgress.COMPLETED` and stores an `ExerciseAttempt`.
- Grading logic lives in `packages/exercise-engine` (pure functions, unit-tested) and runs client-side for feedback **and** server-side on submit.

**UX variety (important for the AI agent):** each template exposes **variants** that change the interaction feel without changing branding. Examples:
- `multiple_choice`: `"list"`, `"cards_2x2"`, `"chat_context"` (question shown as a chat bubble).
- `swipe_true_false`: `"card_stack"`, `"buttons_only"`.
- `drag_sort`: `"two_buckets"`, `"multi_buckets"`.
- `sentence_builder`: `"tiles"`, `"tiles_with_translation_hint"`.
- `matching_pairs`: `"lines"`, `"tap_pairs"`.
- `branching_dialogue`: `"chat"`, `"scene"` (with a spot illustration).
Each template exports `meta = { id, labelKa, variants, bestFor: string[], minSteps, maxSteps }`. The AI agent reads this registry to pick different templates and variants across a lesson.

### 8.4 HTML_EMBED (legacy interactive HTML + future bespoke AI-generated exercises)
Nina already has a library of interactive HTML exercises (branching dialogues, swipe games, sorting games, sentence builders, cumulative assessments). They are migrated as `HTML_EMBED` so nothing is lost, and the AI agent can later generate bespoke ones.
- Served from a **separate origin** (e.g. `embed.{DOMAIN}` → API route that serves bundle files) and rendered in `<iframe sandbox="allow-scripts">` (no `allow-same-origin`).
- **postMessage bridge**, versioned:
  - child → parent: `{ type: "nina:ready" }`, `{ type: "nina:progress", step, total }`, `{ type: "nina:complete", score?: 0..1, correct?, total? }`, `{ type: "nina:resize", height }`
  - parent → child: `{ type: "nina:init", student: { firstName }, locale: "ka" }` (no name entry needed; the student is known)
- Parent validates `event.origin` and message shape (zod).
- Rules still apply: beige background, printed fonts, no dark mode. Legacy bundles that ask for a name: the bridge sends `firstName`, and the migration step removes the name screen where possible.

---

## 9. API DESIGN

Base URL: `https://api.{DOMAIN}/v1`. JSON. zod-validated in and out. Errors: `{ error: { code, messageKa, details? } }`. Pagination: cursor-based (`?cursor=&limit=`).

### 9.1 Public
| Method | Path | Purpose |
|---|---|---|
| POST | `/leads` | Booking form submission (rate-limited, honeypot, optional Turnstile) |
| GET | `/public/settings` | Price, lesson minutes, gift count, contacts, social URLs (cached) |
| GET | `/health` | Health check |

### 9.2 Auth (Better Auth, mounted at `/v1/auth/*`)
Sign in (email + password), sign out, session, forgot password, reset password, **accept invite** (set password from token). **No public sign-up endpoint** (disable it).

### 9.3 Student (`role = STUDENT`, only own data)
| Method | Path | Purpose |
|---|---|---|
| GET | `/me` | Profile, next lesson time, counts |
| GET | `/me/home` | Aggregated home: continue-learning, homework, latest note + personal material, path summary |
| GET | `/me/lessons` | Ready lessons with derived status + counters (filter `all\|current\|done`) |
| GET | `/me/lessons/:id` | Lesson with topics, note, grouped items with material summaries + progress |
| GET | `/me/materials` | All ready assignments; filters `type[]`, `topicMax`, `q`, `kind` |
| GET | `/me/materials/:materialId` | Full material content (only if assigned + ready), with **signed asset URLs**; includes prev/next within lesson when `?lessonId=` |
| POST | `/me/progress/:materialId/open` | Sets OPENED (idempotent) |
| POST | `/me/progress/:materialId/complete` | Passive completion ("mark as done") |
| POST | `/me/exercises/:materialId/attempts` | Submit answers → server grades → attempt + progress |
| PATCH | `/me/exercises/:materialId/position` | Save `lastStep` |
| GET | `/me/vocabulary` | Filters `topicMax`, `category`, `personal` |
| GET | `/me/progress` | Stats, blocks, checkpoints |

### 9.4 Admin (`role = ADMIN`)
| Area | Endpoints |
|---|---|
| Leads | `GET /admin/leads`, `PATCH /admin/leads/:id` (status, note), `POST /admin/leads/:id/convert` (creates User + StudentProfile + sends invite) |
| Students | CRUD `/admin/students`, `POST /admin/students/:id/invite` (resend), `GET /admin/students/:id/overview` (lessons, progress, attempts, notes, checklist) |
| Curriculum | CRUD `/admin/courses`, `/admin/blocks`, `/admin/topics`; `PATCH` reorder |
| Materials | CRUD `/admin/materials` (filters: type, status, topic, tag, origin, q), `POST /admin/materials/:id/publish`, `GET /admin/materials/:id/revisions`, `POST /admin/materials/:id/revert/:revId`, `POST /admin/materials/:id/duplicate`, `GET /admin/materials/:id/usage` (which students/lessons) |
| Preview | `GET /admin/preview/materials/:id` (renders as student), `GET /admin/preview/students/:id/home` |
| Lessons | CRUD `/admin/students/:id/lessons`, `PUT /admin/lessons/:id/items` (ordered items with groupLabel, kind, dueAt, ready), `POST /admin/lessons/:id/ready`, `POST /admin/lessons/from-template` |
| Assignments | `POST /admin/assignments` (bulk: materials × students), `PATCH`, `DELETE` |
| Notes / checklist | CRUD `/admin/students/:id/notes`, `/admin/students/:id/checklist` |
| Vocabulary | CRUD `/admin/vocabulary`, `POST /admin/vocabulary/import` (CSV/XLSX) |
| Media | `POST /admin/media` (multipart upload, streaming), `GET /admin/media`, `GET /admin/media/:id`, `DELETE` (only if unused) |
| Templates | CRUD `/admin/lesson-templates` |
| Settings | `GET/PUT /admin/settings` |
| AI | `POST /admin/ai/threads`, `GET /admin/ai/threads/:id`, `POST /admin/ai/threads/:id/messages` (**SSE stream**), `POST /admin/ai/runs/:id/cancel`, CRUD `/admin/ai/prompts` |
| Social (reserved) | `/admin/social/*` (Phase 9) |

### 9.5 Media delivery
`GET /media/:assetId/:variant?token=…&exp=…` : HMAC-signed, short-lived (e.g. 1h) URLs issued only when the requester may see the asset (student: asset belongs to a ready assigned material; admin: always; public: only assets flagged `public`, e.g. none in v1 because landing images are static in `apps/web/public`). Supports **HTTP Range** (video/audio seeking), `Content-Type`, `Accept-Ranges`, `ETag`, `Cache-Control: private, max-age=3600`.

---

## 10. AUTH, ROLES, SECURITY

- **No public registration.** Nina creates students (usually by converting a Lead). The system emails an **invite link** → the `/invite/[token]` page (same layout as Login) → the student sets a password → first login shows the **empty state** ("¡Bienvenida!").
- Login screen: C1 (email + password, "დაგავიწყდა პაროლი?", note "ანგარიშს ნინა გიქმნის — რეგისტრაცია საჭირო არ არის. ჯერ არ გაქვს?" + link to booking). Error: "ელ-ფოსტა ან პაროლი არასწორია" with burgundy input borders and message under the button. Forgot/reset password screens reuse the login layout.
- Sessions: httpOnly, `Secure`, `SameSite=Lax` cookies on `.{DOMAIN}` so `www` (Vercel) and `api` (Railway) share them. **Use custom domains for both**; do not rely on `*.vercel.app` ↔ `*.up.railway.app` cross-site cookies.
- Next.js middleware: `/app/**` requires STUDENT or ADMIN; `/admin/**` requires ADMIN. The API enforces the same (never trust the frontend).
- Row-level rule in every student query: `studentId = session.user.student.id` and `readyForStudent = true`.
- Rate limits: `/leads` (5/hour/IP), auth endpoints, AI endpoints.
- Lead spam: hidden honeypot field + time-to-submit check; Cloudflare Turnstile behind a feature flag.
- Store `consentAt` for every lead; privacy policy page (content placeholder).
- Upload validation: MIME sniffing (not just extension), size limits (image 20 MB, audio 100 MB, document 50 MB, video 1 GB), filename sanitizing.
- `HTML_EMBED` isolation: separate origin + sandbox + strict CSP on embed responses.
- The textbook name and `Topic.internalRef` are never serialized to student endpoints (add a test).
- Admin audit: `MaterialRevision` + `createdById`; log lead status changes.

---

## 11. MEDIA STORAGE AND PROCESSING (RAILWAY VOLUME)

### 11.1 StorageDriver
```ts
interface StorageDriver {
  put(key: string, stream: Readable, opts: { contentType: string }): Promise<{ size: number; checksum: string }>;
  get(key: string, range?: { start: number; end?: number }): Promise<{ stream: Readable; size: number; contentType: string }>;
  head(key: string): Promise<{ size: number; contentType: string } | null>;
  delete(key: string): Promise<void>;
}
```
- v1: `LocalVolumeDriver` rooted at `STORAGE_ROOT=/data` (Railway volume mount).
- Later: `S3Driver` (Cloudflare R2 or any S3-compatible) selected by `STORAGE_DRIVER=s3`. Business code never touches paths directly.
- Key layout: `orig/{yyyy}/{mm}/{assetId}.{ext}`, `var/{assetId}/{variant}.{ext}`, `social/...`, `embed/{assetId}/...`.

### 11.2 Upload flow
1. Admin uploads (multipart, streamed to disk via `@fastify/multipart`, never buffered in memory). An asset row is created with `UPLOADING`.
2. On finish: checksum, MIME sniff, `PROCESSING`, enqueue `media.process`.
3. Worker by kind:
   - **Image:** sharp → webp 800 / 1600 (+ avif optional), dimensions, blurhash/LQIP.
   - **Video:** ffprobe metadata; if not browser-friendly, ffmpeg → H.264/AAC MP4 (`+faststart`); poster frame; duration.
   - **Audio:** ffprobe; normalize to MP3 128k (keep original); duration; waveform peaks JSON (for wavesurfer, avoids client decoding).
   - **Document:** PDF → page count + first-page thumbnail; DOC/DOCX → convert to PDF preview with LibreOffice headless if available in the image (optional, flag), else download-only.
4. Status `READY` (or `FAILED` with error); admin UI polls or listens via SSE.
- Railway service needs **ffmpeg** (and optionally LibreOffice) in the build: use a Dockerfile (recommended) or Nixpacks packages.
- Streaming large videos through Node is fine for Nina's scale (dozens of students). If traffic grows, move to S3 + CDN.

### 11.3 Backups
- Postgres: Railway backups + a nightly `pg_dump` job to a second location.
- Volume: enable Railway volume backups; plus a weekly job syncing `/data/orig` to off-site storage (R2) when credentials are configured.

---

## 12. LANDING PAGE: BUILD SPEC

**Reference:** `design/handoff/screens/landing-desktop*.html`, `landing-mobile*.html`, `mobile-menu.html` and their screenshots (desktop was split into 2 artboards because of canvas height limits; **build one continuous page**). Detailed notes are in `design/handoff/docs/landing-spec.md`.
**Rebuild responsively** (container 1280, breakpoints ~390 / 768 / 1024 / 1440). The screens use absolute positioning at fixed widths; copy **values and copy**, not the positioning technique.
**Copy:** put all landing copy in `apps/web/src/content/landing.ka.ts` (typed). Copy below is the design copy; Nina will finalize it. Placeholders are in `[brackets]`.

**Section order and tone:** Header · Hero (Lively) · Meet Nina (Calm) · Why Nina (Lively) · Stories (Lively, navy) · How a lesson works + 4 rules (Calm) · Materials (Lively) · Your cabinet (Calm) · Poco a Poco path (Calm) · Gift (Lively) · Pricing (Calm) · FAQ (Calm) · Final CTA (Lively) · Footer. Separate consecutive Calm sections with `paper` ↔ `paper-deep` backgrounds.

**CTA:** „დაჯავშნე საცდელი გაკვეთილი" opens the booking modal/sheet everywhere (header, hero, stories, gift, pricing, final). Pass a `source` to the form (`header|hero|stories|gift|pricing|final|menu`).

### 12.1 Header (sticky)
- Logo (compact) · anchors ნინა · მეთოდი · სიუჟეტები · მასალები · ფასი · კითხვები · ghost "შესვლა" with user icon (→ `/login`, or `/app` if signed in) · teal CTA.
- Default height 88 → scrolled 68 with cream background + sand divider; active section link burgundy with a mustard underline (IntersectionObserver).
- Mobile: logo + compact CTA „საცდელი გაკვეთილი" + menu icon → full-screen cream menu (links, CTA, "შესვლა", Caveat "Un día a la vez", walking Nina spot).

### 12.2 Hero (Lively)
- Caveat kicker "¡Hola!" (clip-path write-on) + note "soy Nina" with a hand-drawn arrow.
- Brand lead: "Nina" (120px; mobile 72) over "Tu Profe de Español" (54px) with a mustard brush underline under "Español".
- Quote with a big mustard quote mark: „ესპანურ ენას კი არ ვასწავლი, ვასწავლი ესპანურ სამყაროს"
- Descriptor: "ინდივიდუალური ონლაინ გაკვეთილები ნულიდან — ზრდასრულებისთვის, ნაბიჯ-ნაბიჯ, Poco a Poco."
- Chips: ნულიდან · ინდივიდუალური · ონლაინ · 75 წუთი
- CTA (nowrap) stacked above „პირველი 2 გაკვეთილი — საჩუქრად" and the link "როგორ მიმდინარეობს გაკვეთილი ↓".
- Desktop: standing Nina cut-out in a sand blob with an open brush circle and two small stars; gentle float. Mobile: stone-wall illustration above the text, fading into cream.

### 12.3 Meet Nina (Calm) — anchor `#nina`
- Caveat "Conóceme" · H2 "გამარჯობა, მე ნინა ვარ"
- "მთელი ცხოვრება ენებს ვსწავლობ. ქართულის გარდა ვისწავლე გერმანული, რუსული, ინგლისური, ესპანური და იტალიური."
- "ყოველთვის მინდოდა, რომ ჩემი სწავლა ყოფილიყო საინტერესო, მხიარული, მრავალფეროვანი და ჩემს მიზნებზე მორგებული. ზუსტად ასეთ გაკვეთილებს ვქმნი ჩემი მოსწავლეებისთვის."
- Five perforated **stamps**: Hallo · გერმანული / Привет · რუსული / Hello · ინგლისური / **¡Hola! · ესპანური** (highlighted) / Ciao · იტალიური (mobile uses abbreviations).
- Study-room illustration in a blob mask (cropped so no book spine / laptop logo).
- Closing Caveat "Un día a la vez."

### 12.4 Why Nina (Lively)
- Caveat "¿Por qué conmigo?" · H2 "რატომ ნინასთან" · side line "ეს არ არის ენის სკოლა. ეს ნინას ესპანური სამყაროა — და შენ მისი ნაწილი ხდები."
- 6 cards with a tinted illustration strip + spot pose:
  01 ესპანური ნულიდან — წინასწარი ცოდნა არ გჭირდება. ვიწყებთ პირველი „¡Hola!"-დან.
  02 სიუჟეტები და არა წესები — ენას სიტუაციებსა და პერსონაჟებში ხვდები — წესი მერე თავად ჩნდება.
  03 შენზე მორგებული — ტემპი და ლექსიკა შენი მიზნით: მოგზაურობა, სწავლა თუ გადასვლა.
  04 ლამაზი მასალები — ბარათები, დიალოგები და ვიდეოები — სპეციალურად ამ კურსისთვის.
  05 შენი კაბინეტი — ყველა გაკვეთილი და მასალა ერთ პირად სივრცეში.
  06 (navy, inverted) Poco a Poco · ნაბიჯ-ნაბიჯ — ყოველი ახალი „აგური" წინაზე დგას. მყარი საფუძველი — თავიდანვე.

### 12.5 Stories — signature section (Lively, navy with soft wave edges) — anchor `#istorias`
- Caveat "Nuestras historias" · H2 "ესპანური, რომელიც ისტორიასთან ერთად იზრდება"
- Text: "ესენი არიან ლაურა, ანა და ლუკასი. გაკვეთილიდან გაკვეთილზე ისევ შეხვდები მათ — კაფეში, ქუჩაში, სამსახურში. შენი ესპანური მათ ისტორიასთან ერთად იზრდება."
- Café illustration (four friends) in a large arch, with Caveat name tags: Laura · Nina · Ana · Lucas.
- Character list: Ana — ქართველი ვებ-დიზაინერი ბარსელონაში · Nina — შენი პროფე — ყოველთვის გვერდით · Laura — [ლაურას მოკლე აღწერა] · Lucas — [ლუკასის მოკლე აღწერა]
- Dialogue card "DIÁLOGO · En el café" with an **EN toggle button** (`aria-pressed`):
  - Ana: ¡Hola! ¿Qué tal? Soy Ana. — Hi! How are you? I'm Ana.
  - Lucas: ¡Hola, Ana! Yo soy Lucas. ¿De dónde eres? — Hi, Ana! I'm Lucas. Where are you from?
  - Ana: Soy de Georgia, pero vivo en Barcelona. — I'm from Georgia, but I live in Barcelona.
  - Lucas: ¡Qué bien! ¿Tomamos un café? — How nice! Shall we grab a coffee?
  - Speaker avatars: Ana = burgundy-soft/burgundy, Lucas = teal-soft/teal.
- **Spanish in Action** teaser: "დააჭირე და იცეკვე" — a small dance floor (5 × 3 grid). Buttons ← izquierda · derecha → · ↑ arriba · ↓ abajo move a mustard dot wearing round glasses (spring animation); the last word appears in Caveat ("¡izquierda!"). Also works with arrow keys.
- Burgundy CTA.

### 12.6 How a lesson works + rules (Calm) — anchor `#metodo`
- Caveat "Paso a paso" · H2 "როგორ მიმდინარეობს გაკვეთილი" · "ჯერ სიტუაცია, მერე წესი. ასე ენა ბუნებრივად „ჯდება"."
- 4 stops on a dotted wave (vertical on mobile):
  1 · Mira — ხედავ სიტუაციას — ვიდეო-დიალოგი, სადაც ესპანური ცოცხლად ჟღერს.
  2 · Observa — ამჩნევ კანონზომიერებას — თავად პოულობ, რა მეორდება და როგორ იცვლება.
  3 · Entiende — იგებ წესს — მოკლე, ვიზუალური ახსნა — როცა უკვე გესმის, რატომ.
  4 · Habla — იყენებ — ლაპარაკობ, თამაშობ, აწყობ საკუთარ დიალოგებს.
- Caveat "Mis reglas" · H3 "ნინას ოთხი წესი" · "ჩვენი საკლასო ოთახის — თუნდაც ონლაინ — წესები."
- Four pinned notes with washi tape on a sand board:
  ¡Nos divertimos! — ვერთობით — სერიოზული სწავლა სიამოვნების გარეშე არ გამოდის.
  Con calma — ვსწავლობთ საფუძვლიანად — კომფორტულ ტემპში, მყარ საფუძველზე.
  ¡Viva el error! — გვიყვარს შეცდომები — თქვი, რაც თავში მოგივა — შეცდომა გვიჩვენებს, სად ვიმუშაოთ.
  ¡Desde el día uno! — ესპანურად პირველივე გაკვეთილიდან — ვლაპარაკობ და ვთარგმნი — ყური ნელ-ნელა ეჩვევა.

### 12.7 Materials (Lively) — anchor `#materiales`
- Caveat "Materiales" · H2 "მასალები, რომლებიც ამ კურსისთვის იქმნება" · "ყველა ბარათი, დიალოგი და სავარჯიშო ნინას სამყაროს ნაწილია — და ყოველ მოსწავლეს თავისი ტემპითა და მიზნით ერგება."
- Type chips: ბარათები · ლექსიკა · დიალოგები · აუდიო · ვიდეო · სავარჯიშოები · გამოთქმა
- **Collage built from real HTML mini-materials** (reuse the cabinet renderers in a `demo` mode with static data, so landing and cabinet stay consistent):
  - Info card 9:16 "TEMA 1 · Los saludos": ¡Hola! გამარჯობა · Buenos días დილა მშვიდობისა · Buenas tardes შუადღე მშვ. · Buenas noches ღამე მშვ. · ¡Adiós! ნახვამდის
  - Vocabulary "En el café · VOCABULARIO": el café ყავა · la tostada ტოსტი · la cuenta ანგარიში · el vaso de agua ჭიქა წყალი
  - Audio "Diálogo 3 · En el café · 1:24"
  - Pronunciation: ll ñ j rr ce gu
  - Dialogue ES/EN: Ana: ¿Me pones un café, por favor? / Lucas: ¡Claro! ¿Con leche? / Ana: Sí, gracias.
  - Exercise "EJERCICIO · 3 / 8 · ააწყე წინადადება": Soy · de · Georgia · pero · vivo · en · Barcelona · "შემოწმება"
- Caveat footnote "hecho con cariño, para ti". Mobile: horizontal scroll-snap carousel.

### 12.8 Your cabinet (Calm)
- Caveat "Tu espacio" · H2 "შენი პირადი კაბინეტი" · "გაკვეთილის შემდეგ ყველაფერი შენთან რჩება — გადახედე, გაიმეორე, გააგრძელე."
- Checks: ყველა გაკვეთილი ერთ ადგილას · თითოეული გაკვეთილის მასალები · ხედავ, რა დაასრულე და რა გელოდება
- Terrace-desk illustration in an arch + **desktop and phone mockups** showing a mini cabinet home ("¡Hola, Mariam!", continue "გაკვეთილი 6 · En el café", homework, "ნინასგან"). Build the mockups from the real cabinet components with demo data.

### 12.9 Poco a Poco path (Calm)
- Caveat "Poco a Poco" · H2 "შენი გზა — ნულიდან თავდაჯერებულ A1-მდე" · "ნაბიჯ-ნაბიჯ, შენს ტემპში. ყოველი გაჩერება წინაზე დგას."
- Hand-coded SVG landscape (hills, terracotta roofs, cypresses, arches, a winding road) with 8 stops: ¡Hola! მისალმება · Me presento თავის გაცნობა · En el café კაფეში · ¿Dónde está? მიმართულებები · Mi día ჩემი დღე · Mi familia ოჯახი · De compras საყიდლები · ¡A1! (3 done, 4 upcoming, A1 check). Port the SVG from the screen file.
- Small note (keep until Nina confirms): "ბლოკების სახელები სამუშაოა — საბოლოო სია ნინასთან დაზუსტდება." **Hide this note in production** (show only when `NEXT_PUBLIC_SHOW_DRAFT_NOTES=true`).
- Mobile: vertical list.
- Later: feed stop names from `Block` records of the A1 course (`GET /public/path`).

### 12.10 Gift (Lively)
- Caveat "Un regalo para ti" · H2 "პირველი 2 გაკვეთილი — საჩუქრად" · "ორი გაკვეთილი, რომ ერთმანეთი გავიცნოთ და ესპანური უკვე იგრძნო — სანამ რამეს გადაიხდი."
- Hand-drawn checks: ვეცნობით ერთმანეთს · ვარკვევთ შენს მიზნებსა და ტემპს · პირველი ვიდეო-დიალოგები · პირველი ბარათები · ერთად ვაწყობთ პირველ დიალოგებს
- Burgundy CTA. Desktop: stone-wall illustration half-bleed with a curved edge. Mobile: walking Nina.

### 12.11 Pricing (Calm) — anchor `#precio`
- Caveat "Precio" · H2 "მარტივად: ერთი გაკვეთილი, ყველაფერი შიგნით" · "არანაირი რთული პაკეტი. იხდი გაკვეთილს — მასალები, კაბინეტი და შენი გეგმა უკვე მასშია."
- One card: badge „პირველი 2 გაკვეთილი — საჩუქრად" · "ინდივიდუალური გაკვეთილი" · **30 GEL / გაკვეთილი** · 75 წუთი · ონლაინ · 1 : 1 · includes: პერსონალური მასალები · პირადი ონლაინ კაბინეტი · ინდივიდუალური გეგმა შენი მიზნით · CTA · "ფასიანი გაკვეთილები მესამედან იწყება."
- Price, minutes and gift count come from `SiteSetting` (server-fetched, revalidated). The layout must accept 2–3 cards later (packages).

### 12.12 FAQ (Calm) — anchor `#preguntas`
- Caveat "¿Preguntas?" · H2 "ხშირად დასმული კითხვები" · "ვერ იპოვე პასუხი? მომწერე — სიამოვნებით გიპასუხებ."
- Accordion, one open at a time, first open by default, `aria-expanded`, + rotates to ×:
  1. ესპანური საერთოდ არ ვიცი. შეიძლება? — რა თქმა უნდა. კურსი ზუსტად ნულიდან იწყება — პირველი სიტყვიდან, პირველი „¡Hola!"-დან. წინასწარი ცოდნა საჭირო არ არის.
  2. როგორ ტარდება გაკვეთილები? — ონლაინ, ინდივიდუალურად, 75 წუთი. ვუყურებთ ვიდეო-დიალოგებს, ვმუშაობთ ბარათებზე და ბევრს ვლაპარაკობთ. [პლატფორმა: Zoom / Google Meet]
  3. რამდენად ხშირად უნდა ვისწავლო? — ამას პირველ საუბარზე ერთად ვწყვეტთ — შენი დროისა და მიზნის მიხედვით. [რეკომენდებული სიხშირე]
  4. რა არის კაბინეტში? — შენი გაკვეთილები და თითოეულის მასალები: ბარათები, დიალოგები, აუდიო, ვიდეო, სავარჯიშოები და საშინაო დავალება — ერთ ადგილას.
  5. შემიძლია ვისწავლო მოგზაურობისთვის, გადასასვლელად ან სწავლისთვის? — დიახ. თემებსა და ლექსიკას შენს მიზანს ვუსადაგებ — იქნება ეს მოგზაურობა, საცხოვრებლად გადასვლა თუ სწავლა.
  6. როგორ მუშაობს 2 საჩუქარი გაკვეთილი? — პირველი ორი გაკვეთილი უფასოა: ვეცნობით ერთმანეთს, ვადგენთ ტემპს და უკვე ვიწყებთ ესპანურს. ფასიანი გაკვეთილები მესამედან იწყება.
  7. როგორ ვიხდი? — [გადახდის მეთოდი და ვადები — ნინა დააზუსტებს]
  8. რა მოხდება, თუ გაკვეთილს გამოვტოვებ? — [გაცდენისა და გადატანის წესი — ნინა დააზუსტებს]
- Emit `FAQPage` JSON-LD. FAQ answers can be overridden from `SiteSetting.faq_overrides` later.

### 12.13 Final CTA (Lively)
- Mustard-soft background, cross-legged Nina in a brush circle · Caveat "¡Vamos!" · "მოდი, ესპანური ერთად ვისწავლოთ" · CTA · „პირველი 2 გაკვეთილი — საჩუქრად".

### 12.14 Footer (navy)
- Logo on a cream circle.
- Columns: საიტი (ნინა, მეთოდი, სიუჟეტები, ფასი) · კონტაქტი ([ელ-ფოსტა], [ტელეფონი / WhatsApp], [Telegram]) · სოციალური (Instagram, Facebook, TikTok as **plain text links**, no brand logos) · მოსწავლეებისთვის (შესვლა კაბინეტში).
- Signature *Nina - Tu Profe De Español* (Montserrat italic) · "© 2026 · ყველა უფლება დაცულია" · links to privacy/terms.
- Contacts and social URLs from `SiteSetting`.

---

## 13. BOOKING FLOW AND LEADS

**Reference:** `booking-modal-*.html` (4 states: form, errors, loading, success), `booking-sheet-mobile.html`, `booking-success-mobile.html`.

- Desktop: modal 1000×880, radius 24. Left mustard-soft panel: standing Nina, Caveat "¡Hola!", "Nina / Tu Profe de Español", „პირველი 2 გაკვეთილი — საჩუქრად.", "შეავსე ფორმა და ნინა თავად დაგიკავშირდება, რომ შეთანხმდეთ დროზე." Right: form.
- Mobile: full-screen sheet with a sticky submit button.
- URL state: `?book=1&source=hero` opens it (shareable, back button closes it).
- **Fields:**
  | Field | Control | Values | Required |
  |---|---|---|---|
  | სახელი | input | | yes |
  | ტელეფონი | input with +995 prefix | ≥ 12 digits including 995 | yes |
  | ელ-ფოსტა | input | email | no |
  | როგორ დაგიკავშირდე? | single chips | ტელეფონი · WhatsApp · Telegram · ელ-ფოსტა | yes (default WhatsApp) |
  | რისთვის გინდა ესპანური? | single chips | მოგზაურობა · სწავლა · გადასვლა · გართობისთვის · სხვა | no |
  | სასურველი დღეები | multi chips | ორშ · სამ · ოთხ · ხუთ · პარ · შაბ · კვ | no |
  | დღის მონაკვეთი | single chips | დილა · დღე · საღამო | no |
  | შენიშვნა | textarea | | no |
  | consent | checkbox: "ვეთანხმები, რომ ნინამ ჩემი მონაცემები გამოიყენოს დასაკავშირებლად" | | yes |
- Mapping to enums: ტელეფონი→PHONE, WhatsApp→WHATSAPP, Telegram→TELEGRAM, ელ-ფოსტა→EMAIL; მოგზაურობა→TRAVEL, სწავლა→STUDY, გადასვლა→RELOCATION, გართობისთვის→FUN, სხვა→OTHER; ორშ…კვ→MON…SUN; დილა→MORNING, დღე→DAY, საღამო→EVENING. If channel is EMAIL, email becomes required.
- **Validation:** on submit; inline burgundy messages ("შეიყვანე სახელი", "ნომერი არასრულია"), `aria-invalid`, summary line under the title "გთხოვ, შეავსე მონიშნული ველები." with `role="alert"`, focus the first invalid field.
- **Loading:** button "იგზავნება…", form at 0.7 opacity, no double submit.
- **Success:** Caveat "¡Gracias!" · "მადლობა! ნინა მალე დაგიკავშირდება" · recap "არხი: {channel} · {timeOfDay}. ერთად შევთანხმდებით პირველი გაკვეთილის დროზე." · button "დახურვა" (mobile: "დაბრუნება საიტზე") · Caveat "¡Hasta pronto!"
- **Server:** `POST /v1/leads` → validate → create Lead → notify Nina (email + optional Telegram message) → 201. Track `lead_submitted` in analytics with `source`.
- Payload: `{ name, phone, email?, channel, goal?, days[], timeOfDay?, note?, consent: true, source, utm?, hp /*honeypot*/, t /*ms since open*/ }`.

---

## 14. STUDENT CABINET: BUILD SPEC

**Reference:** `design/handoff/screens/cabinet-*.html` (C1–C10) + 4 mobile screens + dev sticky notes; `design/handoff/docs/cabinet-spec.md`. Tone: **Calm**. Mid-fi designs, so match structure, spacing, tokens and copy; small polish is allowed.

### 14.1 Shell
- Desktop: 248px sidebar with the 5 items **მთავარი · გაკვეთილები · მასალები · ლექსიკა · პროგრესი**, user block (initial avatar "მ", name "მარიამი", "გასვლა"). Mobile: bottom tab bar with the same 5 items (44px+ targets).
- Routes: `/app` · `/app/lessons` · `/app/lessons/[id]` · `/app/m/[materialId]?lessonId=` · `/app/materials` · `/app/vocabulary` · `/app/progress`.
- Data: server components call the API with forwarded cookies; interactive parts use TanStack Query.

### 14.2 C2 Home — "ჩემი ესპანური"
- Caveat "¡Hola, {nameLatin}!" + "შემდეგი გაკვეთილი: ხუთშაბათი, 3 ოქტ. · 19:00" (from `nextLessonAt`, Tbilisi time, Georgian weekday/month).
- **Continue learning** card: "მიმდინარე" · big lesson number · "LECCIÓN 6 · 26 სექ." · title · "7 / 12 მასალა" · "შემდეგი მასალა: …" · button "გაგრძელება".
- **Homework** card: "2 დარჩა" · rows with title + "ვადა: 2 ოქტ." · completed rows show "შესრულებული".
- **From Nina** card: date · quote-styled note · linked personal material chip "პირადი · Transporte en Valencia".
- **Mini Poco a Poco path**: "Poco a Poco · შენი გზა · სრულად →" with stops (✓ done, "ახლა", upcoming, A1).
- Empty state on first login (C10): Caveat "¡Bienvenida!" · "შენი პირველი გაკვეთილი ნინასთან მალე დაიწყება" · "გაკვეთილის შემდეგ მასალები აქ გამოჩნდება." · next lesson date chip. (Use "¡Bienvenido!" when the profile says so; add an optional `greetingForm` field, default feminine per the design.)

### 14.3 C3 My lessons — "Mis lecciones / ჩემი გაკვეთილები"
- Tabs: ყველა · N / მიმდინარე / დასრულებული.
- Table (desktop) / cards (mobile): № · თარიღი · სათაური · თემები (chips) · სტატუსი (ახალი / მიმდინარე / ✓ დასრულებული) · მასალები "completed / assigned" · ›
- Order: newest first; the current/new lesson row has a warm background. Only ready lessons.

### 14.4 C4 Lesson page (core)
- Breadcrumb "გაკვეთილები / გაკვეთილი 6".
- Overline "LECCIÓN 6 · 26 სექტემბერი" · H1 title · topic chips "თემა 14 · საკვები და სასმელი" …
- "ნინას შენიშვნა" callout.
- "მასალები · 7 / 12 დასრულებული · ნინას თანმიმდევრობით".
- Items grouped by `groupLabel` in Nina's order; each row: type icon + tint · title · meta ("ვიდეო-დიალოგი · 2:10", "ბარათი 9:16 · 4 ცალი", "ინტერაქტიული სავარჯიშო · 8 ნაბიჯი · 3/8", "PDF · 2 გვ.") · status ring (empty / half / sage ✓) · status text (არ დაწყებულა / გახსნილი / ✓ დასრულებული) · for passive opened items "✓ მონიშნე დასრულებულად" · for in-progress exercises "გაგრძელება".
- Right rail (desktop): progress "7 / 12 მასალა · 58%", homework list with due dates, Caveat "Poco a poco" spot. Mobile: rail content moves below the list.
- One continuous list, no pagination.

### 14.5 C5 Material viewers
One shared viewer header: back · type icon · title · ← → (prev/next within the same lesson) · "დასრულებულად მონიშვნა". Opening a viewer calls `/open`. Frames:
- **Image card 9:16:** zoom (− / +, pinch on mobile), prev/next, swipe on mobile ("← გადაფურცლე → · pinch = zoom"), page "2 / 4".
- **Video:** custom controls (time, CC, speed 1×), dialogue below with the current line highlighted (use VTT cue times or line timestamps).
- **Audio:** waveform (precomputed peaks), speeds 0.75× · 1× · 1.25×, "TRANSCRIPCIÓN" with EN toggle.
- **Document:** PDF preview with page thumbnails, "ჩამოტვირთვა", page "1 / 2".
- **Dialogue:** bubbles with speaker initials, ES / ES+EN segmented toggle, ▶ per line when audio exists ("ყოველ ხაზს აქვს ▶ აუდიო (თუ ატვირთულია)").
- **Pronunciation:** lowercase graphemes in pale-green organic circles; tap = audio; example words below.
- **Grammar, Story, Graded reader, HTML embed:** follow the same frame (not all drawn; derive from tokens and the frames above).
- **Exercises** open in the same frame → C6.

### 14.6 C6 Exercise player
Section 8.3. Build `ExerciseFrame` + the 9 templates + completion screen, desktop step-by-step and mobile continuous scroll with a sticky check button. Resume from `lastStep`.

### 14.7 C7 My materials — "Mis materiales / ჩემი მასალები"
- Type filter chips (multi): ყველა · ბარათები · ლექსიკა · დიალოგები · ვიდეო · აუდიო · დოკუმენტები · სავარჯიშოები · საშინაო · პირადი.
- Topic filter "თემა: ყველა ▾" (options only up to the last covered topic) + search (title + tags).
- Grid of material cards: title · "type · გაკვ. N · თემა N" · status · badges "პირადი", "საშინაო · 2 ოქტ.". Click → viewer.

### 14.8 C8 Vocabulary — "Mi vocabulario / ჩემი ლექსიკა · 142 სიტყვა"
- "თემამდე: 16 · თავაზიანი თხოვნა ▾" filter · button "ბარათებად ვარჯიში" (flashcards mode: ES front, KA/EN back, shuffle) · category chips ყველა · მისალმება · რიცხვები · კაფეში · ზმნები · ★ პირადი.
- Table: ესპანური · ქართული / EN · გამოთქმა (pale-green circle only for tricky letters, else "—") · თემა. Personal words marked ★ with a "პირადი · Valencia" label.

### 14.9 C9 Progress — "Poco a poco · ჩემი პროგრესი · A1"
- 4 stat cards: lessons count · topics "16 / 45 თემა გავლილი" · materials "45 / 59 მასალა დასრულებული" · "2 checkpoint ჩაბარებული".
- Blocks list with bars ("✓ 4/4", "3/5", "0/4"; "…ბლოკები 7–10").
- Checkpoints: per block score ("19 / 20"), locked "გაიხსნება ბლოკის ბოლოს", final "A1 · საბოლოო შემოწმება — კურსის ბოლოს".

### 14.10 C10 States
- **Empty** (above). **Loading:** skeletons that mirror the real layout; spinners only inside buttons. **Error:** Caveat "¡Uy!" · "მასალა ვერ ჩაიტვირთა" · "შეამოწმე ინტერნეტი და სცადე თავიდან. პროგრესი შენახულია." · "თავიდან ცდა" · "გაკვეთილზე დაბრუნება".
- Next.js `loading.tsx` / `error.tsx` per route use these components.

### 14.11 Cabinet rules (enforce in review)
Cream/beige backgrounds only · no dark mode · printed fonts inside exercises · no textbook names · max 5 nav items · continuous scroll · restart returns to the start of the exercise · no name entry.

---

## 15. ADMIN PANEL: BUILD SPEC (NOT DESIGNED, BUILD FROM THIS)

**Look:** Calm tone, same tokens, Montserrat/FiraGO, `paper` background, `card` surfaces, teal primary. Utility-first and dense (tables, split panes), but never generic grey SaaS. Use shadcn/ui components themed with the tokens. Georgian UI labels. Desktop-first; usable on tablet; mobile read-only is acceptable.

**Navigation (left sidebar):** მთავარი (Dashboard) · ლიდები (Leads) · მოსწავლეები (Students) · ბიბლიოთეკა (Library) · კურიკულუმი (Curriculum) · ლექსიკა (Vocabulary) · მედია (Media) · შაბლონები (Lesson templates) · AI ასისტენტი · Social Studio (disabled "მალე" until Phase 9) · პარამეტრები (Settings).

### 15.1 Dashboard
New leads count, upcoming lessons (from `nextLessonAt`), students with overdue homework, recent completions, AI drafts awaiting review.

### 15.2 Leads
Kanban or table by status (NEW → CONTACTED → TRIAL_SCHEDULED → TRIAL_DONE → CONVERTED / LOST). Card shows name, phone (tap-to-copy, WhatsApp/Telegram deep links), channel, goal, days + time of day, note, source, created. Actions: change status, add note, **Convert to student** (prefills name/phone/email/goal → creates account → sends invite).

### 15.3 Students
- List: name, current lesson, next lesson time, progress %, last activity, invite status.
- **Student detail** (tabs):
  - **Overview:** profile (goal, channel, phone), gift lessons left, next lesson datetime (editable), quick actions (new lesson, add note, add personal material).
  - **Lessons:** timeline; create lesson (number auto-increments), from template, or duplicate a previous one.
  - **Progress:** per-material status, exercise attempts with answers and scores, checkpoints.
  - **Notes:** "ნინასგან" notes (visible to student) and private notes.
  - **Checklist:** teacher-only checklist items (per lesson or general). This is the "teacher-only per-student checklist" from Nina's original requirements.
  - **Personal vocabulary** and **personal materials**.
  - **Preview as student** (opens the cabinet in read-only impersonation mode with a banner).

### 15.4 Lesson editor (most important admin screen)
Split view:
- **Left:** library browser (search, type filter, topic filter, "used by this student already" indicator) with drag handles.
- **Right:** the lesson: title, date, topics (multi-select), note from Nina, and **groups** (add/rename/reorder group labels like "1 · ვხედავთ სიტუაციას"). Drag materials into groups; reorder (dnd-kit with keyboard). Per item: kind (lesson material / homework / review), due date for homework, ready toggle.
- Actions: **"მოსწავლისთვის მზადაა" (Ready for student)** toggle for the whole lesson. Once ready, bookkeeping controls collapse (per Nina's original checklist requirement) and a "shown to student" badge appears. **Preview** as student. **Save as template.**
- Quick create: "new material" inline (opens the material editor in a drawer, returns and inserts it).

### 15.5 Library (materials)
- Table/grid with type icon, title, status (draft/published/archived), origin (manual / AI / imported), topics, tags, usage count, updated.
- Filters: type, status, origin, topic, tag, "personal for student", search.
- **Material editor** per type (drawer or full page), always with a **live student preview** pane using the real cabinet renderer:
  - INFO_CARD: multi-image upload, order pages, alt text.
  - VOCAB: list editor (es / ka / en / audio / image per row) or image mode; bulk paste from spreadsheet (tab-separated).
  - DIALOGUE: speakers (pick from Ana, Laura, Lucas, Nina, Camarero… or custom), line editor (speaker, es, en, audio), full audio.
  - STORY: composite editor linking characters, place, context, vocab, dialogue, grammar, culture, follow-ups.
  - VIDEO / AUDIO: upload, captions (VTT upload or generate later), transcript as dialogue.
  - DOCUMENT / GRADED_READER: upload, download toggle.
  - GRAMMAR: TipTap editor + examples.
  - PRONUNCIATION: graphemes + audio per grapheme + examples.
  - **EXERCISE / GAME / CHECKPOINT: Exercise builder** (15.6).
  - HTML_EMBED: upload bundle, entry file, test in sandbox, completion reporting check.
- Publish creates a revision. Show "used by N students / M lessons" before editing a published material ("changes will update for everyone").

### 15.6 Exercise builder
- Pick a template (cards with meta from the registry, including variants and "best for").
- Step editor generated from the template's zod schema (typed forms per step type), reorder steps, duplicate, delete.
- Live preview in the real `ExerciseFrame` (desktop and mobile toggle), with a "play as student" mode.
- Validation errors inline (zod). A draft can be saved invalid; publishing requires valid content.
- "Ask AI" button: opens the assistant with context (topic, template, current draft) to fill or vary steps.

### 15.7 Curriculum
Course → Blocks (order, titleEs, titleKa, checkpoint material) → Topics (number, titleKa, titleEs, internal ref). Drag reorder. Shows materials per topic. Import from the syllabus spreadsheet (Section 24).

### 15.8 Vocabulary (master glossary)
Table with es / ka / en / pronunciation / topic / category / audio. Filters, inline edit, CSV/XLSX import/export, find duplicates.

### 15.9 Media
All assets with type, size, status, dimensions/duration, usage. Upload (drag and drop, multiple), retry failed processing, delete unused.

### 15.10 Settings
Price, lesson minutes, gift lessons count, checkpoint pass threshold, contacts, social URLs, lesson platform, FAQ overrides, lead notification targets (email, Telegram chat id), AI model and monthly budget cap.

---

## 16. AI ASSISTANT (ADMIN AGENT CHAT)

### 16.1 Goal
Nina chats with an assistant in the admin panel. She describes what she needs ("for lesson 6 with Mariam, 3 exercises on querer in a café situation, different formats, use Ana and Lucas"), and the assistant **creates drafts** of exercises and materials using the platform's own contracts. It can also search the library, reuse vocabulary, and propose lesson structures. **It never publishes or shows anything to students by itself.** Nina reviews, edits and publishes.

### 16.2 Architecture
```
Admin UI (/admin/assistant)
  └─ SSE ◀── POST /v1/admin/ai/threads/:id/messages
                 └─ AgentRuntime (apps/api/src/modules/ai)
                      ├─ Anthropic Messages API (streaming, tool use)   model = env AI_MODEL
                      ├─ System prompt = brand + pedagogy + rules (built from docs + tokens)
                      ├─ Tools (zod-typed, see 16.3) → call internal services, not HTTP
                      ├─ Persists AgentMessage / AgentRun (tokens, cost)
                      └─ Long tasks → pg-boss job "ai.long_task" (Claude Agent SDK / Claude Code headless)
```
- **Provider abstraction:** `LLMProvider` interface with an Anthropic implementation. Model id, max tokens and budget come from env/settings. Do not hardcode model names.
- **Streaming:** SSE events `token`, `tool_call`, `tool_result`, `draft_created`, `done`, `error`. The UI renders tool activity compactly ("created draft: Sentence builder · ¿Qué vas a tomar?") with an inline preview card and buttons **Open in editor** / **Publish** / **Add to lesson**.
- **Context passing:** the chat can be opened from a lesson, a material, a student or the exercise builder. The UI sends a `context` object (ids), and the runtime loads the relevant records into the first turn.
- **Guardrails:** tools that create content only create `status = DRAFT`, `origin = AI_AGENT`, plus a `MaterialRevision` noting the thread. Tools cannot set `readyForStudent`, cannot delete, cannot email. Budget cap per month (Settings); refuse when exceeded.
- **Prompt library:** Nina's saved prompts (`PromptTemplate`) appear as quick chips in the chat.

### 16.3 Tools (v1)
| Tool | Purpose |
|---|---|
| `search_materials({ q?, type?, topicIds?, limit })` | Find existing materials to reuse or avoid duplicating |
| `get_material({ id })` | Read full content |
| `list_topics({ courseSlug })` / `get_topic({ id })` | Curriculum context |
| `list_vocabulary({ topicMax?, topicIds?, q? })` | Use known words only (beginners!) |
| `get_student_context({ studentId })` | Goal, covered topics, recent attempts and mistakes (no contact data) |
| `list_exercise_templates()` | Registry meta: ids, variants, bestFor, step limits |
| `create_exercise_draft({ templateId, variant?, title, instructionKa, steps, topicIds, tags })` | Validated against zod; returns draft id + preview URL; on validation failure returns errors so the model can fix them |
| `create_material_draft({ type, title, content, topicIds, tags })` | Dialogue, vocab list, grammar, story, pronunciation |
| `update_draft({ id, patch })` | Only drafts created in the same thread, or explicitly referenced ones |
| `propose_lesson_plan({ studentId, topicIds })` | Returns a proposed grouped item list (not saved) that Nina can apply in the lesson editor |

**Variety rule** (in the system prompt and enforced by a check): within one request, prefer different `templateId`s and variants; do not repeat the same template three times in a row unless asked.

### 16.4 System prompt ingredients
- Who Nina is, tone, the four rules, the inductive method (Mira → Observa → Entiende → Habla), Poco a Poco.
- Level A1 beginners: short sentences, known vocabulary first (use `list_vocabulary`), Spanish + English in dialogues, Georgian instructions (one line), unambiguous correct answers.
- Characters: Ana (Georgian web designer in Barcelona, 27), Laura, Lucas, Nina. Consistent personalities.
- Never mention the textbook name. No emoji in content. Culture woven in (café, directions, dance) where natural.
- Output only via tools; after tools, reply briefly in Georgian summarizing what was drafted.

### 16.5 Phase 2 of AI (later): bespoke interactive exercises
For requests that no template covers, a background job runs a **coding agent** (Claude Agent SDK or Claude Code headless) in an isolated temp workspace with a starter kit (brand CSS tokens, the `nina:*` postMessage bridge, rules). It produces an `HTML_EMBED` bundle (static HTML/CSS/JS, no external network), which is uploaded as a draft for Nina to review in the sandbox preview. Limits: time, size, no network at runtime, CSP.

### 16.6 Later AI features (keep interfaces open)
TTS audio for dialogue lines and vocabulary (store as MediaAsset) · image generation for cards in Nina's style (reviewed) · feedback on students' written homework · automatic VTT captions from video audio.

---

## 17. SOCIAL STUDIO (RESERVED MODULE)

> Cursor: you do not have this code yet. The owner has an existing **Social Studio** system from another project and will port it here. **In Phases 0–8, only reserve the structure below; do not implement features.** In Phase 9 we integrate the ported code into this shape.

### 17.1 What it is
An AI-powered social media post generator: an agent that drafts posts (Georgian captions with Spanish accents, hashtags), generates or selects images (multiple image-generation models), renders branded post layouts from HTML templates, and exports them as images via a headless browser (Puppeteer/Playwright), for Instagram/Facebook/TikTok. For Nina it will turn platform content (a vocabulary card, a dialogue, a "¡Viva el error!" tip, a student milestone) into on-brand posts.

### 17.2 Reserved structure
```
apps/api/src/modules/social/
  ├─ README.md                 (describe the module boundary; "to be ported")
  ├─ social.routes.ts          (placeholder router mounted at /v1/admin/social, returns 501)
  └─ ports.ts                  (interfaces below)
apps/web/src/app/(admin)/admin/social/page.tsx   ("მალე" placeholder)
packages/contracts/src/social.ts                  (types below)
```
```ts
// ports.ts — the contract the ported Social Studio must plug into
export interface BrandKit { tokens: TokensJson; logoAssetId: string; fonts: string[]; voiceRules: string[]; characters: string[]; }
export interface SocialPostDraft { id: string; platform: "instagram" | "facebook" | "tiktok"; format: "square_1080" | "portrait_1080x1350" | "story_1080x1920";
  captionKa: string; hashtags: string[]; sourceMaterialId?: string; templateId: string; templateData: Record<string, unknown>;
  assetIds: string[]; status: "draft" | "approved" | "scheduled" | "published"; scheduledAt?: string; }
export interface SocialRenderer { render(templateId: string, data: unknown, format: SocialPostDraft["format"]): Promise<{ assetId: string }>; }
export interface SocialAgent { run(input: { promptKa: string; sourceMaterialId?: string; count?: number }): AsyncIterable<AgentEvent>; }
```
### 17.3 Integration rules for the future port
- Reuse **the same** `MediaAsset` + `StorageDriver` (rendered images are assets), the same **AgentRuntime** (LLM provider, SSE, runs, budget), the same **pg-boss** queue (`social.render`, `social.generate`), and `packages/ui/src/tokens.json` as the BrandKit source.
- Rendering needs a headless Chromium in the Railway image (add to the Dockerfile in Phase 9).
- Publishing to Meta/TikTok APIs is **out of scope** for the first port: export/download + "copy caption" first.
- Tables (Phase 9): `BrandKit`, `SocialTemplate`, `SocialPost`, `SocialAsset`, `GenerationJob`.

---

## 18. BACKGROUND JOBS (pg-boss)
| Queue | Trigger | Work |
|---|---|---|
| `media.process` | upload finished | variants, transcode, posters, peaks, thumbnails |
| `lead.notify` | lead created | email + Telegram to Nina |
| `auth.invite` | student created / resend | send invite email |
| `ai.long_task` | AI tool or request | bespoke HTML_EMBED generation, bulk drafts |
| `backup.db` | nightly cron | pg_dump to off-site storage |
| `backup.volume` | weekly cron | sync `/data/orig` off-site |
| `social.*` | Phase 9 | generation, rendering |
All jobs are idempotent, retried with backoff, and logged.

---

## 19. NOTIFICATIONS AND EMAIL
- Resend with a verified domain. Templates in Georgian, branded (cream, logo, teal button), plain-text fallback.
- Emails: student invite ("ნინამ შენთვის კაბინეტი შექმნა"), password reset, new lead alert to Nina.
- Optional Telegram bot message to Nina for new leads (name, phone, channel, goal, days/time, note, deep links).
- Later (not v1): homework reminders, "new lesson materials are ready" to students.

---

## 20. COPY, I18N, DATES
- UI language: **Georgian** (`<html lang="ka">`). Spanish is content and accent; English only in translations.
- Keep all UI strings in `apps/web/src/messages/ka.ts` (typed object) and landing copy in `content/landing.ka.ts`. Structure it so an English UI can be added later (next-intl compatible), but ship one locale.
- Content fields store `es` / `en` / `ka` explicitly (never auto-translate at runtime).
- Dates: timezone **Asia/Tbilisi**. Use `Intl.DateTimeFormat('ka-GE')` and a small helper for the design's short forms: "26 სექ.", "3 ოქტ.", "ხუთშაბათი, 3 ოქტ. · 19:00". Short month forms: იან. თებ. მარ. აპრ. მაი. ივნ. ივლ. აგვ. სექ. ოქტ. ნოე. დეკ.
- Weekday chips: ორშ სამ ოთხ ხუთ პარ შაბ კვ.
- Currency display: "30 GEL".

---

## 21. SEO, ANALYTICS, ACCESSIBILITY, PERFORMANCE
- **SEO:** Georgian title/description, Open Graph image (hero composition), `Person` + `EducationalOrganization`/`Course` + `FAQPage` JSON-LD, sitemap, robots (disallow `/app`, `/admin`). Canonical domain.
- **Analytics:** Vercel Analytics or Plausible (privacy-friendly). Events: `cta_click {source}`, `booking_open {source}`, `lead_submitted {source}`, `login`, `material_open {type}`, `exercise_complete {templateId, score}`.
- **Accessibility (WCAG AA):** real buttons/links/labels; `aria-pressed` on chips/toggles; `aria-expanded` on FAQ; `aria-invalid` + messages; `role="alert"` for error summary; mustard focus ring 3px / offset 3px; targets ≥ 44px; alt text on meaningful images, `alt=""` on decorative spots; keyboard paths for drag/swipe; reduced motion.
- **Performance:** `next/image` with the webp assets and correct `sizes`; lazy-load below the fold; preload hero image and fonts (Montserrat 600/700, FiraGO subset); landing statically rendered (ISR for settings); Lighthouse targets: Performance ≥ 90 mobile, Accessibility ≥ 95.

---

## 22. ENVIRONMENTS, DEPLOYMENT, ENV VARS

### 22.1 Environments
- **Local:** `docker compose` for Postgres; API with `STORAGE_ROOT=./.data`; web on `localhost:3000`, api on `localhost:4000` (cookie domain `localhost`).
- **Staging:** Vercel preview + Railway staging environment (separate DB and volume).
- **Production:** `www.{DOMAIN}` / `{DOMAIN}` (Vercel), `api.{DOMAIN}` (Railway), `embed.{DOMAIN}` (Railway, same service, host-based routing).

### 22.2 Railway
- Services: `api` (Dockerfile with Node LTS + ffmpeg, optional LibreOffice; runs Fastify + pg-boss workers), `postgres`.
- Volume mounted at `/data` on `api`.
- Run `prisma migrate deploy` on release.
- Health check `/v1/health`.

### 22.3 Vercel
- Project root `apps/web`, Turborepo build. Env per environment.

### 22.4 Env vars
```
# web
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_EMBED_ORIGIN=
NEXT_PUBLIC_SHOW_DRAFT_NOTES=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=        (optional)

# api
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
COOKIE_DOMAIN=.{DOMAIN}
WEB_ORIGIN=https://{DOMAIN}
STORAGE_DRIVER=local                   # local | s3
STORAGE_ROOT=/data
MEDIA_SIGNING_SECRET=
S3_ENDPOINT= S3_BUCKET= S3_ACCESS_KEY= S3_SECRET_KEY=   (later)
RESEND_API_KEY=
MAIL_FROM="Nina – Tu Profe de Español <hola@{DOMAIN}>"
LEAD_NOTIFY_EMAIL=
TELEGRAM_BOT_TOKEN= TELEGRAM_CHAT_ID=  (optional)
TURNSTILE_SECRET=                      (optional)
ANTHROPIC_API_KEY=
AI_MODEL=                              # set to the current Claude model id
AI_MONTHLY_BUDGET_USD=
```

---

## 23. TESTING AND VISUAL QA
- **Unit (Vitest):** exercise-engine graders for every template, derived status logic (7.1), vocabulary filtering, lead validation, signed URL checks, "textbook name never leaks" serializer test.
- **API integration:** student cannot read another student's lesson/material/asset; unready items invisible; admin-only routes guarded.
- **E2E (Playwright):** booking happy path + errors; invite → set password → first login empty state; open lesson → open video → mark done; complete one exercise of each template (keyboard only for drag/swipe); admin creates lesson → ready → student sees it.
- **Visual QA:** after each landing/cabinet section, capture a Playwright screenshot at 1440 and 390 and compare side by side with `design/handoff/screenshots/*`. Fix differences in spacing, type, color, copy. (Suggested prompt in 25.)
- Accessibility checks with axe in Playwright.

---

## 24. SEED DATA AND CONTENT MIGRATION

### 24.1 Seed (dev/staging) — matches the mockups
- Admin: Nina. Student: **მარიამი / Mariam**, goal travel (Valencia), next lesson Thursday 3 Oct 19:00.
- Course A1 with 10 blocks (working titles: ¡Hola! · Me presento · En el café · ¿Dónde está? · Mi día · Mi familia · De compras · … · A1) and 45 topics (placeholders, including 14 "საკვები და სასმელი", 15 "querer / quiero", 16 "თავაზიანი თხოვნა", 9 "რიცხვები 1–20", 3 "თავის გაცნობა", 1 "მისალმება").
- Lessons 1–7 as in C3 (1 ¡Hola! — პირველი შეხვედრა · 2 El alfabeto y los sonidos · 3 Me presento · 4 Ana en Barcelona · 5 Los números y la hora · 6 En el café — შეკვეთა (in progress, 7/12) · 7 ¿Dónde está el metro? (new, 0/9)).
- Lesson 6 items with groups exactly as in C4, homework ("დაწერე დიალოგი" due 2 Oct, "მოუსმინე: Diálogo 3" due 3 Oct), personal material "Transporte en Valencia", note from Nina (24 Sep).
- Counts consistent with the design: 45 of 59 materials completed, topic 16 of 45, 142 vocabulary words, checkpoints block 1 19/20, block 2 17/20.
- One sample of each exercise template with the design's content (C6).

### 24.2 Real content migration (Nina's existing materials)
| Existing | Import as |
|---|---|
| ~45 syllabus cards (Excel syllabus workbook) | `Course/Block/Topic` via an XLSX import script (`packages/db/scripts/import-syllabus.ts`); textbook mapping goes to `Topic.internalRef` only |
| Master vocabulary glossary (tagged by card) | `VocabularyEntry` via CSV/XLSX import (topic by card number) |
| Visual cards (images) | `INFO_CARD` / `VOCAB` (image mode) materials |
| Animated dialogue videos | `VIDEO` with dialogue text |
| Interactive HTML exercise library | `HTML_EMBED` (bridge added), and gradually re-authored as native templates |
| Graded reader (Ana Danelia) | `GRADED_READER` |
| Assessment tools | `CHECKPOINT` (native) or `HTML_EMBED` |
Imports are idempotent (upsert by a stable `importKey`).

---

## 25. BUILD PHASES WITH READY-TO-PASTE CURSOR PROMPTS

Work phase by phase. After each phase: run tests, run the visual QA prompt, commit. `design/handoff/docs/CURSOR_PROMPTS.md` has the designer's frontend prompts; the prompts below include them and add the backend.

**Phase 0 — Monorepo and infrastructure**
> Read `docs/BUILD_GUIDE.md` sections 0, 4, 5, 6, 22. Create the pnpm + Turborepo monorepo exactly as in section 6 (apps/web Next.js App Router with Tailwind v4, apps/api Fastify + TypeScript, packages/db Prisma, packages/contracts, packages/ui, packages/exercise-engine, packages/config). Add docker-compose for Postgres, env examples from 22.4, a Dockerfile for apps/api with ffmpeg, and `/v1/health`. Do not build features yet.

**Phase 1 — Foundation, tokens, primitives, /styleguide**
> Read sections 3 and 0.4 and `.cursor/rules/nina-design-system.mdc`. Copy assets and fonts per 0.4. Set up `next/font/local` for Montserrat, FiraGO (Georgian-only unicode-range, stack `"FiraGO","Montserrat",system-ui,sans-serif`) and Caveat. Import `tailwind-v4-theme.css` and `tokens.css` from packages/ui. Build every component in 3.5 and the Icon component (SVG paths from `design/handoff/screens/design-system.html` section 06). Build `/styleguide` rendering all of them with all states, matching `design/handoff/screenshots/design-system*.jpg`.

**Phase 2 — Database and API core**
> Read sections 7, 9, 10. Implement the Prisma schema from section 7 and migrations. Set up Better Auth (email + password, no public sign-up, invites, reset) with cookies on COOKIE_DOMAIN. Implement role guards, public/settings, leads (with rate limit + honeypot), and the derived logic in 7.1 with unit tests. Add the seed from 24.1.

**Phase 3 — Landing page**
> Read section 12 and `design/handoff/docs/landing-spec.md`. Build the landing page section by section in `apps/web/src/components/landing/`, one component per section, copy from `content/landing.ka.ts`, responsive (390 → 1440), matching `design/handoff/screens/landing-*.html` and screenshots. Include the header scroll states, mobile menu, EN toggle, Spanish in Action, FAQ accordion, path SVG, and reduced motion. Build section by section and show me each one.

**Phase 4 — Booking flow**
> Read section 13. Build the booking modal (desktop) and sheet (mobile) with all states (form, errors, loading, success), URL state `?book=1&source=`, and connect to `POST /v1/leads`. Add lead notifications (email + optional Telegram) as pg-boss jobs.

**Phase 5 — Media service**
> Read section 11 and 9.5. Implement StorageDriver (local volume), streaming multipart upload, pg-boss `media.process` with sharp/ffmpeg/pdf thumbnails and audio peaks, signed media URLs with Range support, and authorization checks. Add tests.

**Phase 6 — Cabinet shell, auth pages, home, lessons, lesson page**
> Read section 14.1–14.4 and 14.10, `design/handoff/docs/cabinet-spec.md`. Build login/forgot/reset/invite pages, the cabinet shell (sidebar + mobile tab bar), Home (with empty state), My lessons, Lesson page with grouped items, status rings, mark-as-done, loading/error states. Use the student API endpoints from 9.3.

**Phase 7 — Viewers and exercise engine**
> Read sections 8 and 14.5–14.6. Implement zod content contracts in packages/contracts, graders in packages/exercise-engine (unit-tested), all viewers, the ExerciseFrame with the template registry and all 9 templates with variants, completion screen, resume, server-side grading on submit, HTML_EMBED sandbox + postMessage bridge.

**Phase 8 — Library, vocabulary, progress (student) + Admin panel**
> Read sections 14.7–14.9 and 15. Build the student library, vocabulary (with flashcards) and progress pages. Then build the admin panel: leads (with convert), students (all tabs, preview as student), lesson editor (drag and drop, groups, ready toggle, templates), library + per-type material editors with live preview, exercise builder, curriculum, vocabulary import, media, settings.

**Phase 8b — AI assistant**
> Read section 16. Implement the LLMProvider abstraction (Anthropic), AgentRuntime with SSE streaming, persisted threads/runs, the tools in 16.3 (drafts only, zod-validated, with error feedback to the model), budget cap, prompt library, and the admin chat UI with draft preview cards and "Open in editor / Add to lesson".

**Phase 9 — Social Studio integration (when the owner provides the code)**
> Read section 17. Integrate the provided Social Studio code into `modules/social` using the existing MediaAsset, StorageDriver, AgentRuntime, pg-boss and tokens.json. Add the Phase 9 tables and headless Chromium to the API image.

**Phase 10 — Hardening and launch**
> Read sections 21 and 23. Add SEO/JSON-LD, analytics events, axe checks, Playwright e2e suite, backups jobs, error monitoring, and a production checklist.

**Visual QA prompt (use after every UI step)**
> Take Playwright screenshots of `<route>` at 1440 and 390 widths. Compare them with `design/handoff/screenshots/<file>.jpg`. List every difference in layout, spacing, font size/weight, colors, radii, copy and illustration crop, then fix them. Tokens only, no hardcoded hex.

---

## 26. OPEN ITEMS AND PLACEHOLDERS
Keep placeholders visible in staging and tracked in `docs/OPEN_ITEMS.md`; never ship `[bracket]` text to production (add a build-time check that fails on `[` placeholders in `landing.ka.ts` when `NODE_ENV=production`, overridable).
1. Laura's and Lucas's short descriptions.
2. Lesson platform (Zoom / Google Meet), recommended frequency, payment method and terms, missed-lesson/reschedule policy.
3. Footer contacts and social URLs; consent text; privacy policy and terms pages.
4. Final block names (path, progress) and topic list.
5. Georgian copy: all landing copy is draft; Nina finalizes.
6. Illustrations: remaining small sneaker logos on some spots/scenes need retouching; favicon from the logo's portrait detail (hair + glasses), never the frame alone.
7. Domain name (`{DOMAIN}`).
8. Greeting form ¡Bienvenida! / ¡Bienvenido! per student.
9. Payments online (not in scope v1).

---

## 27. APPENDIX: UI LABEL GLOSSARY (GEORGIAN)
| Key | ka |
|---|---|
| nav.home | მთავარი |
| nav.lessons | გაკვეთილები |
| nav.materials | მასალები |
| nav.vocabulary | ლექსიკა |
| nav.progress | პროგრესი |
| auth.login | შესვლა |
| auth.logout | გასვლა |
| auth.forgot | დაგავიწყდა პაროლი? |
| cta.book | დაჯავშნე საცდელი გაკვეთილი |
| cta.book.short | საცდელი გაკვეთილი |
| gift.line | პირველი 2 გაკვეთილი — საჩუქრად |
| status.new | ახალი |
| status.inProgress | მიმდინარე |
| status.done | დასრულებული |
| material.notStarted | არ დაწყებულა |
| material.opened | გახსნილი |
| material.completed | დასრულებული |
| material.markDone | მონიშნე დასრულებულად |
| action.continue | გაგრძელება |
| action.check | შემოწმება |
| action.next | შემდეგი → |
| action.download | ჩამოტვირთვა |
| action.retry | თავიდან ცდა |
| action.backToLesson | გაკვეთილზე დაბრუნება |
| homework | საშინაო დავალება |
| fromNina | ნინასგან |
| personal | პირადი |
| ninaNote | ნინას შენიშვნა |
| type.card | ბარათი |
| type.vocab | ლექსიკა |
| type.dialogue | დიალოგი |
| type.video | ვიდეო |
| type.audio | აუდიო |
| type.document | დოკუმენტი |
| type.exercise | სავარჯიშო |
| type.pronunciation | გამოთქმა |
| type.grammar | გრამატიკა |
| type.game | თამაში |
| type.checkpoint | checkpoint |
| form.name | სახელი |
| form.phone | ტელეფონი |
| form.email | ელ-ფოსტა |
| form.optional | (არასავალდებულო) |
| form.channel | როგორ დაგიკავშირდე? |
| form.goal | რისთვის გინდა ესპანური? |
| form.days | სასურველი დღეები |
| form.timeOfDay | დღის მონაკვეთი |
| form.note | შენიშვნა |
| form.consent | ვეთანხმები, რომ ნინამ ჩემი მონაცემები გამოიყენოს დასაკავშირებლად |
| form.submit | გაგზავნა |
| form.sending | იგზავნება… |
| form.errorSummary | გთხოვ, შეავსე მონიშნული ველები. |
| form.success | მადლობა! ნინა მალე დაგიკავშირდება |

*End of guide.*
