# Landing page — section-by-section spec

Reference files: `screens/landing-desktop.html`, `screens/landing-mobile.html` (+ screenshots).
Desktop artboard is 1440 wide, content container 1280 (80px side margins, 12 columns, 24 gutter). Mobile is 390 with 20px margins.
Section heights below are the design heights at 1440 — build with padding, not fixed heights.

Tone per section: **L** = Lively (strong contrast, brush accents, motion) · **C** = Calm (restrained, more whitespace).

| # | Section | Anchor | Tone | Height @1440 | Background |
|---|---|---|---|---|---|
| 0 | Header (sticky) | — | — | 88 → 68 on scroll | paper |
| 1 | Hero | `#top` | L | 832 | paper + sand blob `#F3E4C8` |
| 2 | Meet Nina | `#nina` | C | 760 | paper |
| 3 | What makes it different | `#method` | L | 900 | paper |
| 4 | Stories / სიუჟეტები (signature) | `#stories` | L | 1040 | navy `#0A414F`, wavy top & bottom edges |
| 5 | How a lesson works + Nina's 4 rules | — | C | 1000 | paper |
| 6 | Materials showcase | `#materials` | L | 920 | sand-soft `#F1E3C8` |
| 7 | Your personal cabinet | — | C | 820 | paper |
| 8 | Your path — Poco a Poco | — | C | 780 | paper-deep `#F6EDD3` |
| 9 | Two lessons as a gift | — | L | 800 | paper |
| 10 | Pricing | `#price` | C | 740 | paper |
| 11 | FAQ | `#faq` | C | 900 | paper-deep |
| 12 | Final CTA | — | L | 560 | mustard-soft `#FCE8C0` |
| 13 | Footer | — | — | 340 | navy |

A subtle paper-grain overlay (SVG `feTurbulence`, multiply, ~22% opacity) sits over the whole page. Optional; drop it if it costs performance.

---

## 0 · Header
- Left: logo, 68px tall (52px when scrolled; 52px on mobile).
- Nav (desktop): ნინა · მეთოდი · სიუჟეტები · მასალები · ფასი · კითხვები — 16px/500 navy, hover burgundy; smooth-scroll to anchors; active section gets a mustard underline when scrolled.
- Right: ghost „შესვლა" (user icon, teal, → cabinet login) + primary „დაჯავშნე საცდელი გაკვეთილი" (teal, 48px, radius 12).
- Scrolled state (after ~40px): height 68, cream bg, 1.5px sand bottom border, soft shadow. See the design system file, section 09.
- Mobile: logo + compact CTA „საცდელი გაკვეთილი" (40px) + menu icon (44×44). Menu = full-screen cream sheet (`screens/landing-mobile-menu.html`): big 26px links, walking-Nina spot, CTA + login at the bottom, „Un día a la vez" in Caveat.

## 1 · Hero (L)
- Left column (x 80, width 700): Caveat „¡Hola!" 56px burgundy, rotated −5°, **writes itself** on load (clip-path reveal 1.2s, delay .35s). „Nina" 120px Montserrat 700 navy, then „Tu Profe de Español" 54px with a mustard brush underline under „Español". `h1` has `aria-label="Nina – Tu Profe de Español"`.
- Quote with a big mustard Caveat quote mark: „ესპანურ ენას კი არ ვასწავლი, ვასწავლი ესპანურ სამყაროს" (25px/500).
- Descriptor 19px muted. Fact chips: ნულიდან · ინდივიდუალური · ონლაინ · 75 წუთი (pill, card bg, sand border).
- CTA stack: primary 62px „დაჯავშნე საცდელი გაკვეთილი →" (no wrap) → gift line with gift icon „პირველი 2 გაკვეთილი — საჩუქრად" (burgundy 600) → text link „როგორ მიმდინარეობს გაკვეთილი ↓" (mustard underline, scrolls to the method section).
- Right: `assets/illustrations/nina-standing.webp`, 760px tall, gentle float (translateY −8px, 7s) — or light parallax. Behind: sand blob + open mustard brush circle (echo of the logo frame). Doodles: Caveat „soy Nina" + hand-drawn arrow, two small plus-stars.
- Mobile: 9:16 `scene-stone-wall.webp` on top (520px, bottom fades into cream with a mask gradient), then text stack, full-width CTA.

## 2 · Meet Nina (C)
- Image `scene-study-room.webp` 520×640 in an organic blob mask (`border-radius: 46% 54% 40% 60% / 34% 36% 64% 66%`) with a partial mustard brush arc.
- Caveat „Conóceme" (teal), H2 „გამარჯობა, მე ნინა ვარ", two first-person paragraphs (languages: German, Russian, English, Spanish, Italian + Georgian; why she teaches this way). **Never mention Nina's own Spanish level.**
- Five language "stamps" (108×128, dashed sand border = perforation, slight rotations): Hallo/გერმანული · Привет/რუსული · Hello/ინგლისური · ¡Hola!/ესპანური (highlighted mustard-soft, lifted) · Ciao/იტალიური.
- Closing Caveat „Un día a la vez." 44px teal.

## 3 · What makes it different (L)
- Header row: Caveat „¿Por qué conmigo?" + H2 „რატომ ნინასთან" left; right-aligned line „ეს არ არის ენის სკოლა…".
- 3×2 grid of horizontal cards (240px tall): 140px tinted illustration strip (spot image) + number in Caveat + title + text. Tints rotate teal-soft / mustard-soft / burgundy-soft / sage-soft / sand-soft; card 6 („Poco a Poco") is inverted navy.
- Hover: lift −4px + shadow. Mobile: single column, 150px cards.
- Content: 01 ესპანური ნულიდან · 02 სიუჟეტები და არა წესები · 03 შენზე მორგებული · 04 ლამაზი მასალები · 05 შენი კაბინეტი · Poco a Poco ნაბიჯ-ნაბიჯ.

## 4 · Stories / სიუჟეტები (L — biggest visual moment)
- Navy section with soft wave edges. Left: `scene-cafe-friends.webp` 600×700 in an arch mask (`object-position: 50% 88%`). Name tags (Caveat pills) above each character: Laura · Nina (mustard) · Ana (burgundy text) · Lucas.
- Right: Caveat „Nuestras historias", H2 „ესპანური, რომელიც ისტორიასთან ერთად იზრდება", paragraph, 2×2 character list (Ana = Georgian web designer in Barcelona; Nina = your profe; Laura/Lucas = **placeholders**).
- **Dialogue card** (cream): „DIÁLOGO · En el café", 4 lines ES with avatar initials. Toggle button „EN +/✓" shows/hides the English line under each Spanish line (desktop click; on mobile tap). `aria-pressed` reflects state.
- **Spanish in Action teaser** (under the image): 236×128 dance floor (5×3 grid) with a mustard dot wearing round glasses; four buttons ← izquierda · derecha → · ↑ arriba · ↓ abajo move it one cell with a springy 350ms transition; the last word appears in Caveat in the corner („¡derecha!"). Elegant, not gamey. Mobile: buttons only (2×2).
- Burgundy CTA.

## 5 · How a lesson works (C) + Nina's four rules
- Centered header: Caveat „Paso a paso", H2 „როგორ მიმდინარეობს გაკვეთილი", sub „ჯერ სიტუაცია, მერე წესი…".
- 4 stops on a dotted hand-drawn wave (horizontal desktop, vertical dashed line on mobile). Each stop: 120px cream circle with an open mustard brush ring + line icon, Caveat step („1 · Mira", „2 · Observa", „3 · Entiende", „4 · Habla"), title, one line.
- Rules board (sand-soft panel, radius 24): „Mis reglas" + „ნინას ოთხი წესი" + 4 pinned notes with washi tape, slight rotations: ¡Nos divertimos! ვერთობით · Con calma ვსწავლობთ საფუძვლიანად · ¡Viva el error! გვიყვარს შეცდომები · ¡Desde el día uno! ესპანურად პირველივე გაკვეთილიდან. Mobile: 2×2 grid.

## 6 · Materials showcase (L)
- Left text column (380): „Materiales", H2, caption (materials are made for the course and personalized), type chips.
- Right: overlapping, slightly rotated collage of **real HTML mini-materials** (not images): 9:16 info card „Los saludos", vocabulary card „En el café", audio player (Diálogo 3), pronunciation circles (ll ñ j rr ce gu in pale-green organic shapes), dialogue ES/EN, sentence-builder exercise. Hover each → straightens + lifts. Caveat note „hecho con cariño, para ti".
- Mobile: horizontal scroll-snap carousel with dots.
- No textbook names visible.

## 7 · Your personal cabinet (C)
- Left: „Tu espacio", H2 „შენი პირადი კაბინეტი", 3 icon rows (all lessons in one place · materials for every lesson · see what's done and next).
- Right: `scene-terrace-desk.webp` in an arch (360×600) + desktop device mock (620×400, navy bezel) + phone mock (190×380) showing the cabinet home (mini version of C2). Build the mocks as a static image or simplified HTML.

## 8 · Your path — Poco a Poco (C)
- Header: Caveat „Poco a Poco", H2 „შენი გზა — ნულიდან თავდაჯერებულ A1-მდე", right line.
- SVG landscape (1280×460): sand & sage hills, a small Mediterranean town (terracotta roofs, arches, cypresses), winding cream road with dotted center line and 8 stops (1–3 done = teal filled, 4–7 = outlined, 8 = mustard check „¡A1!"). HTML labels: Caveat Spanish + Georgian: ¡Hola! მისალმება · Me presento თავის გაცნობა · En el café კაფეში · ¿Dónde está? მიმართულებები · Mi día ჩემი დღე · Mi familia ოჯახი · De compras საყიდლები · ¡A1!
- **Block names are placeholders** — final list from Nina. Mobile: vertical list with a dashed spine.

## 9 · Two lessons as a gift (L)
- Left half: `scene-stone-wall.webp` full-bleed (700×800) with a curved right edge + mustard brush arc. Mobile uses `scene-walking.webp`.
- Right: Caveat „Un regalo para ti", H2 „პირველი 2 გაკვეთილი — საჩუქრად", paragraph, 5 hand-drawn check items (get to know each other · goals & pace · first video dialogues · first cards · build first dialogues together), burgundy CTA.

## 10 · Pricing (C)
- Left: „Precio", H2 „მარტივად: ერთი გაკვეთილი, ყველაფერი შიგნით", paragraph, coffee spot.
- Right: one friendly price card (560 wide, radius 24): rotated mustard badge „პირველი 2 გაკვეთილი — საჩუქრად", „ინდივიდუალური გაკვეთილი", **30 GEL** / გაკვეთილი (88px), chips 75 წუთი · ონლაინ · 1:1, 3 included items, primary CTA, note „ფასიანი გაკვეთილები მესამედან იწყება."
- **Future packages:** make the card a component that can render 2–3 cards side by side (e.g. 4 / 8 lessons) without layout changes.

## 11 · FAQ (C)
- Left: „¿Preguntas?", H2, line, portrait spot. Right: accordion, 8 questions, **one open at a time**, first open by default. Toggle = 36px round button with + that rotates to × (45°) and fills teal when open. `aria-expanded` on each question button.
- Answers with `[...]` are placeholders (platform, frequency, payment, missed lesson).

## 12 · Final CTA (L)
- Mustard-soft background, big brush circle, `nina-sitting-coffee.webp` (470px). Caveat „¡Vamos!" 76px, H2 „მოდი, ესპანური ერთად ვისწავლოთ", primary CTA + gift line.

## 13 · Footer
- Navy, cream text. Logo on a 144px cream circle (unaltered). Columns: საიტი (anchors) · კონტაქტი ([email] [phone/WhatsApp] [Telegram]) · სოციალური (Instagram · Facebook · TikTok — text links, no brand logos) · მოსწავლეებისთვის („შესვლა კაბინეტში" cream button).
- Bottom row: signature *Nina - Tu Profe De Español* (Montserrat italic 500, mustard) · © 2026.

---

## Booking form (modal / sheet)
Files: `booking-desktop-{form,errors,loading,success}.html`, `booking-mobile.html`, `booking-mobile-success.html`.

- **Desktop:** modal 1000×880, radius 24, over a navy 55% scrim. Left 300px mustard-soft panel with „¡Hola!", gift line, explanation and standing-Nina spot. Close button top-right (44px, `aria-label`). Esc closes; focus is trapped; focus returns to the triggering CTA.
- **Mobile:** full-screen sheet, sticky submit bar at the bottom.
- **Fields:** სახელი* · ტელეფონი* (+995, tel) · ელ-ფოსტა (optional) · დღის მონაკვეთი (დილა / დღე / საღამო, single) · როგორ დაგიკავშირდე? (ტელეფონი / WhatsApp / Telegram / ელ-ფოსტა, single) · რისთვის გინდა ესპანური? (მოგზაურობა / სწავლა / გადასვლა / გართობისთვის / სხვა, single) · სასურველი დღეები (ორშ–კვ, multi) · შენიშვნა (optional textarea) · consent checkbox*.
- Choice chips are real buttons with `aria-pressed`; selected = teal fill.
- **Validation (on submit):** name required; phone ≥ 12 digits incl. 995; consent required. Error = 2px burgundy border + message below + summary line under the title („გთხოვ, შეავსე მონიშნული ველები." `role="alert"`).
- **Loading:** form at 70% opacity, button shows spinner + „იგზავნება…", double-submit blocked.
- **Success:** coffee-Nina in an open brush circle, „¡Gracias!", „მადლობა! ნინა მალე დაგიკავშირდება", recap line (channel · time of day), „დახურვა" + „¡Hasta pronto!".
- **Submission** creates a **Lead** in the admin panel: `{ name, phone, email?, channel, goal, days[], time_of_day, note?, consent_at, source: "landing", created_at }`.
