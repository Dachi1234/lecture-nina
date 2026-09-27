# Asset inventory

All web assets are **webp**. Cut-outs (standing, sitting, spots) have **transparent backgrounds** keyed from the cream paper, so they sit on any light surface.

## Logo — `assets/logo/`
| File | Size | Use |
|---|---|---|
| `nina-logo.webp` | 720×782 (cropped from the supplied 1536² file, cream bg kept) | Header (68px tall / 52 scrolled & mobile), footer (on cream circle), login, cabinet sidebar |
| `../originals/07-logo-original.png` | 1536×1536 | Master — use for favicon/app icon exports |
Rules: never redraw, recolor or separate the circular frame. On dark: place on a cream (`#FCF7E6`) circle. **Favicon:** crop the portrait detail (curls + teal glasses) from the original, not the frame alone. Minimum size 56px.

## Illustrations — `assets/illustrations/`
| File | Brief # | Size | Used in |
|---|---|---|---|
| `nina-standing.webp` | #3 (retouched: sneaker logo removed) | 820×1230, transparent | Hero (desktop), booking modal panel (via spot) |
| `nina-sitting-coffee.webp` | #9 (retouched) | 900×1080, transparent | Final CTA |
| `scene-study-room.webp` | #1 (cropped to remove the book-title spine and laptop logo) | 790×1536 | Meet Nina, design-system mask sample |
| `scene-cafe-chalkboard.webp` | #2 | 1024×1536 | Cabinet login |
| `scene-stone-wall.webp` | #4 | 941×1670 | Mobile hero, gift section (desktop) |
| `scene-terrace-desk.webp` | #5 | 941×1672 | Cabinet section on landing |
| `scene-cafe-friends.webp` | #6 | 940×1672 | Stories section, video-viewer poster |
| `scene-walking.webp` | extra | 940×1672 | Gift section (mobile) |

## Spots (cut from the character sheet #8) — `assets/spots/` (transparent)
| File | Pose | Used in |
|---|---|---|
| `spot-standing.webp` | standing, backpack | Booking modal panel, design system |
| `spot-walking.webp` | walking away | Card 6 (Poco a Poco), mobile menu |
| `spot-pockets.webp` | hands in pockets | Card 01 |
| `spot-map.webp` | reading a map | Card 02, error state, matching exercise |
| `spot-phone.webp` | on phone | Card 03 |
| `spot-notebook.webp` | „Hoy:" checklist + pen | Card 04, lesson page rail, matching |
| `spot-backpack.webp` | burgundy backpack | Card 05, matching |
| `spot-coffee.webp` | holding a cup at a table | Pricing, booking success, vocab card |
| `spot-portrait.webp` | chin on hand portrait | FAQ, Nina's avatar in notes, info card |
| `spot-crosslegged.webp` | cross-legged with coffee | Cabinet home greeting, empty state, completion |
| `spot-sitting-block.webp` | sitting on a stone block | Progress page |
Not extracted on purpose: the laptop pose (visible device logo) and the book stack (shows a textbook title).

## Originals — `assets/originals/`
Supplied PNGs (numbered as in the brief) + `03-…-RETOUCHED.png` and `09-…-RETOUCHED.png` with the sneaker "N" logos painted out.

**Still needs retouching before launch:** small sneaker logos are still visible on several character-sheet spots — check the scenes (stone wall, walking, café friends) too; the Spanish flag is fine as a scene detail. Final production art may replace these references.

## Fonts — `assets/fonts/`
| File | Notes |
|---|---|
| `fonts.css` | Ready-made `@font-face` set. FiraGO is limited to the Georgian unicode-range. |
| `firago-georgian-{400,500,600,700}.woff2` | FiraGO subset (Georgian + basic Latin + punctuation, ~23 KB each) |
| `firago-full-{400..700}.woff2` | Full FiraGO (if you need its Cyrillic/Greek) |
| `montserrat-latin-{400..700}-{normal,italic}.woff2` | Latin incl. Spanish accents |
| `caveat-latin-{500,600,700}-normal.woff2` | Handwritten accents |
| `LICENSE-*-OFL.txt` | SIL Open Font License for all three families |

Next.js example:
```ts
import localFont from 'next/font/local';
export const firago = localFont({ src: [
  { path: '../design/assets/fonts/firago-georgian-400.woff2', weight: '400' },
  { path: '../design/assets/fonts/firago-georgian-500.woff2', weight: '500' },
  { path: '../design/assets/fonts/firago-georgian-600.woff2', weight: '600' },
  { path: '../design/assets/fonts/firago-georgian-700.woff2', weight: '700' },
], variable: '--font-firago', declarations: [{ prop: 'unicode-range', value: 'U+10A0-10FF, U+1C90-1CBF, U+2D00-2D2F' }] });
// then: font-family: var(--font-firago), var(--font-montserrat), system-ui, sans-serif;
```
