# Verbarium

Verbarium is a reading environment for Literary and Classical Chinese. Its lessons combine authored narrative with quotations whose source text and translation can be explored through many-to-many alignment.

## Data model authority

The executable relational schema is the declarative SQL under `supabase/schemas/`; `schema/verbarium.dbml` is a reference diagram kept in step with it. Hylia preserves the durable design reasoning behind both. Terms below that describe the existing Quote Slicer implementation should not override schema decisions once a concept has been modeled in the schema.

## Language

### Quotations

**Quote Slicer export**:
The alignment payload produced by Quote Slicer: canonical attestation and translation tokens, ID-based many-to-many mappings, and independent sequence-boundary arrays under `alignment.breaks`. The exact application contract is `apps/web/app/quote-slicer-export.ts`; see `docs/quotation-contract.md` for invariants.

**Quotation file**:
The committed JSON document that is a quotation's source of truth during the MVP: a format version, the provenance, the source link when there is one, and the Quote Slicer export. One per quotation, named by its Quote asset name. The format is defined in `docs/quotation-contract.md`.
_Avoid_: Quote JSON, export file

**Quote ID**:
The permanent public identifier of a quotation itself — one attestation, one translation and their alignment — through which lessons and the dictionary refer to it. It has the form `LNNNT-QNN`, such as `L001A-Q01`: the lesson and subsection where the quotation first appeared, and a two-digit number assigned within that subsection that never changes.
_Avoid_: Quote reference

**Quote asset name**:
The repository name of a quotation file: its Quote ID followed by a short descriptive slug, such as `L001A-Q01-one-foundation`. The Quote ID is authoritative; the slug is a human-readable mnemonic.
_Avoid_: Sentence name, source name

**Mapping**:
A single alignment group containing any number of source-token IDs and target-token IDs. Activating any member activates every member on both sides.
_Avoid_: Link (ambiguous with hyperlinks)

**Provenance**:
The attribution text that identifies the work or context from which a quotation comes.
_Avoid_: Source link

**Source link**:
The URL of the selected online textual witness for a quotation.
_Avoid_: Provenance link

### Dictionary

**Dictionary page**:
The MDX document for one headword: its entries, readings and senses, with the writing around them, written as `docs/dictionary-authoring.md` describes.
_Avoid_: Dictionary entry (an entry is one lexical treatment within a page)

**Dictionary address**:
The URL of a dictionary page, `/dictionary/<headword>`, such as `/dictionary/血` for `血.mdx`.
_Avoid_: Dictionary route, dictionary URL

**Dictionary index**:
The page at `/dictionary` listing every dictionary page in the order of its first reading, with a search by headword, reading or gloss.
_Avoid_: Glossary

**Headword**:
The written Traditional Chinese string a dictionary entry is filed under: one character such as `一`, or several such as `君子`. The written string itself is its identity.
_Avoid_: Glyph

**Entry**:
One lexical treatment of a headword, grouping the readings and senses that belong together. A headword standing for genuinely different words has several entries.
_Avoid_: Article

**Reading**:
One modern Mandarin pronunciation of an entry, written in Hanyu Pinyin with tone marks, such as `xuè`.
_Avoid_: Pinyin

**Sense**:
One meaning of an entry, which passages can illustrate as examples.
_Avoid_: Meaning

**Gloss**:
The short English rendering of a sense, such as "blood": the sense's heading on its dictionary page, and what the line under the headword, the page description, the dictionary index, search and flashcards show of it. The sense's own writing explains it.
_Avoid_: Definition, translation

**Usage note**:
A free-text qualification of where, when or in what context a sense is used, such as a period, region, genre or register.

### Readers

**Reader**:
A person reading Verbarium. Anyone can read lessons; a signed-in reader's lesson completions are saved.
_Avoid_: User, learner

**Lesson address**:
The URL of a lesson, `/lessons/N`, where N is the lesson's number: the number in its file name, `001.mdx` for Lesson 1.
_Avoid_: Lesson route, lesson URL

**Lesson subtitle**:
The one line a lesson writes on its header to say what it is about, such as "About the primitive 一, a single stroke." The lesson index and the page description show the same line.
_Avoid_: Lesson description, tagline

**Lesson index**:
The page at `/lessons` listing every committed lesson in course order, each linking to its lesson address.
_Avoid_: Lesson list, table of contents

**Course position**:
The indicator in a lesson's header showing where the lesson stands in the course: its number along a line that ends at the course's last lesson, 177 in Wieger's course.
_Avoid_: Progress bar, tracker

**Lesson completion**:
The record that a reader finished a lesson.
_Avoid_: Progress (ambiguous with the course position)
