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
is outside the MVP and needs no developer accounts. The native client cannot
reuse the web's compiled lesson bundle; it compiles the same MDX itself. See
*Content delivery* below.

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

**Quotations move into Supabase during the MVP.** Dictionary senses link to
example passages through a database join, so passages must be in the database by
Phase 5; moving them in Phase 2 avoids converting several hundred quotation
assets after bulk authoring. Quote Slicer's JSON exports are committed to the
repository as the source of truth, and the database is loaded from them. A Quote
ID identifies the quote itself and never changes.

Durable decisions are recorded in Hylia under `Projects/Verbarium/Decisions/`.
Supabase (Backend Platform), the future Expo app (Repository Architecture) and
quotation storage (Quote Identity and Storage) are already there; the
hand-authored dictionary decision is not yet.

## Content delivery

Lesson content is MDX imported at build time; quotations are typed `.ts` modules
imported the same way. Both serve the native client too. The Expo app compiles
the same MDX at build time with the official `@mdx-js/mdx` compiler and a native
component map, and the quotation modules are plain data it can import directly.
Lessons therefore stay bundled for the MVP. The reasoning and the compile
requirements are in Hylia, `Projects/Verbarium/Decisions/Lesson Content
Architecture.md`, under *Native rendering*.

What must be settled before lessons 002–020 are authored is the discipline that
keeps them portable: markdown and semantic components rather than raw HTML tags,
`className` or `style`. Every lesson written with raw markup is a lesson to
rewrite for the native client.

`todo.md` items 7, 8 and 9 are not forced by the native client, which can import
TypeScript directly. They are forced by moving quotations into Supabase during
the MVP (see *Decisions*), and belong to Phase 2:

- **Item 7, machine-readable Quote Slicer interchange.** Database storage needs
  strict JSON, not TypeScript object literals. The bare-`undefined` pinyin
  problem must be solved for real.
- **Item 8, ingestion validation at the seam.** The import script is the seam.
  JSON files are not type-checked, so it validates every export before writing.
- **Item 9, Quote ID semantics.** Partly decided: a Quote ID identifies the
  quote itself and never changes. The remaining questions stay open.

## Phases

The web prototype is finished first; the Expo application in Phase 7 is a port
of it, not a parallel track. Phase 4 runs in parallel with everything after
phase 2; it is the long pole and it is authoring work, not engineering work.

**Phase 1 — Persistence foundation.** Provision Supabase. Extend
`schema/verbarium.dbml` with `User`, the flashcard review entities, and the
dictionary entities. Establish a migration path. Wire authentication into the
web application. Row Level Security is deliberately deferred here; see `todo.md`
item 13.

**Phase 2 — Shared content.** Move lessons and quotations into a shared package
both clients import, and add the MDX compile plugins the native client needs.
Move quotations into Supabase: a versioned JSON export in Quote Slicer, exports
committed as the source of truth, a validating import script, and lessons
referencing quotes by Quote ID. Deliver `todo.md` items 7, 8 and 9. Agree the
portable authoring rules before bulk authoring starts.

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

**Phase 7 — Expo application.** Native lessons, dictionary and flashcards, built
on the shared content package from Phase 2.

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
