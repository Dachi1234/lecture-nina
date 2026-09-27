# Nina – Tu Profe de Español · Design decisions log

**Purpose of this file:** a record of what was designed, which decisions were made and why, and where the design deviates from or adds to the original brief (`Nina_Claude_Design_Brief.md`). It is meant to be read **together with** the handoff package (`nina-design-handoff.zip`) and the platform architecture, so a comprehensive build guide for Cursor can be written from all three.

- Date: 26 September 2026
- Inputs: the design brief (MD), the logo, and 10 illustrations (study room, café chalkboard, standing Nina, stone wall, terrace desk, café with four friends, character sheet, cross-legged Nina, walking Nina, logo).
- Outputs:
  1. a Design canvas (claude.ai artifact) with 23 artboards on 3 pages
  2. `nina-design-handoff.zip` for Cursor
  3. `nina-original-illustrations.zip` (optional, originals only)

---

## 1. What was delivered

### 1.1 Design canvas (source of truth for visuals)
Three pages:

| Page | Artboards |
|---|---|
| **Landing page** (high fidelity) | Desktop 1440 (split into 2 artboards: header → materials, cabinet → footer) · Mobile 390 (2 artboards: header → stories, lesson steps → footer) · Mobile menu (open) · Booking modal desktop (interactive, 4 states) · Booking sheet mobile (with an error example) · Booking success mobile |
| **Design system** | One style guide artboard: colors, type, buttons, forms, chips/badges/cards, icons, graphic language, illustration and logo rules, spacing/radii/elevation/motion, header states |
| **Student cabinet** (mid fidelity, developer reference) | C1 Login · C2 Home · C3 My lessons · C4 Lesson page · C5 Material viewers · C6 Exercise player (shared frame + 9 layouts + completion) · C7 Library · C8 Vocabulary · C9 Progress · C10 Empty/loading/error states · 4 mobile screens (home, lesson, image-card viewer, exercise) + developer sticky notes (data model, status language, mobile rules) |

**Why the landing pages are split:** the canvas limits an artboard to 8000px tall. Desktop is about 10,480px and mobile about 11,700px, so each is split into two artboards. The handoff merges each back into one continuous page.

### 1.2 Handoff package (`nina-design-handoff.zip`, 10 MB)
| Folder | Contents |
|---|---|
| `screens/` | 24 self-contained HTML files (converted from the canvas, local assets, offline fonts). Landing desktop has working FAQ, EN toggle and Spanish in Action in vanilla JS. Booking desktop is exported in 4 state files. |
| `screenshots/` | Full-page JPG of every screen (desktop @1x, mobile @2x) |
| `tokens/` | `tokens.css` (CSS variables + base styles) · `tailwind.config.js` (v3) · `tailwind-v4-theme.css` · `tokens.json` (W3C-style) |
| `assets/` | Logo, 8 illustrations, 11 transparent "spot" poses, fonts + `fonts.css` + OFL licences |
| `docs/` | `landing-spec.md`, `cabinet-spec.md`, `components.md`, `assets.md`, `open-items.md`, `CURSOR_PROMPTS.md`, original `brief.md` |
| `.cursor/rules/nina-design-system.mdc` | Always-applied Cursor rule with the design constraints |
| `source/` | Raw canvas files (`.dc.html`, `canvas.json`), for reference only |

---

## 2. Global decisions

### 2.1 Aesthetic direction
- **Direction:** an "illustrated editorial Mediterranean notebook". Warm cream paper, hand-drawn accents (mustard brush underlines, open brush circles echoing the logo frame, washi-taped notes, dashed "stamp" borders, dotted paths) and generous whitespace. Nina's illustrations carry the personality, and the UI stays clean and adult.
- **Why:** the brief asks for "Nina's own illustrated Spanish world", explicitly not an LMS, kids app, Duolingo or tourism site. The illustrations are already rich, so the UI was kept restrained so they could lead.
- **Lively vs Calm rhythm** is implemented literally, section by section (see 3.1).
- No design system existed in the account, so the system was built from the brief's palette and fonts.

### 2.2 Color
- Used the brief's **Nina Colors exactly**: `#196166 #0A414F #841B22 #F5B246 #D0AC84 #5B8A81`, with paper `#FCF7E6`.
- **Added**, derived from the palette (the brief only gave accents):
  - soft tints: teal-soft `#DCEAE6`, burgundy-soft `#F4DEDA`, mustard-soft `#FCE8C0`, sage-soft `#E0EAE3`
  - surfaces: paper-deep `#F6EDD3`, sand-soft `#F1E3C8`, card `#FFFCF3`, exercise beige `#F3EAD6`
  - lines: `#E4D3B4`, `#EFE3CB`, tile border `#C9B08E`
  - hover shades: teal `#124D51`, burgundy `#6C141A`
  - muted text `#4A6268`
  - status text inks: `#7A4A00` on mustard-soft, `#34605A` on sage-soft
  - pronunciation green `#D6E9C9`
  - terracotta `#C8734B` (illustration detail on the path map only)
- **Contrast was checked programmatically:**

  | Pair | Ratio |
  |---|---|
  | Navy on paper | 10.4:1 |
  | Muted on paper | 6.0:1 |
  | Paper on teal | 6.65:1 |
  | Paper on burgundy | 9.1:1 |
  | Status inks on their tints | 5.8–6.2:1 |

  Mustard and sand are never used as text on cream.
- **Big saturated fills:** navy is used for only two full sections, Stories (the signature moment) and the footer, plus one feature card. Everything else uses cream, sand or tints, as the brief requires.
- No dark mode anywhere.

### 2.3 Typography
- Montserrat for Latin/Spanish, FiraGO for Georgian, Caveat for handwritten accents, as the brief specifies.
- **Key technical decision:** FiraGO is not on Google Fonts, so it was taken from the `@fontsource/firago` npm package (OFL) and registered with a **Georgian-only `unicode-range`** (`U+10A0-10FF, U+1C90-1CBF`). The stack is `"FiraGO", "Montserrat", system-ui, sans-serif`. Result: in mixed lines ("ესპანური — Poco a Poco"), Georgian renders in FiraGO and Latin in Montserrat automatically, with no per-language classes needed. A subset of about 23 KB per weight is used; the full files are included too.
- Caveat is used only for short Spanish accents: ¡Hola!, Conóceme, Poco a Poco, ¡Vamos!, Mis reglas, Un día a la vez, character name tags. Never Georgian, never body text, never inside exercises.
- **Scale:** the brief's scale (Display 64 / H1 48 / H2 36 / H3 24 / Body 18 / Small 14, body line height 1.6) was kept, with two additions:
  - landing section titles use **46px** (36 felt too small at 1440 against the illustrations)
  - the hero brand word "Nina" is **120px** (72 on mobile)
- Uppercase overlines (VOCABULARIO, DIÁLOGO, LECCIÓN 6) are Latin only, since Georgian has no case.

### 2.4 Shape, spacing, motion
- **Radii:**
  - 8 for tags and tiles
  - 12 for inputs and buttons
  - 14 for large CTAs
  - 16 for cards
  - 20 for panels and exercises
  - 24 for the modal and big panels
- Pills are for chips only; primary buttons are never pill-shaped (per "not everything pill-shaped").
- **Image masks:** an organic blob, a Mediterranean arch, and a curved half-bleed edge.
- **Spacing:** 4pt scale. Desktop grid is 12 columns, 80px margins, 24px gutter, 1280px container. Mobile is 20px margins.
- **Motion:**
  - hover lift: −2px on buttons, −4px on cards
  - hero "¡Hola!" writes itself (clip-path reveal)
  - hero Nina floats gently
  - modal pops in
  - accordion plus rotates to ×
  - springy Spanish in Action dot
- All motion is disabled under `prefers-reduced-motion`.

### 2.5 Icons
A custom line-icon set was drawn: 24px grid, 1.75 stroke, round caps and joins, about 20 icons. Every material type has its own icon and tint (the table is in `docs/components.md`). No emoji anywhere in the UI.

### 2.6 Accessibility
- Real `<button>`, `<a>` and `<label>` elements, even in mockups.
- `aria-pressed` on choice chips and toggles, `aria-expanded` on FAQ questions, `aria-invalid` plus messages on form errors, `role="alert"` on the error summary.
- Visible mustard focus ring (3px, 3px offset).
- Touch targets ≥ 44px.
- Alt text on meaningful images; `alt=""` on decorative spots.

---

## 3. Landing page decisions

### 3.1 Section order and tone
Header · Hero (L) · Meet Nina (C) · What makes it different (L) · **Stories (L, navy)** · How a lesson works + 4 rules (C) · Materials (L) · Your cabinet (C) · Poco a Poco path (C) · Gift (L) · Pricing (C) · FAQ (C) · Final CTA (L) · Footer.
This follows the brief's order exactly. Three Calm sections sit in a row near the end (Cabinet, Path, and after Gift, Pricing and FAQ); they are separated by background changes (paper → paper-deep).

### 3.2 Per-section decisions
- **Header:**
  - The CTA uses teal (the primary UI colour).
  - "შესვლა" is a ghost button with a user icon.
  - Scrolled state: 88 → 68px, sand divider, active item in burgundy with a mustard underline (shown in the design system).
  - The mobile header CTA is shortened to "საცდელი გაკვეთილი" to fit at 390 (the full text is used everywhere else).
- **Hero:**
  - The brand leads, per decision #10: "Nina" (120px) over "Tu Profe de Español" (54px), with a mustard brush underline under "Español".
  - The positioning quote gets a big mustard quote mark rather than a left-border block (avoiding a cliché).
  - The CTA is stacked above the gift line and the "how it works ↓" link. (It started as a single row, but the Georgian CTA wrapped; this was fixed and the button is now `nowrap`.)
  - Nina (asset #3) sits in a sand blob with an open brush circle, a "soy Nina" note and arrow, and two small stars.
  - Mobile uses asset #4 (stone wall) above the text, fading into cream.
- **Meet Nina:**
  - Asset #1 in a blob mask, cropped to remove the book spine and laptop logo.
  - The languages became **five perforated "stamps"**, with Spanish highlighted.
  - Ends with "Un día a la vez." as the brief asks.
  - Nina's own Spanish level is not mentioned.
- **Different:** 6 horizontal cards, each with a tinted illustration strip and a spot pose from the character sheet. Card 6 (Poco a Poco) is inverted navy as the anchor. The right-side line reads "ეს არ არის ენის სკოლა. ეს ნინას ესპანური სამყაროა." (new copy, following the brief's positioning).
- **Stories (signature):**
  - Navy with soft wave edges.
  - Asset #6 in a large arch with Caveat name tags on each character.
  - A 4-line dialogue with **an EN toggle button** instead of hover-only translation. Hover doesn't exist on touch and isn't accessible; the toggle works everywhere.
  - The "Spanish in Action" teaser is a small dance floor where izquierda/derecha/arriba/abajo move a mustard dot wearing round glasses (the logo motif), and the word appears in Caveat.
  - Burgundy CTA (the teal button lacks punch on navy).
- **How a lesson works:**
  - 4 stops on a dotted wave, each with a Spanish Caveat step name (Mira · Observa · Entiende · Habla) and a Georgian title.
  - The rules are pinned notes with washi tape on a sand board. Rule titles were given Spanish hand-lettered names: ¡Nos divertimos! · Con calma · ¡Viva el error! · ¡Desde el día uno!.
- **Materials:**
  - The collage is built from **real HTML mini-materials**, not images: a 9:16 info card, vocabulary card, audio player, pronunciation circles, ES/EN dialogue, and a sentence-builder exercise.
  - No textbook names appear.
  - Mobile uses a horizontal scroll-snap carousel.
- **Cabinet preview:** asset #5 in an arch, plus a desktop and a phone mockup showing a mini version of the real cabinet home, as the brief asks.
- **Poco a Poco path:**
  - A hand-coded SVG landscape: hills, a small town with terracotta roofs, cypresses and arches, and a winding road with 8 stops (3 done, 4 upcoming, A1 check).
  - Block names are **placeholders**: ¡Hola! · Me presento · En el café · ¿Dónde está? · Mi día · Mi familia · De compras · A1.
  - Mobile becomes a vertical list.
- **Gift:** asset #4 half-bleed with a curved edge on desktop. Mobile uses the extra walking illustration so the stone wall isn't repeated (it's already the mobile hero). There are 5 "what happens" items with hand-drawn checks, and a burgundy CTA.
- **Pricing:** one friendly card, not a SaaS table: 30 GEL, 75 წუთი · ონლაინ · 1:1, a gift badge, and 3 included items. The layout can take 2–3 cards later without a redesign. The line "paid lessons start from the 3rd" is included.
- **FAQ:** the brief's 8 questions, one open at a time. Answers to unknown facts are **placeholders** (platform, frequency, payment, missed-lesson policy).
- **Final CTA:** asset #9 in a brush circle on mustard-soft, with "¡Vamos!" and „მოდი, ესპანური ერთად ვისწავლოთ".
- **Footer:**
  - Navy, with the logo on a cream circle.
  - Social links are plain text, with no brand logos.
  - Signature *Nina - Tu Profe De Español* in Montserrat italic.
  - Contact details are placeholders.

### 3.3 Booking form
- **Desktop:** a modal (1000×880) with a left mustard-soft panel (standing Nina, "¡Hola!", gift line). **Mobile:** a full-screen sheet with a sticky submit button. This follows the brief's modal/sheet option, not an inline section.
- **Fields** follow the brief. The only interpretation: "preferred days and times" became **multi-select day chips (ორშ–კვ)** plus a single **time of day** choice (დილა / დღე / საღამო), which is quicker than free text and still structured for the admin.
- **Validation:** name required, phone ≥ 12 digits including 995, consent required. Each error gets an inline burgundy message, and a summary line appears under the title.
- **States:** loading (spinner, form dimmed, no double submit) and success ("¡Gracias!", „მადლობა! ნინა მალე დაგიკავშირდება", a recap of channel and time of day).
- **Suggested Lead payload:** `{ name, phone, email?, channel, goal, days[], time_of_day, note?, consent_at, source, created_at }`.

---

## 4. Student cabinet decisions

- **Fidelity:** mid-fi but brand-consistent, as the brief allows: Calm tone, cream, teal and navy.
- **Navigation:** exactly 5 items, მთავარი · გაკვეთილები · მასალები · ლექსიკა · პროგრესი. A 248px sidebar on desktop, a bottom tab bar on mobile.
- **Home:** Caveat greeting "¡Hola, {name}!", next lesson time, a "continue learning" card (next unfinished material), homework with due dates, a "From Nina" note with a personal material, and a mini Poco a Poco path.
- **Lesson page (core):** the materials list is grouped under **Nina's own group headings** (for example 1 · ვხედავთ სიტუაციას / 2 · სიტყვები და წესი / 3 · ვიყენებთ). These headings mirror the inductive method, so the data model needs optional group labels on a lesson's ordered material list. The page has a right rail (progress, homework, spot), continuous scroll and no pagination.
- **Status system** (used everywhere):

  | Item | States |
  |---|---|
  | Lesson | new = teal-soft · in progress = mustard-soft · done = sage |
  | Material | empty ring → half ring → sage check |
  | Other | homework = burgundy-soft with a date · personal = navy chip "პირადი" / mustard ★ in vocabulary |

- **Completion rule:** passive materials use a student "mark as done" button. Exercises, games and checkpoints complete automatically. Opening a material sets it to "opened".
- **Viewers:** one shared viewer header (back · type · title · previous/next within the lesson · mark done). There are frames for:
  - image card (9:16)
  - video (with the dialogue below and the current line highlighted)
  - audio (waveform, speeds, ES/EN transcript)
  - PDF (thumbnails and download)
  - dialogue (chat bubbles with an ES / ES+EN toggle)
  - pronunciation (tap a circle to hear it)
- **Exercise player:**
  - **One shared frame**: header with step N/M, instruction and progress; beige body; footer with restart, feedback and check → next; and a completion screen.
  - A **pluggable body per `template_id`**. Nine templates were designed:
    - multiple_choice
    - swipe_true_false
    - drag_sort
    - sentence_builder
    - fill_blank
    - matching_pairs
    - branching_dialogue
    - listening
    - checkpoint (with a result screen)
  - A suggested JSON contract is in `cabinet-spec.md`.
  - Desktop shows one step per screen; mobile uses continuous scroll with a sticky Check button, as the brief asks.
  - No name entry. Restart returns to the start of the exercise.
  - Keyboard alternatives are required for drag and swipe.
- **Library:** type filters (multi-select), topic filter (up to the last covered topic), search, and personal/homework badges.
- **Vocabulary:** filter "up to topic N", with personal words marked ★. The pronunciation circle appears only for tricky letters. There's a flashcard practice button.
- **Progress:** 4 stat cards, block bars, checkpoints, and a final A1 card.
- **States:** empty (first login: "¡Bienvenida!" with the next lesson date), a skeleton loading state (spinners only inside buttons), and an error state with retry (progress kept).
- **Sample data:** the student "მარიამი / Mariam" and lessons 1–7 are made up for the mockups. Counts were made consistent (45 of 59 materials completed, topic 16 of 45).

---

## 5. Asset processing decisions
- All images were compressed to **webp** (about 2.5 MB PNG → 100–300 KB each).
- **Cut-outs:** the standing and cross-legged Nina and 11 poses from the character sheet were keyed to **transparent** by flood-filling the cream background from the edges (so the white T-shirt stays intact), with soft edges.
- **Trademark retouching:**
  - The sneaker "N" logo was painted out on the two hero/CTA cut-outs.
  - The study-room scene was **cropped** so the "Nuevo Sueña" book spine and the laptop logo don't show.
  - Deliberately **not extracted** from the character sheet: the laptop pose (visible device logo) and the book stack (textbook title).
  - **Still to do:** tiny sneaker logos remain on several spots and possibly in some scenes.
- **Logo:** cropped to the circle area only; never redrawn or recolored. On dark backgrounds it sits on a cream circle. The favicon should use the portrait detail from the original file (not produced yet).

---

## 6. Where the design adds to or interprets the brief
| Brief | What was done | Why |
|---|---|---|
| Translation "on hover/tap" | Explicit EN toggle button | Works on touch, accessible |
| "Preferred days and times" | Day chips + time-of-day chips | Structured data, faster to fill |
| H2 36px | Landing H2 46px (cabinet keeps 36) | Proportion against large illustrations |
| Rules as notes | Added Spanish hand-lettered titles per rule | Brand voice, bilingual world |
| Lesson → materials | Materials grouped under Nina's headings | Mirrors the inductive method; needs an optional `group` field |
| Offer copy | New lines, e.g. "ეს არ არის ენის სკოლა…", "მარტივად: ერთი გაკვეთილი, ყველაფერი შიგნით", "hecho con cariño, para ti" | Drafts for Nina to approve |
| Mobile header CTA | Shortened to "საცდელი გაკვეთილი" | Fits at 390px; full text everywhere else |
| Mobile gift image | Walking Nina (extra asset) instead of #4 | Avoids repeating the mobile hero image |
| Extra tokens | Tints, surfaces, hover shades, status inks | The brief gave accents only |

---

## 7. Open items (need decisions or content)
1. **Content placeholders:**
   - Laura's and Lucas's descriptions
   - lesson platform
   - recommended frequency
   - payment method
   - missed-lesson policy
   - footer contacts and social URLs
   - consent text and a privacy policy page
2. **Block names** on the path and progress page are working titles.
3. **Georgian copy** is draft; Nina finalises it.
4. **Illustrations:** remaining sneaker logos need retouching; the favicon needs producing.
5. **Not designed (out of scope):**
   - admin panel
   - password-reset screens (use the login layout)
   - privacy policy and terms pages
6. **For the architecture/Cursor guide to settle:**
   - auth method (email + password as designed; Nina creates accounts, so an invite or set-password flow is needed)
   - where the Lead goes (admin panel on Railway)
   - media delivery for video, audio and PDF (Railway volume vs a CDN, streaming)
   - exercise JSON schema versioning
   - the optional `group` label on lesson materials
   - i18n approach (Georgian UI, Spanish/English content)

---

## 8. Technical notes for whoever writes the Cursor guide
- **Stack assumption:** Next.js + Tailwind (the brief says Vercel frontend, Railway backend). Both a Tailwind v3 config and a v4 theme are provided; pick whichever version the repo uses.
- **Screens are reference, not production markup.** They use absolute positioning at fixed widths (1440 / 390). Cursor should rebuild responsively (container max 1280) and copy exact values and copy from them.
- **Fonts:** load them with `next/font/local`, keeping FiraGO's Georgian `unicode-range` (an example is in `docs/assets.md`).
- **Icons:** copy the SVG paths from `screens/design-system.html` (section 06) into one `<Icon name>` component.
- **Recommended build order** (also in `docs/CURSOR_PROMPTS.md`):
  1. foundation and primitives, plus a `/styleguide` page
  2. landing page
  3. booking flow and `/api/leads`
  4. cabinet shell and auth
  5. lessons, lesson page and viewers
  6. exercise frame and template registry
  7. library, vocabulary, progress and states
- A review prompt ("compare with screenshot X and fix differences") is suggested after each step.
- The `.cursor/rules/nina-design-system.mdc` rule should live at the repo root `.cursor/rules/` so it applies to every generation.
