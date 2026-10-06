# Quotation contract

A quotation is one attestation, one translation and their alignment. Quote
Slicer produces it; Verbarium commits it as a **quotation file** and lessons
show it through `<Quote>`. This document defines the file and the invariants
of the alignment data inside it. The application types are in
`apps/web/app/quote-slicer-export.ts`.

## Quotation file

### Where it lives and what it is called

One file per quotation, under `apps/web/app/content/quotes/`, named by its
Quote asset name: the Quote ID, a hyphen, a short slug, and `.json`, as in
`L001I-Q01-blocked-breath.json`. The Quote ID is the file's identity and is
not repeated inside it: Quote Slicer does not know it (the lesson author
assigns it when committing), and one place to change is enough.

### Fields

A file is one JSON object with these keys, in this order:

| Key | Type | Meaning |
| --- | --- | --- |
| `formatVersion` | integer | The version of this format. Currently `1`. A reader rejects any other value. |
| `provenance` | string, non-empty | The attribution text that identifies the work or context the quotation comes from, as the lesson shows it under the quotation: `"Shuowen Jiezi"`, `"The Analects 16.7"`. |
| `sourceLink` | string, optional | The URL of the selected online textual witness, absolute and `http` or `https`. Omitted when there is none; never `null` or empty. |
| `attestation` | object | `{ "tokens": SourceToken[] }`: the source text, tokenized. |
| `translation` | object | `{ "tokens": TargetToken[] }`: the translation, tokenized. |
| `alignment` | object | `{ "mappings": QuoteMapping[], "breaks": { "attestation": number[], "translation": number[] } }`. |

No other keys are allowed, at any level: an unknown key is a mistake, not an
extension. The next format version is the place for new keys.

A **SourceToken** is `{ "id": integer, "text": string, "type": "character" | "punctuation" | "number" | "symbol", "pinyin"?: string | null }`.
A **TargetToken** is `{ "id": integer, "text": string, "type": "text" | "hanzi" | "punctuation" | "whitespace" }`.
A **QuoteMapping** is `{ "id": string, "sourceTokenIds": integer[], "targetTokenIds": integer[] }`.

There is no separate `text` field on either side: the tokens are the
canonical, lossless text, reconstructed by concatenating their `text` in
order (Hylia, Lesson Content Architecture).

### Pinyin

`pinyin` appears only on source tokens and has three states, which stay
distinct:

- **absent**: the character has no annotation (yet);
- **`null`**: an annotation does not apply (punctuation, numbers, symbols);
- **a non-empty string**: the annotation, in the tone-number form Quote
  Slicer emits (`"qi4"`). Its presentation is a later concern
  ([#32](https://github.com/ebbmango/verbarium/issues/32)).

JSON has no `undefined`, so "unannotated" is expressed by leaving the key
out, never by writing `null`.

### Strictness and layout

The file is strict JSON (RFC 8259), encoded as UTF-8 without a byte order
mark: no comments, no trailing commas, no `undefined`. Characters outside the
Basic Multilingual Plane, such as `𠃑`, are written as themselves, not
escaped.

Layout is not part of the format: any serialization of the same value is the
same quotation. The committed files use one layout so that diffs stay small
and Quote Slicer's export can be committed unchanged: two-space indentation,
keys in the order given above and `id`, `text`, `type`, `pinyin` inside a
token, each token and each mapping on one line, arrays of numbers on one
line, and a final newline.

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
      { "id": 0, "text": "气", "type": "character", "pinyin": "qi4" },
      { "id": 1, "text": "欲", "type": "character", "pinyin": "yu4" },
      { "id": 2, "text": "舒", "type": "character", "pinyin": "shu1" },
      { "id": 3, "text": "出", "type": "character", "pinyin": "chu1" },
      { "id": 4, "text": "。", "type": "punctuation", "pinyin": null },
      { "id": 5, "text": "𠃑", "type": "character" },
      { "id": 6, "text": "上", "type": "character", "pinyin": "shang4" },
      { "id": 7, "text": "礙", "type": "character", "pinyin": "ai4" },
      { "id": 8, "text": "於", "type": "character", "pinyin": "yu2" },
      { "id": 9, "text": "一", "type": "character", "pinyin": "yi1" },
      { "id": 10, "text": "也", "type": "character", "pinyin": "ye3" },
      { "id": 11, "text": "。", "type": "punctuation", "pinyin": null }
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

The build checks every committed file against these rules, and the same
checker can be run on any file, such as a fresh Quote Slicer export:

1. the file parses as JSON and is an object with exactly the keys above;
2. `formatVersion` is `1`;
3. `provenance` is a non-empty string; `sourceLink`, if present, is an
   absolute `http` or `https` URL;
4. every token has an `id` that is a non-negative safe integer, unique on
   its side, a non-empty `text`, and a `type` from its side's list;
5. `pinyin` is absent, `null` or a non-empty string, and only on source
   tokens;
6. the canonical text of each side has no leading or trailing whitespace;
7. every mapping has a non-empty string `id`, unique among the mappings,
   and its token IDs exist on the matching side; no token ID is listed twice
   in one mapping or claimed by two mappings on the same side;
8. each `breaks` array is sorted, has no duplicates, and every position
   satisfies 0 < b < tokenCount for its side.

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
guard their content. The blocked-breath missing-space correction is complete.
The trailing translation space in L001C-Q03 was removed after editorial review.

## After the MVP

The files load into Supabase by an import script
([#30](https://github.com/ebbmango/verbarium/issues/30)): `provenance`
becomes a `provenance` row, `sourceLink` the attestation's `witness_url`, and
the token and alignment arrays go into their `jsonb` columns unchanged. The
Quote ID stays the public identifier; the remaining questions about it are
[#31](https://github.com/ebbmango/verbarium/issues/31). Version negotiation,
responsive break variants and transliteration presentation are not part of
format version 1.
