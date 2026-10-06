# Verbarium design follow-up

This document is a handoff for future chats. It records only deferred ideas and ideas that are worth testing. Do not treat a proposed treatment as approved unless the item explicitly says it is ready to implement.

## Current typography context

- Font loading and all visual styles are in `apps/web/app/styles.css`.
- Lesson content is in `apps/web/app/content/lessons/001.mdx`.
- MDX presentation components are in `apps/web/app/components/lesson.tsx`.
- Original Chinese quote paragraphs are marked `lang="zh-Hant"`. They use LXGW WenKai Mono TC at weight 300.
- Chinese embedded in translations or Latin prose falls back to WenKai at weight 400.
- English lesson prose and translations use Source Serif 4.
- Large section-head characters (A, B, C, and so on) use Noto Serif TC.
- Form-study glyphs and standalone character-focus displays retain the Kaiti/Songti system stack.

## 1. Fix visual relationships between lead-ins and quotations

**Status:** Deferred, important.

**Problem:** A prose lead-in can appear visually disconnected from the quotation it introduces. The clearest example is “As explained by Duan Yucai:” immediately before the `Shuowen Jiezi Zhu` quote in `001.mdx`. Because the quote begins so far below it, the lead-in can look more closely related to the paragraph above than to the quote below.

**Current spacing involved:**

- `.lesson-manuscript > p` uses a top margin of `1.4rem`.
- `.lesson-quote` uses `margin: 2.65rem auto`.
- Large section gaps range from roughly `8rem` to `9rem`, with separate mobile overrides.

**Investigation:** Start with relationship-aware spacing instead of globally shrinking every gap. Test a smaller top margin when a quote immediately follows a manuscript paragraph, for example a direct-sibling rule such as `.lesson-manuscript > p + .lesson-quote`. Check whether this improves ordinary paragraph-to-quote transitions or whether explicit lead-in markup/component semantics are needed for phrases such as “As explained by…”.

**Constraints:**

- Preserve the spacious manuscript character of the page.
- Avoid making unrelated blocks feel crowded.
- Check the transition both before and after quotes, on desktop and mobile.
- Do not adopt a single global spacing token until the content relationships have been audited.

**Done when:** Introductory sentences clearly read as belonging to the following quote, while major character and category sections still have deliberate breathing room.

## 2. Explore responsive quote wrapping

**Status:** Superseded for interactive `Quote` content; retained for `LegacyQuote` mock-ups.

**Updated direction:** For an interactive quote, `alignment.breaks.attestation` and `alignment.breaks.translation` independently define authored sequence boundaries. Canonical tokens contain no line state. Natural wrapping may still occur within an authored line. `LegacyQuote` remains available for static MDX mockups.

**Post-MVP direction:** Coordinate a future Quote Slicer line model that can author different intentional line breaks for different viewport ranges, then teach Verbarium to consume those variants. The October 2026 MVP is desktop-first and does not include this model.

**Goal:** Let original quote text and translations adopt pleasing, different line breaks at wide and narrow widths without maintaining separate copies of the content.

**First option to test:** Prefer natural wrapping and try the CSS `text-wrap` property on `.lesson-quote p`:

- `text-wrap: pretty` aims to improve line endings and avoid typographic orphans while largely preserving normal wrapping.
- `text-wrap: balance` redistributes text across lines for a more even shape. It may suit short quotations, but should be tested carefully on longer translations.

These approaches respond automatically to the available width and keep the MDX clean. Compare them against the current explicitly authored `<br />` elements on desktop, intermediate widths, and narrow mobile screens. Confirm browser support for the project targets before adopting either value.

**Optional escape hatch:** If a small number of quotations need editorial control, consider a lightweight MDX component for viewport-specific break opportunities. Prefer a single accessible text stream. A `<wbr>`-style marker is only an optional wrapping opportunity and cannot guarantee a line break; responsive `<br>` markers provide exact lineation but are more brittle.

**Risks and constraints:**

- Manual breakpoints become coupled to wording, font metrics, font size, container width, and viewport thresholds.
- Two curated layouts can still look awkward at intermediate widths.
- Traditional Chinese already has many natural break opportunities between characters, so adding `<wbr>` may not meaningfully prioritize a preferred point.
- Avoid literal zero-width-space characters because they can affect editing, search, and copied text.
- Do not duplicate full desktop and mobile quote text; that would create maintenance and accessibility problems.

**Done when:** Quotes wrap gracefully across representative widths, the MDX remains readable, and exceptional editorial breaks can be expressed without duplicating content.

## 3. Revisit commentary presentation

**Status:** Treatment implemented; awaiting visual review.

**Problem:** Commentary currently uses a full subtle border and tinted background. Longer commentary sections may benefit from a clearer editorial structure.

**Relevant CSS:** `.lesson-note`, `.lesson-note p`, `.note-title`, and the nested form-study rules in `apps/web/app/styles.css`.

**Ideas to compare:**

- Keep the current full box but refine padding and title placement.
- Replace the full border with a restrained accent edge.
- Test left-aligned commentary as a treatment local to notes only. Prefer it over justification: the narrow responsive measure makes uneven word spacing likely, particularly on mobile.

**Current treatment:** Commentary is left-aligned inside a square, fully bordered panel with a translucent warm-brown wash, preserving the underlying paper character while creating an unmistakable boundary from lesson prose. The existing red label identifies the panel without additional ornament; slightly larger prose and a relaxed line height support longer notes.

**Constraint:** The general proposal to left-align all manuscript prose was discarded. Do not reintroduce it. Any alignment experiment must be limited to commentary and reviewed independently.

**Done when:** Long notes are easy to follow and visibly distinct from the lesson manuscript without looking like generic application cards.

## 4. Reassess small metadata sizes

**Status:** Ready for later reassessment.

**Candidates:** `.quote-source`, `.character-forms figcaption span`, `.form-label`, and `.lesson-progress`.

**Decision so far:** The quote-source font has been simplified. Decide whether it needs a modest size increase after using the new treatment. Do not broadly enlarge all metadata without comparing the resulting hierarchy.

**Done when:** Metadata remains quiet but is comfortably legible and consistent across quote attribution and form studies.

## 5. Lesson progress indicator

**Status:** Deferred; do not implement now.

`LessonHeader` receives `total`, and `.lesson-progress`, `.progress-line`, and related CSS already exist, but the component does not render them. This can be revisited when navigation and multi-lesson behavior are in scope.

## 6. Decide how unavailable provenance links are communicated

**Status:** Deferred; preserve the current quote-source styling for the first interactive renderer.

Quote Slicer currently exports provenance text but not a provenance/source URL. Initially, render the provenance with the existing `.quote-source` treatment whether or not it is linked. Later, decide whether the absence of a link warrants distinct styling or other feedback, and distinguish a genuinely unavailable link from provenance that is still editorially unresolved.

Coordinate the long-term answer with Quote Slicer's export contract and Verbarium's future source/bibliography model.

## 7. Establish a machine-readable Quote Slicer interchange

**Status:** Deferred cross-repository work; use typed `.ts` data modules in Verbarium for now.

Quote Slicer's display formatter can emit bare `undefined` for unannotated pinyin. Bare `undefined` is valid in a TypeScript object literal but invalid in JSON. A strict JSON export should omit that optional `pinyin` property; `null` should remain available for the distinct “not applicable” state.

Define and coordinate:

- a strict machine-export path in Quote Slicer;
- schema/version compatibility and validation in Verbarium;
- an explicit migration procedure for every breaking export-model change, coordinated across Quote Slicer, persisted quote data, and Verbarium;
- eventual export of the selected provenance/source link;
- the boundary between an authoring export and the future database record.

## 8. Validate Quote Slicer exports at the ingestion seam

**Status:** Deferred; explicitly outside the first interactive-renderer implementation.

TypeScript checks the field shapes of imported exports. Content tests now check duplicate token/mapping IDs, dangling references, overlapping ownership, valid boundary positions, and exact canonical reconstruction. Before exports arrive from a database or another runtime source, add ingestion validation and decide versioning separately.

Keep validation at the ingestion seam so the quote renderer can operate on trusted data without duplicating recovery rules throughout its implementation.

## 9. Finalize Quote ID semantics

**Status:** Deferred to the database-backed quote-reference architecture; record an ADR before implementation.

The working public format is `LNNNT-QNN`, for example `L001A-Q01`: lesson number, subsection tag, and per-subsection quote number. Quote asset names append a short descriptive slug, for example `L001A-Q01-one-foundation`. Before treating the ID as permanent, decide:

- whether it identifies a source passage, a complete source–translation–alignment aggregate, or one lesson occurrence;
- whether its quote number is an immutable accession number or the quotation's current display order;
- what happens when a quotation is inserted, reordered, moved, reused, retired, or replaced;
- whether the subsection tag is specifically the lesson's `A`–`J`-style character-study label;
- whether the one-letter tag, `001`–`177` lesson range, and `01`–`99` quote range are permanent limits;
- how untagged quotations are identified;
- which system allocates IDs and prevents collisions;
- which textual, translation, and alignment edits preserve the same ID.

Local quote assets use working Quote IDs for authoring and navigation. Their database identity and lifecycle semantics remain deferred.

## 10. Add transliteration presentation

**Status:** Post-MVP; defer until after the October 2026 release target.

Quote Slicer exports pinyin metadata, and the interactive renderer should retain it in the input data without displaying it. Later work must decide where transliteration appears, whether it is persistent or interaction-driven, and how it affects quote layout and accessibility.

## 11. Reconsider `LegacyQuote` feedback

**Status:** Deferred; use the current quotation styling without a badge or warning in the MVP.

`LegacyQuote` remains a supported tool for mocking up emerging lesson content before a Quote Slicer export exists. Later, decide whether authors or readers need visual feedback that a quotation is static and provisional. Its absence of highlighting is the only distinction for now.

## 12. Add keyboard access to Mapping exploration

**Status:** Deferred; do not implement now.

The interactive `Quote` currently lets readers activate a Mapping with a pointer or touch. Add a keyboard interaction that lets a keyboard user activate the same Mapping and explore the relationship between attestation and translation tokens. Decide the focus behavior and accessible description before implementation, and preserve the current pointer and touch behavior.

## 13. Enable Row Level Security on user tables

**Status:** Deliberately deferred for the bachelor's thesis deadline. Not a
hardening task — read this before creating the first user table.

**Why this is not an ordinary "secure it later" item:** Verbarium is a
prerendered SPA talking straight to Supabase from the browser. There is no
server of its own in the request path, so PostgreSQL's own Row Level Security
policies are the entire authorization boundary. A table without a policy is not
weakly protected; it is readable and writable by anyone holding the Supabase
anon key, and that key ships inside the client bundle by design. The table names
and query shapes are visible in the same bundle, so there is nothing an attacker
needs to guess.

**Scope of the exposure:** every table holding per-user data — accounts,
flashcard review state, reading progress. Lesson, quotation and dictionary
content is editorially public and carries no comparable risk. If examiners or
classmates create accounts during the thesis demonstration, the data left open
is theirs.

**Remedy, when it is taken up:** Supabase enables RLS by default on tables
created through its dashboard, and an owner-only policy is three lines of SQL
per table:

```sql
alter table flashcard_review enable row level security;
create policy "own rows" on flashcard_review
  for all using (auth.uid() = user_id);
```

Also keep the `service_role` key out of the client bundle and out of the
repository; it bypasses RLS entirely. Anything genuinely needing it belongs in a
Supabase Edge Function.

**Deferral is a cost, not a saving.** The work is roughly a quarter-hour across
all user tables if done while the schema is being written in Phase 1. Retrofitted
later it means auditing policies against tables that already hold live data, and
reasoning about what was reachable in the interim.

**Trigger:** do this before any account other than the author's own exists —
whichever comes first of a public demonstration, a shared link, or thesis
submission.

**Done when:** every table holding per-user data has RLS enabled and an
owner-scoped policy, with a test proving a signed-in user cannot read another
user's rows.
