# Starter prompts for Cursor

Copy the folder into your repo as `/design` (and move `design/.cursor/rules/` to the repo root `.cursor/rules/` so the rules apply automatically).
Use these prompts in order. Attach the matching screenshot from `design/screenshots/` when you ask for a screen — Cursor reads images, and the HTML gives it exact values.

---

### 1 · Foundation
```
Read design/README.md, design/docs/components.md and design/tokens/.
Set up the design foundation in this Next.js (App Router) + Tailwind project:
- add the Tailwind theme from design/tokens (v3 config or v4 theme — use whichever version this repo has),
- self-host the fonts from design/assets/fonts with next/font/local (keep FiraGO restricted to the Georgian unicode-range; stack: FiraGO, Montserrat, system-ui),
- copy design/assets into /public/design-assets,
- global styles: paper background, navy text, mustard focus ring, reduced-motion rule. No dark mode.
Then build primitive components matching design/screens/design-system.html exactly:
Button (primary / burgundy / outline / text-link; sizes L/M/S; hover/focus/disabled), Input, Textarea, ChoiceChip (aria-pressed), Checkbox, Chip/StatusBadge, Card, Icon (all icons from the design system section 06), BrushUnderline, BrushCircle, Doodles.
Create a /styleguide page that renders them all for review.
```

### 2 · Landing page
```
Build the public landing page at / following design/docs/landing-spec.md.
Reference: design/screens/landing-desktop.html (1440) and design/screens/landing-mobile.html (390) + their screenshots.
Copy all Georgian/Spanish text exactly. Rebuild the layout responsively (container max 1280, 80px margins desktop / 20px mobile) — don't copy absolute positioning.
One component per section in components/landing/. Include: sticky header with scrolled state and mobile full-screen menu, hero with the write-on "¡Hola!" and floating Nina, stories section with the ES/EN dialogue toggle and the Spanish in Action pad, FAQ accordion (one open at a time), pricing card that can later render multiple packages.
Use next/image with the webp files, lazy-load below the fold.
```

### 3 · Booking form
```
Build the booking flow from design/docs/landing-spec.md → "Booking form" and design/screens/booking-*.html.
Desktop: accessible modal (focus trap, Esc, return focus). Mobile: full-screen sheet with sticky submit.
Fields, validation, loading and success states exactly as specified. Every "დაჯავშნე საცდელი გაკვეთილი" CTA opens it.
POST the Lead JSON to /api/leads (stub the handler for now; we'll connect the Railway backend later).
```

### 4 · Student cabinet shell + auth
```
Build the student cabinet under /cabinet following design/docs/cabinet-spec.md.
Start with: login page (design/screens/cabinet-c1-login.html), authenticated layout with the 248px sidebar (desktop) and bottom tab bar (mobile), and the Home screen (cabinet-c2-home.html + cabinet-mobile-home.html).
Use typed mock data shaped like the data model in the spec (Student, Lesson, Material, Assignment, Progress). No sign-up route.
```

### 5 · Lessons, lesson page, viewers
```
Build My lessons (cabinet-c3-lessons.html), the Lesson page (cabinet-c4-lesson.html, cabinet-mobile-lesson.html) and the material viewers (cabinet-c5-material-viewers.html, cabinet-mobile-card-viewer.html): image card 9:16 with zoom/swipe, video + dialogue text, audio + ES/EN transcript, PDF preview + download, dialogue bubbles with translation toggle, pronunciation circles. Implement status logic (not started / opened / completed, mark as done).
```

### 6 · Exercise player
```
Build the Exercise Frame and the 9 templates from design/docs/cabinet-spec.md → "Exercise player" and design/screens/cabinet-c6-exercise-player.html (+ cabinet-mobile-exercise.html).
Exercises arrive as JSON { template_id, steps[] … }. Make the body a registry keyed by template_id so new templates can be added without touching the frame. Include restart, per-step feedback, completion screen, checkpoint result screen. Keyboard-accessible alternatives for drag/swipe.
```

### 7 · Library, vocabulary, progress, states
```
Build My materials (cabinet-c7-library.html), Vocabulary (cabinet-c8-vocabulary.html), Progress (cabinet-c9-progress.html), and the empty/loading/error states (cabinet-c10-states.html) as reusable components used across all cabinet pages.
```

### Review prompt (use after each step)
```
Compare what you built with design/screenshots/<file>.jpg and design/screens/<file>.html side by side. List every difference in color, font, size, spacing, radius, copy and states, then fix them.
```
