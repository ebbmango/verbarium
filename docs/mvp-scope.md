# MVP scope

The release the project is working toward. This document records what the MVP
contains, the architectural decisions that follow from it, and the order the
work has to happen in. It supersedes the scope assumptions in `todo.md`.

## Contents

The MVP is five deliverables:

1. **Lessons 001–020.** Twenty of Wieger's 177 lessons, authored as lesson
   content with interactive quotations.
2. **User authentication.** Readers have accounts and persistent identity.
3. **Flashcards.** Review of taught characters, backed by per-user state.
4. **Dictionary pages.** A page per character, with hand-authored entries.
5. **Mobile app.** A native client alongside the web application.

Lessons, Characters and Flashcards are already declared as the three navigation
surfaces in `apps/web/app/routes/home.tsx`. The MVP makes all three real.

## Decisions

**Mobile is Expo / React Native.** A true native client, not a PWA or a WebView
shell. For the MVP it runs through Expo for demonstration; app-store publishing
is outside the MVP and needs no developer accounts. The consequence reaches
backwards through the whole stack: a native client cannot consume MDX compiled
into the web bundle, so lesson and quotation content must become runtime data
behind a stable contract rather than build-time imports. See *Content delivery*
below.

**Auth and user data are Supabase.** Managed PostgreSQL with authentication and
row-level security in one service. This matches the `database_type: 'PostgreSQL'`
target already declared in `schema/verbarium.dbml`, serves the web and native
clients from one place, and avoids joining user identity across two systems.
Supabase is reached directly from the browser over HTTPS, so the prerendered
static deployment remains viable; see *Deployment* below.

**No offline reading in the MVP.** The native client reads content online.

**Lessons are public; progress needs an account.** Anyone can read lessons
without signing in. Authentication is required only to save progress and
flashcard review state.

**Dictionary coverage is lessons 001–020 for the MVP.** The dictionary will grow
broader later; the MVP covers the characters taught in lessons 001–020 and their
accessory components.

**Dictionary entries are hand-authored.** Not imported from CC-CEDICT or Unihan,
and not generated from lesson prose. This keeps editorial voice consistent with
the lessons and gives full control over what each entry says. It also creates a
second authoring queue alongside the quotations, which is the main cost of this
decision.

Durable decisions are recorded in Hylia under `Projects/Verbarium/Decisions/`.
Supabase (Backend Platform) and the future Expo app (Repository Architecture)
are already there; the hand-authored dictionary decision is not yet.

## Content delivery

This is the sequencing problem that governs the rest of the plan.

Lesson content is currently an MDX module imported at build time. Quotations are
typed `.ts` modules imported the same way. Both work for a single web client and
neither works for a native one. Whatever replaces them must be settled *before*
lessons 002–020 are authored, because migrating the content model after the fact
means reworking twenty lessons and several hundred quotation assets.

Three `todo.md` items are therefore no longer deferred — the MVP promotes them:

- **Item 7, machine-readable Quote Slicer interchange.** A native client needs
  strict JSON, not TypeScript object literals. The bare-`undefined` pinyin
  problem must be solved for real.
- **Item 8, ingestion validation at the seam.** Once exports arrive from
  Supabase rather than from the repository, type-checking no longer guards them.
- **Item 9, Quote ID semantics.** Database-backed quotations make identity
  permanence a live question rather than a working convention.

## Phases

The web prototype is finished first; the Expo application in Phase 7 is a port
of it, not a parallel track. Phase 4 runs in parallel with everything after
phase 2; it is the long pole and it is authoring work, not engineering work.

**Phase 1 — Persistence foundation.** Provision Supabase. Extend
`schema/verbarium.dbml` with `User`, the flashcard review entities, and the
dictionary entities. Establish a migration path. Wire authentication into the
web application. Row Level Security is deliberately deferred here; see `todo.md`
item 13.

**Phase 2 — Content delivery seam.** Settle how lessons and quotations reach a
client at runtime. Deliver `todo.md` items 7, 8 and 9. This phase gates bulk
authoring.

**Phase 3 — Multi-lesson web.** Lesson index, routing between lessons, and the
progress indicator that `todo.md` item 5 defers. `LessonHeader` already receives
`total` and the CSS already exists.

**Phase 4 — Lessons 002–020.** Nineteen lessons of prose, plus their quotations
authored in Quote Slicer. Lesson 001 carries seventeen quotations, so budget
roughly 300–340 alignment exports. Cross-repository work.

**Phase 5 — Dictionary.** Character entity, hand-authored entry pipeline, routes
and presentation. Second authoring queue.

**Phase 6 — Flashcards.** Review scheduling model and per-user review state,
then the review interface.

**Phase 7 — Expo application.** Shared packages for domain types and content
access, then native lessons, dictionary and flashcards.

## Deployment

GitHub Pages stays. The application is a prerendered SPA (`ssr: false`,
`prerender: true`), and Supabase is a hosted backend the browser calls over
HTTPS, so authentication and per-user state need no server of Verbarium's own.
`.github/workflows/deploy-pages.yml` already gates deploys on `pnpm typecheck`
and `pnpm test`, and already copies `index.html` to `404.html` so deep links
resolve client-side.

What Phase 1 adds is configuration, not hosting: the Supabase anon key in the
client bundle (public by design), auth redirect URLs allowlisted for the
`/verbarium/` basename, and the `service_role` key kept out of the bundle and
the repository.

The first real argument for leaving Pages arrives at Phase 5. Hundreds of
dictionary pages need to be indexable, and SPA deep links return an HTTP 404
status to crawlers. Two options then: prerender the dictionary routes at build
time, which keeps Pages but couples the build to database availability, or move
to a static-first host with functions and preview deploys. Neither is a rewrite.

## Risks

The authoring volume dominates the schedule and no engineering decision reduces
it. Two independent authoring queues — quotations and dictionary entries — run
against the same editorial attention.

Row Level Security is deferred for the thesis deadline, which leaves user tables
open rather than merely weakly protected. `todo.md` item 13 records the exposure
and the remedy.

The October 2026 target recorded in `todo.md` predates this scope and is not
achievable from the current state: one lesson, one route, no backend, no
persistence, one client. The date needs to be reset or the scope cut. `todo.md`
items 2 and 10 still describe the MVP as desktop-first, which the mobile
deliverable contradicts; those passages are now stale.

## Open questions

- Which flashcard scheduling algorithm — Leitner, SM-2, FSRS, or simpler?
  Deferred until the options are studied.
