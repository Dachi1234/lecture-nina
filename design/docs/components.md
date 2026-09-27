# Component specs

Exact values used in the design. Token names refer to `tokens/tokens.css`. Visual reference: `screens/design-system.html`.

## Buttons
| Variant | Default | Hover | Focus | Disabled |
|---|---|---|---|---|
| **Primary** | bg `--teal-deep`, text `--paper`, 600 | bg `--teal-deep-hover`, translateY(−2px), `--shadow-btn-hover` | 3px mustard outline, 3px offset | bg `#D9D3C2`, text `#6F7D7F` |
| **CTA burgundy** (dark sections, gift) | bg `--burgundy`, text paper | bg `--burgundy-hover`, −2px | same | same |
| **Secondary / ghost** | 1.5px teal border, teal text, transparent | bg `--teal-softer` | same | border/text `#D9D3C2`/`#8C9899` |
| **Text link** | teal 600, underline mustard 2px, offset 6px | text navy | same | — |
| **Icon button** | 44×44, radius 12 (or circle), bg `--sand-soft`, `aria-label` required | — | same | — |

Sizes: **L** 60–64px tall, padding 0 32px, radius 14, 18–19px text · **M** 48–56px, radius 12–14, 15–16px · **S** 40px, radius 10, 14px. Primary buttons are never pill-shaped. CTAs never wrap (`white-space: nowrap`). Transition 180ms.

## Form fields
- Label above: 14px/600. Optional hint in 400 muted „(არასავალდებულო)".
- Input: 50–52px tall, padding 0 14–16px, radius 12, bg `--card`, border 1.5px `--warm-sand`, 16px text (prevents iOS zoom).
- Focus: border `--teal-deep` + `0 0 0 4px var(--teal-soft)`, bg white.
- Error: 2px `--burgundy` border, message 13px/500 burgundy below, `aria-invalid="true"`, `aria-describedby` → message.
- Disabled: bg `#F3EEDF`, border `--line`, text `#8C9899`.
- Textarea: same, 64–96px, no resize.
- Choice chips (single/multi select): `<button aria-pressed>`, 44px, radius 12, 1.5px sand border, card bg; selected = teal bg + border, paper text.
- Checkbox: 24px, radius 6; checked = teal fill + white check; unchecked = 2px sand border; error = burgundy border + burgundy label.

## Chips & badges
- Fact chip (hero): pill, padding 8×16, card bg, 1.5px `--line` border, 15px/500.
- Info chip: pill, teal-soft bg, teal text 14–15/600 („75 წუთი").
- Status (radius 8, 12–13/600): new teal-soft/teal · in progress mustard-soft/`#7A4A00` · done sage-soft/`#34605A` · homework burgundy-soft/burgundy · personal navy/paper.
- Gift badge: mustard bg, navy 700, radius 12, rotated 3–4°, gift icon.
- Tag (topics): radius 6, paper-deep or sand-soft bg, 13px.

## Cards
- **Feature card (landing):** 240px tall, radius 16, card bg, 1.5px `--line`; left 140px tinted illustration strip; content padding 26×24: Caveat number 30px, title 21/700, text 16/1.6 muted. Hover lift −4px + `--shadow-card-hover`.
- **Lesson card / row (cabinet):** overline „LECCIÓN N · date" (Montserrat 13/600 teal), title 20/700, topic tags, status chip, progress bar 6–8px (track `--line`, fill `--sage`), count „7 / 12".
- **Material row:** 48px icon tile (radius 12, type tint) · title 16/700 · meta 13 muted · status · action. Divider `--line-soft`. Group header: paper-deep strip, 13/600 muted.
- **Price card:** radius 24, padding 44, card bg, 1.5px line, big shadow; price Montserrat 88/700 + „GEL" 28/700.
- **Pinned note:** radius 4, 206px tall, rotated ±1.5–2.5°, shadow `0 10px 20px -14px rgba(10,65,79,.5)`, washi tape 70×22 at the top (mustard 65% / sand 70% / sage 50%).
- **Language stamp:** 108×128, 2px dashed sand border (perforation), radius 6, rotated −4…+4°.

## Material type → icon → tint
| Type | Icon (line, 24px grid, 1.75 stroke) | Tile tint / icon color |
|---|---|---|
| Image card | tall rounded rect with 2 lines | mustard-soft / burgundy |
| Vocabulary | book | mustard-soft / burgundy |
| Dialogue | two speech bubbles | teal-soft / teal |
| Video | camera | teal-soft / teal |
| Audio | headphones | teal-soft / teal |
| Document | page with folded corner | sand-soft / navy |
| Grammar | bowl/shield with lines | mustard-soft / burgundy |
| Exercise | pencil | teal-deep / paper (highlighted) |
| Game | dice | teal-soft / teal |
| Pronunciation | wave line | sage-soft / `#34605A` |
| Homework | clipboard with check | burgundy-soft / burgundy |
| Checkpoint | flag | sage-soft / sage |
SVG paths for all icons are in `screens/design-system.html` (section 06) — copy them into an icon component. Stroke `currentColor`, round caps & joins.

## Graphic elements (copy SVGs from the screens)
- **Brush underline:** filled SVG path (viewBox 0 0 300 22), mustard, under one word of a heading only.
- **Open brush circle:** `<path d="M96 22 A 50 50 0 1 0 108 70">` in a 120×120 viewBox, mustard stroke 3–8 round; always open, always around something (Nina, a step icon, success image). Never the logo frame alone.
- **Doodles:** plus-star, curved arrow, hand-drawn check (`M4 13c2 1.5 3.5 3.5 5 6 3-6 6.5-10.5 11-14`), small wave. Max 2–3 per section.
- **Masks:** organic blob (`--mask-blob`), Mediterranean arch (`--mask-arch`), curved half-bleed edge (gift section).
- **Section wave edge** (navy sections): 40px SVG path in paper color on top and bottom.
- **Pronunciation circle:** pale green `#D6E9C9`, irregular `border-radius` (see `--mask-pron-*`), lowercase letters, Montserrat 600. Reserved for pronunciation only.

## Header
Default 88px (logo 68) → scrolled 68px (logo 52), cream bg, 1.5px sand bottom border, shadow `0 8px 20px -16px rgba(10,65,79,.4)`; active nav item burgundy with mustard underline.

## Motion
- Hover lift: buttons −2px, cards −4px, 180–250ms.
- Hero „¡Hola!" writes itself: `clip-path: inset(0 100% 0 0) → inset(0 -10% 0 0)` 1.2s, .35s delay.
- Nina float: translateY(−8px) 7s ease-in-out infinite (or light parallax on scroll).
- Modal: pop-in 350ms (translateY 12px + scale .98 → none).
- Accordion: 250ms, plus rotates 45° to ×.
- Spanish in Action: 350ms `cubic-bezier(.5,1.6,.4,1)` (springy).
- `prefers-reduced-motion: reduce` → no animation or transition.
