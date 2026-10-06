# Quotation contract

A quotation is one attestation, one translation and their alignment. Quote
Slicer produces it; Verbarium commits it as a **quotation file** and lessons
show it through `<Quote>`. This document defines the file and the invariants
of the alignment data inside it. The application types are in
`apps/web/app/quote-slicer-export.ts`.

## Quotation file

### Where it lives and what it is called

One file per quotation, under `apps/web/app/content/quotes/`, named by its
Quote asset name: the Quote ID, a hyphen, a slug of lower-case letters and
digits separated by single hyphens, and `.json`, as in
`L001I-Q01-blocked-breath.json`. No two files share a Quote ID. The Quote ID
is the file's identity and is not repeated inside it: Quote Slicer does not
know it (the author assigns it when committing), and one place to change is
enough.

### Fields

A file is one JSON object with these keys:

| Key | Type | Meaning |
| --- | --- | --- |
| `formatVersion` | integer | The version of this format. Currently `1`; the validator rejects any other value. |
| `provenance` | string, non-empty | The Provenance (see `CONTEXT.md`), as the lesson shows it under the quotation: `"Shuowen Jiezi"`, `"The Analects 16.7"`. |
| `sourceLink` | string, optional | The Source link: an absolute `http` or `https` URL. Omitted when there is none; never `null` or empty. |
| `attestation` | object | `{ "tokens": SourceToken[] }`: the source text, tokenized. |
| `translation` | object | `{ "tokens": TargetToken[] }`: the translation, tokenized. |
| `alignment` | object | `{ "mappings": QuoteMapping[], "breaks": { "attestation": number[], "translation": number[] } }`. |

No other keys are allowed, at any level: an unknown key is a mistake, not an
extension. The next format version is the place for new keys. Until
[#19](https://github.com/ebbmango/verbarium/issues/19), lessons pass the
provenance and the source link as the `<Quote>` props `provenance` and
`sourceHref`; the file replaces both.

A **SourceToken** is `{ "id": integer, "text": string, "type": "character" | "punctuation" | "number" | "symbol", "pinyin"?: string | null }`.
A **TargetToken** is `{ "id": integer, "text": string, "type": "text" | "hanzi" | "punctuation" | "whitespace" }`.
A **QuoteMapping** is `{ "id": string, "sourceTokenIds": integer[], "targetTokenIds": integer[] }`.

There is no separate `text` field on either side: the tokens are the
canonical, lossless text (Hylia, Lesson Content Architecture; see *Alignment
data* below).

### Pinyin

`pinyin` appears only on source tokens and has three states, which stay
distinct:

- **absent**: the character has no annotation (yet);
- **`null`**: an annotation does not apply (punctuation, numbers, symbols);
- **a non-empty string**: the annotation, in the tone-number form Quote
  Slicer emits (`"qi4"`). The validator checks only that it is a non-empty
  string; its presentation is a later concern
  ([#32](https://github.com/ebbmango/verbarium/issues/32)).

JSON has no `undefined`, so "unannotated" is expressed by leaving the key
out, never by writing `null`.

### Strictness and layout

The file is strict JSON (RFC 8259), encoded as UTF-8 without a byte order
mark: no comments, no trailing commas.

Layout is not part of the format: any serialization of the same value is the
same quotation, escaped or not. The committed files use one layout so that
diffs stay small and the file Quote Slicer writes can be committed unchanged:
two-space indentation; keys in the order of the table above, and `id`,
`text`, `pinyin`, `type` inside a token, as Quote Slicer has always written
them; each token and each mapping on one line; arrays of numbers on one
line; characters outside the Basic Multilingual Plane, such as `𠃑`, written
as themselves; a final newline.

### Example

`L001I-Q01-blocked-breath.json`, complete. The translation has one editorial
break, before token index 10; the source has none. Token `5` is unannotated,
so it has no `pinyin` key; the punctuation tokens carry `null`.

```json
{
  "formatVersion": 1,
  "provenance": "Shuowen Jiezi, 丂部, 丂 entry",
  "sourceLink": "https://ctext.org/shuo-wen-jie-zi/kao-bu#:~:text=%E4%B8%82%EF%BC%9A%E6%B0%94%E6%AC%B2%E8%88%92%E5%87%BA%E3%80%82%F0%A0%83%91%E4%B8%8A%E7%A4%99%E6%96%BC%E4%B8%80%E4%B9%9F%E3%80%82",
  "attestation": {
    "tokens": [
      { "id": 0, "text": "气", "pinyin": "qi4", "type": "character" },
      { "id": 1, "text": "欲", "pinyin": "yu4", "type": "character" },
      { "id": 2, "text": "舒", "pinyin": "shu1", "type": "character" },
      { "id": 3, "text": "出", "pinyin": "chu1", "type": "character" },
      { "id": 4, "text": "。", "pinyin": null, "type": "punctuation" },
      { "id": 5, "text": "𠃑", "type": "character" },
      { "id": 6, "text": "上", "pinyin": "shang4", "type": "character" },
      { "id": 7, "text": "礙", "pinyin": "ai4", "type": "character" },
      { "id": 8, "text": "於", "pinyin": "yu2", "type": "character" },
      { "id": 9, "text": "一", "pinyin": "yi1", "type": "character" },
      { "id": 10, "text": "也", "pinyin": "ye3", "type": "character" },
      { "id": 11, "text": "。", "pinyin": null, "type": "punctuation" }
    ]
  },
  "translation": {
    "tokens": [
      { "id": 0, "text": "Air", "type": "text" },
      { "id": 1, "text": " ", "type": "whitespace" },
      { "id": 2, "text": "wishes", "type": "text" },
      { "id": 3, "text": " ", "type": "whitespace" },
      { "id": 4, "text": "to", "type": "text" },
      { "id": 5, "text": " ", "type": "whitespace" },
      { "id": 6, "text": "come", "type": "text" },
      { "id": 7, "text": " ", "type": "whitespace" },
      { "id": 8, "text": "out.", "type": "text" },
      { "id": 26, "text": " ", "type": "whitespace" },
      { "id": 9, "text": "The", "type": "text" },
      { "id": 10, "text": " ", "type": "whitespace" },
      { "id": 11, "text": "upward", "type": "text" },
      { "id": 12, "text": " ", "type": "whitespace" },
      { "id": 13, "text": "flow", "type": "text" },
      { "id": 14, "text": " ", "type": "whitespace" },
      { "id": 15, "text": "is", "type": "text" },
      { "id": 16, "text": " ", "type": "whitespace" },
      { "id": 17, "text": "blocked", "type": "text" },
      { "id": 18, "text": " ", "type": "whitespace" },
      { "id": 19, "text": "by", "type": "text" },
      { "id": 20, "text": " ", "type": "whitespace" },
      { "id": 21, "text": "the", "type": "text" },
      { "id": 22, "text": " ", "type": "whitespace" },
      { "id": 23, "text": "horizontal", "type": "text" },
      { "id": 24, "text": " ", "type": "whitespace" },
      { "id": 25, "text": "stroke.", "type": "text" }
    ]
  },
  "alignment": {
    "mappings": [
      { "id": "260d4e56-1d22-4fb2-b83c-71e0f1faebda", "sourceTokenIds": [0], "targetTokenIds": [0] },
      { "id": "a5c64e6f-cc17-4fd0-b55c-14dc0252e0fe", "sourceTokenIds": [1], "targetTokenIds": [2] },
      { "id": "4b502b94-bf72-43b6-874f-b3877c908625", "sourceTokenIds": [2], "targetTokenIds": [6] },
      { "id": "ff5b3819-37a9-4313-af90-f6ea3b62bbda", "sourceTokenIds": [3], "targetTokenIds": [8] },
      { "id": "2abb8f7c-9c84-419b-af32-5ff29723bdbf", "sourceTokenIds": [5], "targetTokenIds": [13] },
      { "id": "b4fe3918-42dc-46d1-a507-ddf42dc800f9", "sourceTokenIds": [6], "targetTokenIds": [11] },
      { "id": "835ccda4-ff64-4fa1-9b42-69e2dd4f643b", "sourceTokenIds": [7], "targetTokenIds": [17] },
      { "id": "4073a610-fdfb-49e1-90d1-42ee25e7e4a1", "sourceTokenIds": [8], "targetTokenIds": [19] },
      { "id": "35855a8f-b7d1-405c-95b6-3002243164db", "sourceTokenIds": [9], "targetTokenIds": [23, 25] },
      { "id": "434b77e0-37d9-418e-a365-ab2493e20488", "sourceTokenIds": [10], "targetTokenIds": [15] }
    ],
    "breaks": {
      "attestation": [],
      "translation": [10]
    }
  }
}
```

## Alignment data

Tokens reconstruct canonical text by ordered concatenation; mappings use
side-local token IDs; breaks describe presentation.

`alignment.breaks.attestation` and `.translation` are independent, sorted, unique
integer arrays. Boundary b means before index b; valid positions satisfy
0 < b < tokenCount. Empty and one-token sequences use empty arrays. Adjacent
boundaries are allowed; duplicate boundaries cannot encode empty lines.

Textual whitespace remains in tokens. A translation break after whitespace may
visually replace that whitespace with a `<br>`; removing the break reveals the
same canonical space. Punctuation grouping cannot cross explicit source breaks.
Line edits do not modify IDs, token text, mappings, or pinyin. Token IDs need
not match index or numeric order. A token has at most one mapping owner on
each side.

## What a valid file satisfies

The build rejects a committed file that breaks one of these rules, and the
same checker runs on any file, such as one Quote Slicer has just written:
`pnpm --filter @verbarium/web validate-quotations path/to/file.json` (from
the repository root; without a path it checks every committed file, including
their names).

1. the file parses as JSON and is an object with only the keys above,
   `sourceLink` being the one that may be missing;
2. `formatVersion` is `1`;
3. `provenance` is a non-empty string; `sourceLink`, if present, is an
   absolute `http` or `https` URL;
4. every token has an `id` that is a non-negative safe integer, unique on
   its side, a non-empty `text`, and a `type` from its side's list;
5. `pinyin` follows the three states under *Pinyin*, and appears only on
   source tokens;
6. the canonical text of each side has no leading or trailing whitespace;
7. every mapping has a non-empty string `id`, unique among the mappings,
   and its token IDs exist on the matching side; no token ID is listed twice
   in one mapping or claimed by two mappings on the same side;
8. each `breaks` array is sorted, has no duplicates, and every position
   satisfies 0 < b < tokenCount for its side.

The rules say whether a file is well formed, not whether its content is
right. Nothing in the file says what the text should be, so the content of
the committed quotations is guarded by their snapshot tests in
`apps/web/app/content/quotes/`, which fail when a character or a word
changes.

## Producer proof

`apps/web/app/content/quotes/quote-slicer-dao-one.ts` contains the unchanged object
captured from Quote Slicer's browser authoring test. Only a typed declaration was
wrapped around it. Renderer tests use that object for the existing Dao quotation
break, canonical text, provenance/source-link, hover, and touch regressions.
It is a test fixture, not a committed quotation: the Dao quotation itself is
`L001A-Q02-dao-one`, and content tests compare its tokens, breaks and mapping
correspondence against the captured export.

All 17 Lesson 1 quotations already satisfied the alignment rules before the
producer migration. Canonical text snapshots and ID/reference/ownership checks
guard their content.

## Later

The files are the input of the import script that loads quotations into
Supabase after the MVP ([#30](https://github.com/ebbmango/verbarium/issues/30));
the Quote ID stays the public identifier, and the remaining questions about
it are [#31](https://github.com/ebbmango/verbarium/issues/31). Version
negotiation, responsive break variants and transliteration presentation are
not part of format version 1.
