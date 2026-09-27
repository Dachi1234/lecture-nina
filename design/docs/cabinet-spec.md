# Student cabinet — developer spec

Mid-fidelity reference: structure, components, states and flows. Tone: **Calm** only. Cream background always, no dark mode.
Feeling: "This is my Spanish journey" — not an admin dashboard, not a file folder.

## Access
- Accounts are created by Nina in the admin panel. **No public sign-up.**
- C1 Login: email + password (show/hide toggle), „დაგავიწყდა პაროლი?", info box explaining there's no registration + link to book a trial lesson. Error: burgundy borders + „ელ-ფოსტა ან პაროლი არასწორია" under the button.
- The student sees **only** items where the assignment has `ready_for_student = true`.

## Navigation
- Desktop: left sidebar 248px (paper-deep, right border): logo, 5 items with line icons — მთავარი · გაკვეთილები · მასალები · ლექსიკა · პროგრესი — active = teal filled pill (radius 12), user row at the bottom (initial avatar, name, „გასვლა").
- Mobile: bottom tab bar (64px + safe area), same 5 items, icon + 11px label, active teal.

## Screens
| # | Screen | Key content | File |
|---|---|---|---|
| C2 | Home „ჩემი ესპანური" | Caveat greeting „¡Hola, {firstName}!" + spot; next lesson date/time; **Continue learning** card (current lesson, progress bar completed/assigned, next unfinished material + „გაგრძელება"); **Homework** list (due dates, done items struck through in sage); **From Nina** (latest teacher note + personal material chip „პირადი"); **Poco a Poco** mini path (blocks done / current / next) | `cabinet-c2-home.html` |
| C3 | My lessons | Filter pills (ყველა · მიმდინარე · დასრულებული); table rows: № tile, date, title, topic tags, status chip, materials completed/total, chevron. Newest first; current/new lesson highlighted with a warm row bg | `cabinet-c3-lessons.html` |
| C4 | Lesson page (core) | Breadcrumb; „LECCIÓN 6 · date"; title; topic chips („თემა 14 · …"); **note from Nina** (teal-soft, portrait); **materials list** in Nina's order, grouped by her headings (1 · ვხედავთ სიტუაციას / 2 · სიტყვები და წესი / 3 · ვიყენებთ); each row = type icon tile, title, meta, status, action („მონიშნე დასრულებულად" or „გაგრძელება" for exercises); right rail: progress, homework block (burgundy-soft), spot. Continuous scroll, no pagination | `cabinet-c4-lesson.html` |
| C5 | Material viewers | One shared viewer header (back · type label · title · prev/next within the lesson · mark done). Frames: **image card 9:16** (zoom −/+, ‹ › arrows, dots; mobile: swipe + pinch), **video** (+ dialogue text below, current line highlighted mustard-soft, CC, speed), **audio** (waveform, speeds .75/1/1.25, transcript ES + EN toggle), **document** (inline PDF preview + page thumbnails + download), **dialogue** (chat bubbles, ES / ES+EN segmented toggle, per-line audio), **pronunciation** (lowercase letters in pale-green organic circles; tap = audio; example words) | `cabinet-c5-material-viewers.html` |
| C6 | Exercise player | See below | `cabinet-c6-exercise-player.html` |
| C7 | My materials | Search (title + tags), type filter pills (multi), topic dropdown (≤ last covered), 4-col card grid; badges for „პირადი" (navy + mustard) and „საშინაო · date" (burgundy); status line | `cabinet-c7-library.html` |
| C8 | Vocabulary | Count; „თემამდე:" dropdown (words from topics ≤ N); topic pills + „★ პირადი"; table: play button, Spanish (Montserrat 18/600), Georgian · English (italic muted), pronunciation circle only for tricky letters, topic. „ბარათებად ვარჯიში" = flashcard mode | `cabinet-c8-vocabulary.html` |
| C9 | Progress | 4 stat cards (lessons, topics x/45, materials completed/assigned, checkpoints passed); block bars (done sage, current mustard, future empty); checkpoints list; A1 final check card. Block names are placeholders | `cabinet-c9-progress.html` |
| C10 | States | **Empty** (first login: crosslegged Nina, „¡Bienvenida!", „შენი პირველი გაკვეთილი ნინასთან მალე დაიწყება", next lesson date) · **Loading** (skeleton mirroring the real layout, shimmer; spinners only inside buttons) · **Error** (map Nina, „¡Uy!", „მასალა ვერ ჩაიტვირთა", retry + back to lesson; progress is kept) | `cabinet-c10-states.html` |
| M | Mobile key screens | Home, lesson, full-screen image-card viewer, exercise with sticky Check button | `cabinet-mobile-*.html` |

## Status language (use everywhere)
| Thing | State | Visual |
|---|---|---|
| Lesson | new / ახალი | teal-soft chip, teal text |
| Lesson | in progress / მიმდინარე | mustard-soft chip, `#7A4A00` text |
| Lesson | done / დასრულებული | sage-soft chip, `#34605A` text, „✓" |
| Material | not started | empty 24px ring, sand border |
| Material | opened | half-filled sage ring |
| Material | completed | filled sage circle with white check |
| Homework | due | burgundy-soft chip + date |
| Personal material | — | navy chip „პირადი", mustard star in vocabulary |

„Mark as done" is a student action for passive materials (card, video, audio, document, dialogue, grammar, pronunciation). Exercises/games/checkpoints complete automatically on their completion screen. Opening a material sets `opened`.

## Exercise player (C6)
Exercises are created in the admin (manually by Nina or by the AI agent from her prompts) and stored as **structured JSON + `template_id`**. The cabinet renders them with one shared **Exercise Frame** and a pluggable body per template.

**Frame (always the same):**
- Header (card bg): type label + step „N / M" (overline teal), title (16–20/700), one-line instruction in Georgian, teal progress bar, close (returns to lesson, progress kept).
- Body: beige `#F3EAD6`, printed fonts only (Montserrat for Spanish, FiraGO for Georgian), large readable sizes (16–22px), word tiles with thin `#C9B08E` 1px outlines, radius 8.
- Footer (card bg): **Restart** (↺, returns to the start of the exercise), feedback line, primary „შემოწმება" → „შემდეგი →".
- Feedback: correct = sage border + sage-soft fill + „✓" (+ short praise in Spanish „¡Muy bien!"); wrong = burgundy border + burgundy-soft + show the right answer; selected = teal border.
- Completion screen: mustard-soft, crosslegged Nina, „¡Muy bien!", „სავარჯიშო დასრულებულია", score, „შემდეგი მასალა →", restart.
- **No name entry** — the student is logged in.
- Desktop: one step per screen. Mobile: continuous scroll, sticky Check button above the tab bar.

**Templates designed (body layouts):**
| template_id | Interaction |
|---|---|
| `multiple_choice` | Sentence with a gap + 3–4 option rows |
| `swipe_true_false` | Card stack; swipe left = FALSO, right = VERDADERO; ✕/✓ buttons for accessibility |
| `drag_sort` | Word tiles dragged into 2–3 category boxes (e.g. el / la); keyboard alternative: select tile → select box |
| `sentence_builder` | Georgian prompt; tap tiles into the answer line; used tiles fade to 35% |
| `fill_blank` | Inline inputs in sentences; per-blank feedback |
| `matching_pairs` | Two columns (word ↔ image or word ↔ translation) |
| `branching_dialogue` | Chat bubbles; the student picks a reply; the story continues along the chosen branch |
| `listening` | Audio player (speed) + question + 2×2 options |
| `checkpoint` | Cumulative test; result screen with a score ring and per-skill breakdown („გაიმეორე" hints) + „შეცდომების ნახვა" |

Suggested JSON shape (admin ↔ cabinet contract):
```json
{
  "id": "ex_0142",
  "type": "exercise",
  "template_id": "sentence_builder",
  "title": "ააწყე წინადადება",
  "instruction_ka": "ააწყე წინადადება",
  "topics": [14, 15],
  "steps": [
    { "prompt_ka": "მე საქართველოდან ვარ, მაგრამ ბარსელონაში ვცხოვრობ.",
      "tiles": ["Soy", "de", "Georgia,", "pero", "vivo", "en", "Barcelona"],
      "answer": ["Soy", "de", "Georgia,", "pero", "vivo", "en", "Barcelona"],
      "distractors": [] }
  ],
  "created_by": "nina | ai_agent",
  "version": 3
}
```
Adding a new template = a new body component + JSON schema; the frame, progress and completion logic are shared.

## Data model (from the brief, for the cabinet)
- **Material** (library master object, lives once): `id, type, title, files[] (image|document|video|audio), content (for interactive/rich text), tags[], topics[], is_personal, owner_student_id?`
  - `type ∈ card | vocab | dialogue | story | video | audio | document | grammar | exercise | game | pronunciation | reader | homework | review | checkpoint`
- **Lesson**: `id, student_id, number, date, title, note_from_nina, topics[], materials[] (ordered, optional group headings), homework[]`
- **Topic** (~45) → **Block** (~10) → **Course** (A1; later Survival Spanish, Spanish in Action)
- **Student** (created by Nina) · **Assignment** (lesson|material ↔ student, `ready_for_student`, `due_date?`, `is_homework`)
- **Progress** per student × material: `not_started | opened | completed`, `score?`, `updated_at`
- **Lead** (booking form) — see landing spec.
- Reuse: updating a library material updates it for every student who has it. No duplication.
- Dialogues are always **Spanish + English** (EN is a toggle, not a second material).
