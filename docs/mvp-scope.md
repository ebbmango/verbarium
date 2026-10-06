# MVP scope

The release the project is working toward. This document records what the MVP
contains, the architectural decisions that follow from it, and the order the
work has to happen in. The work itself is tracked as GitHub issues, one
milestone per phase: <https://github.com/ebbmango/verbarium/milestones>.

## Contents

The MVP is five deliverables:

1. **Lessons 001–020.** Twenty of Wieger's 177 lessons, authored as lesson
   content with interactive quotations.
2. **User authentication.** Readers have accounts and persistent identity.
3. **Flashcards.** Review of taught characters, backed by per-user state.
4. **Dictionary pages.** A page per character, with hand-authored entries.
5. **Mobile app.** A native client alongside the web application.

Lessons, Characters and Flashcards are already declared as the three navigation
surfaces in `apps/web/app/components/site-header.tsx`. The MVP makes all three real.

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

**Dictionary pages are MDX.** One page per headword, written like a lesson. Its
entries, readings and senses are written in the page with fixed components, and
its example quotations appear by Quote ID. A build step reads those components
for search and flashcards. Senses stay out of the database because each belongs
to one page; quotations, which lessons and dictionary pages share, belong to the
database.

**Quotations load into Supabase after the MVP.** During the MVP they are
committed to the repository in their final form: Quote Slicer's versioned JSON
exports, carrying their source name and link, referenced as `<Quote id="…">`.
Loading them into the database afterwards is then an import script. A Quote ID
identifies the quote itself and never changes.

Durable decisions are recorded in Hylia under `Projects/Verbarium/Decisions/`:
Supabase (Backend Platform), the future Expo app (Repository Architecture),
dictionary pages (Character Data Model) and quotation storage (Quote Identity
and Storage).

## Content delivery

Lesson content is MDX imported at build time; quotations are quotation files
(JSON) imported the same way and referenced by Quote ID. Both serve the native
client too. The Expo app compiles
the same MDX at build time with the official `@mdx-js/mdx` compiler and a native
component map, and the quotation files are plain data it can import directly.
Lessons therefore stay bundled for the MVP. The reasoning and the compile
requirements are in Hylia, `Projects/Verbarium/Decisions/Lesson Content
Architecture.md`, under *Native rendering*.

What must be settled before lessons 002–020 are authored is the discipline that
keeps them portable: markdown and semantic components rather than raw HTML tags,
`className` or `style`. Every lesson written with raw markup is a lesson to
rewrite for the native client. The rules are written down in
`docs/lesson-authoring.md`.

The quotation work is not forced by the native client, which can import the
files directly. Phase 2 puts quotations in their final form anyway:

- **A strict JSON format** ([#16](https://github.com/ebbmango/verbarium/issues/16)), exported by Quote Slicer
  ([quote-slicer#19](https://github.com/ebbmango/quote-slicer/issues/19),
  [quote-slicer#20](https://github.com/ebbmango/quote-slicer/issues/20)). The
  committed files are strict JSON, not TypeScript object literals, so the
  bare-`undefined` pinyin problem must be solved for real.
- **Validation at build** ([#17](https://github.com/ebbmango/verbarium/issues/17)). JSON files are not type-checked, so
  the build validates every committed export; the later import script reuses it.
- **Quote IDs.** Partly decided: a Quote ID identifies the quote itself and never
  changes. The remaining questions are [#31](https://github.com/ebbmango/verbarium/issues/31).

## Phases

The web prototype is finished first; the Expo application in Phase 7 is a port
of it, not a parallel track. Phase 4 runs in parallel with everything after
phase 2; it is the long pole and it is authoring work, not engineering work.

**Phase 1 — Persistence foundation.** Provision Supabase and establish a
migration path. Add reader data: lesson completions now; flashcard review state
waits for Phase 6, and dictionary content lives in MDX. Wire authentication into
the web application. New tables start locked, so each user table gets its grant
and owner policy when created, as `lesson_completion` does.

**Phase 2 — Content in final form.** Put quotations in their final form: a
written JSON format, validation at build, Lesson 1's 17 quotations converted,
and lessons referencing quotes by Quote ID; Quote Slicer exports the format for
new quotations. Write down the portable authoring rules before bulk authoring
starts, and bring Lesson 1 in line with them.

**Phase 3 — Multi-lesson web.** Lesson index, routing between lessons, and the
course-position indicator. `LessonHeader` already receives `total` and the CSS
already exists.

**Phase 4 — Lessons 002–020.** Nineteen lessons of prose, plus their quotations
authored in Quote Slicer. Lesson 001 carries seventeen quotations, so budget
roughly 300–340 alignment exports. Cross-repository work.

**Phase 5 — Dictionary.** One MDX page per headword, with components for
entries, readings and senses; a build step that indexes them for search and
flashcards; routes and presentation. Second authoring queue.

**Phase 6 — Flashcards.** Review scheduling model and per-user review state,
keyed by the headword's written string, then the review interface.

**Phase 7 — Expo application.** A shared package holding lessons and quotations
for both clients, the MDX compile plugins the native client needs, then native
lessons, dictionary and flashcards. Both pieces wait until here because only the
native client needs them.

## Deployment

GitHub Pages stays. The application is a prerendered SPA (`ssr: false`,
`prerender: true`), and Supabase is a hosted backend the browser calls over
HTTPS, so authentication and per-user state need no server of Verbarium's own.
`.github/workflows/deploy-pages.yml` already gates deploys on `pnpm typecheck`
and `pnpm test`, and already copies `index.html` to `404.html` so deep links
resolve client-side.

What Phase 1 adds is configuration, not hosting: the Supabase publishable key in the
client bundle (public by design), auth redirect URLs allowlisted for the
`/verbarium/` basename, and the `service_role` key kept out of the bundle and
the repository.

Phase 5 would have been the first real argument for leaving Pages: hundreds of
dictionary pages need to be indexable, and SPA deep links return an HTTP 404
status to crawlers. Because dictionary pages and, during the MVP, quotations are
files in the repository, those routes can be prerendered at build time without a
database, so Pages stays.

## Risks

The authoring volume dominates the schedule and no engineering decision reduces
it. Two independent authoring queues — quotations and dictionary entries — run
against the same editorial attention.

The hosted project starts every new table locked, so a missing policy breaks a
feature rather than exposing data. The remaining risk is granting a user table
to the API roles without an owner policy; the recipe is in
[#28](https://github.com/ebbmango/verbarium/issues/28).

The October 2026 target predates this scope and is not achievable from the
current state: one lesson, one route, no backend, no persistence, one client.
The date needs to be reset or the scope cut.
[#35](https://github.com/ebbmango/verbarium/issues/35) still describes the MVP
as desktop-first, which the mobile deliverable contradicts; that passage is now
stale.

## Open questions

- Which flashcard scheduling algorithm — Leitner, SM-2, FSRS, or simpler?
  Deferred until the options are studied.
