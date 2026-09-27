# Nina – Tu Profe de Español · Design handoff

Everything needed to build the website (public landing page + student cabinet) from the approved design.
Put this folder in your repo as `/design` and point Cursor at this README.

> **Start here in Cursor:** open `docs/CURSOR_PROMPTS.md` and paste the first prompt.
> The rules in `.cursor/rules/nina-design-system.mdc` apply automatically once the folder is inside your project (move `.cursor/` to the repo root if `/design` is a subfolder).

---

## What's inside

| Folder | Contents | Use it for |
|---|---|---|
| `screens/` | **Every screen as a plain, self-contained HTML file** (open in any browser; offline; exact colors, sizes, spacing, copy) | Pixel reference for Cursor — it can read the real CSS values |
| `screenshots/` | Full-page JPG of every screen (desktop 1440 @1x, mobile 390 @2x) | Visual reference / attach to Cursor chat |
| `tokens/` | `tokens.css` (CSS variables) · `tailwind.config.js` (v3) · `tailwind-v4-theme.css` (v4) · `tokens.json` | Design system in code |
| `assets/illustrations/` | Hero cut-outs + 9:16 scenes (webp, web-ready) | Landing + cabinet imagery |
| `assets/spots/` | 11 small Nina poses & props cut from the character sheet (transparent webp) | Cards, empty states, success screens |
| `assets/logo/` | Logo (web, cropped, **never redraw / recolor**) | Header, footer, login |
| `assets/fonts/` | Montserrat, Caveat, FiraGO (Georgian subset **and** full), `fonts.css`, OFL licenses | Self-hosted fonts |
| `assets/originals/` | *(separate download: nina-original-illustrations.zip)* original PNGs + retouched full-res | Re-exports, other sizes |
| `docs/` | Specs: landing, cabinet, components, assets, data model, open items, the original brief | Behaviour & logic the pictures can't show |
| `source/` | Original design-canvas source files (`.dc.html`) + `canvas.json` | Only if you need the raw originals |

## Screen index

### Landing page (high fidelity)
| Screen | HTML | Screenshot |
|---|---|---|
| Landing — desktop 1440 (full page, FAQ/translation/Spanish-in-Action work) | `screens/landing-desktop.html` | `screenshots/landing-desktop.jpg` |
| Landing — mobile 390 (full page) | `screens/landing-mobile.html` | `screenshots/landing-mobile.jpg` |
| Mobile menu (open) | `screens/landing-mobile-menu.html` | `screenshots/landing-mobile-menu.jpg` |
| Booking modal — form | `screens/booking-desktop-form.html` | `screenshots/booking-desktop-form.jpg` |
| Booking modal — validation errors | `screens/booking-desktop-errors.html` | `screenshots/booking-desktop-errors.jpg` |
| Booking modal — sending | `screens/booking-desktop-loading.html` | `screenshots/booking-desktop-loading.jpg` |
| Booking modal — success | `screens/booking-desktop-success.html` | `screenshots/booking-desktop-success.jpg` |
| Booking — mobile full-screen sheet (with an error example) | `screens/booking-mobile.html` | `screenshots/booking-mobile.jpg` |
| Booking — mobile success | `screens/booking-mobile-success.html` | `screenshots/booking-mobile-success.jpg` |

### Design system
| Style guide (colors, type, buttons, forms, chips, cards, icons, graphic language, illustration & logo rules, spacing, radii, elevation, motion, header states) | `screens/design-system.html` | `screenshots/design-system.jpg` |
|---|---|---|

### Student cabinet (developer reference, mid fidelity)
| # | Screen | HTML |
|---|---|---|
| C1 | Login | `screens/cabinet-c1-login.html` |
| C2 | Home — „ჩემი ესპანური" | `screens/cabinet-c2-home.html` |
| C3 | My lessons | `screens/cabinet-c3-lessons.html` |
| C4 | Lesson page (core screen) | `screens/cabinet-c4-lesson.html` |
| C5 | Material viewers (image card, video, audio, document, dialogue, pronunciation) | `screens/cabinet-c5-material-viewers.html` |
| C6 | Exercise player: shared frame + 9 interaction layouts + completion | `screens/cabinet-c6-exercise-player.html` |
| C7 | My materials (library) | `screens/cabinet-c7-library.html` |
| C8 | Vocabulary | `screens/cabinet-c8-vocabulary.html` |
| C9 | Progress | `screens/cabinet-c9-progress.html` |
| C10 | Empty / loading / error states | `screens/cabinet-c10-states.html` |
| M | Mobile: home · lesson · image-card viewer · exercise | `screens/cabinet-mobile-*.html` |

Screenshots use the same names in `screenshots/`.

## Non-negotiable rules (short version — full list in `.cursor/rules/`)

1. **Georgian is the main language.** Every text style uses `font-family: "FiraGO", "Montserrat", system-ui, sans-serif`. FiraGO is registered only for the Georgian unicode-range, so Georgian renders in FiraGO and Latin/Spanish in Montserrat automatically. Georgian line-height ≥ 1.5 (body 1.6).
2. **Caveat (handwritten) only for short Spanish accents** (¡Hola!, Poco a Poco, ¡Vamos!, Un día a la vez). Never Georgian, never body text, never inside exercises.
3. **No dark mode.** Warm cream paper everywhere (`--paper #FCF7E6`).
4. **Saturated colors are accents, not big fills.** Exceptions already in the design: navy Stories section + footer. Mustard and sand are never text.
5. **Logo is used exactly as supplied** — never redrawn, recolored, or the frame used alone. On dark backgrounds it sits on a cream circle.
6. **Primary CTA copy is fixed:** „დაჯავშნე საცდელი გაკვეთილი". It opens the booking modal (desktop) / full-screen sheet (mobile).
7. **No textbook names anywhere** (the curriculum spine is internal). No brand logos in illustrations.
8. **Accessibility:** WCAG AA contrast (values in tokens are checked), visible mustard focus ring, real `<button>`/`<a>`/`<label>`, touch targets ≥ 44px, `prefers-reduced-motion` disables animation, alt text on meaningful images, `alt=""` on decorative spots.
9. **Rhythm:** landing alternates Lively and Calm sections (see `docs/landing-spec.md`).
10. **Cabinet is Calm tone only**, max 5 nav items: Home · Lessons · Materials · Vocabulary · Progress.

## Tech notes
- Brief says: frontend on **Vercel**, backend + file storage on **Railway**. Tokens work with Next.js + Tailwind (v3 or v4) or plain CSS.
- Fonts: use `next/font/local` with the files in `assets/fonts/` (keep FiraGO's `unicode-range` — see `fonts.css`), or just import `fonts.css`.
- Images: webp included; generate responsive sizes (`next/image`) from `assets/originals/` if you need larger ones. Lazy-load everything below the hero.
- The HTML screens use absolute positioning at fixed artboard widths (1440 / 390). **Rebuild them responsively** (flex/grid, fluid container max 1280) — treat them as the visual/values reference, not production markup.

## Open items before launch
See `docs/open-items.md` — placeholders in square brackets `[...]` (contacts, payment method, missed-lesson policy, Laura/Lucas descriptions, final block names), Georgian copy review by Nina, and illustration retouching.
