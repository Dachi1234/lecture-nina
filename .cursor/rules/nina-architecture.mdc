---
description: Nina platform architecture rules (always applied)
alwaysApply: true
---

# Nina – Tu Profe de Español · Architecture rules

Source of truth: `docs/BUILD_GUIDE.md`. Read the relevant section before changing a module. Visual rules live in `nina-design-system.mdc`.

## Structure
- Monorepo: `apps/web` (Next.js on Vercel), `apps/api` (Fastify on Railway), `packages/db` (Prisma), `packages/contracts` (zod), `packages/ui` (tokens + components), `packages/exercise-engine` (pure grading logic).
- `design/**` is read-only reference. Never import from it; copy assets into the app instead.
- Every material content shape and exercise template is defined ONCE as a zod schema in `packages/contracts` and reused by web renderers, admin editors, API validation and AI tools.

## Data rules
- Materials live once in the library and are reused via `Assignment`; never duplicate a material to give it to another student.
- Students only ever see lessons/items with `readyForStudent = true` and only their own data. Enforce this in the API, not only in the UI.
- Never expose the textbook name or `Topic.internalRef` to student-facing endpoints or UI.
- Lesson status, counters, covered topics and vocabulary filters are derived as in BUILD_GUIDE 7.1. Keep that logic in the API with unit tests.
- Publishing a material writes a `MaterialRevision`.

## Files
- All file access goes through `StorageDriver` (local Railway volume now, S3 later). No direct `fs` paths in business code.
- Media is served only via signed, expiring URLs with HTTP Range support, after an authorization check.
- Heavy work (image/video/audio processing, AI long tasks, notifications) runs in pg-boss jobs, idempotent and retried.

## Exercises
- One `ExerciseFrame`, one body component per `templateId`, registered in a template registry with `meta` (variants, bestFor, step limits). Adding a template must not require changes outside its own files + the registry.
- Grading is implemented in `packages/exercise-engine` and runs client-side for feedback and server-side on submit.
- No name entry in exercises. Restart returns to the start of the exercise. Drag and swipe must have keyboard alternatives.
- `HTML_EMBED` runs in a sandboxed iframe on a separate origin and talks only through the versioned `nina:*` postMessage bridge.

## AI
- LLM access only through the `LLMProvider` abstraction; model id from env/settings, never hardcoded.
- AI tools create DRAFTS only (`origin = AI_AGENT`). AI can never publish, set `readyForStudent`, delete, or contact anyone.
- Tool inputs/outputs are zod-validated; validation errors are returned to the model so it can fix them.

## Social Studio
- Reserved module (`apps/api/src/modules/social`, `/admin/social`). Do not implement features until the owner provides the code. It must reuse MediaAsset, StorageDriver, AgentRuntime, pg-boss and `tokens.json`.

## UI language and copy
- UI is Georgian (`lang="ka"`); Spanish is content/accent; English only in translations. Strings live in `messages/ka.ts` and `content/landing.ka.ts`, not inline in components.
- Dates in Asia/Tbilisi with Georgian short formats (e.g. "26 სექ.").
- `[bracket]` placeholders must never ship to production.

## Quality
- TypeScript strict. No `any` in contracts. Tokens only, no hardcoded hex values.
- After UI work, compare Playwright screenshots (1440 and 390) with `design/handoff/screenshots/` and fix differences.
