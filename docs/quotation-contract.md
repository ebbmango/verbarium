# Quotation contract

Quote Slicer produces `AttestationTranslationAlignment`, defined in
`apps/web/app/quote-slicer-export.ts`. Tokens reconstruct canonical text by ordered
concatenation; mappings use side-local token IDs; breaks describe presentation.

`alignment.breaks.attestation` and `.translation` are independent, sorted, unique
integer arrays. Boundary b means before index b; valid positions satisfy
0 < b < tokenCount. Empty and one-token sequences use empty arrays. Adjacent
boundaries are allowed; duplicate boundaries cannot encode empty lines.

Textual whitespace remains in tokens. A translation break after whitespace may
visually replace that whitespace with a `<br>`; removing the break reveals the
same canonical space. Punctuation grouping cannot cross explicit source breaks.
Line edits do not modify IDs, token text, mappings, or pinyin. Missing/undefined,
null, and string pinyin retain distinct semantics. Token IDs need not match index
or numeric order. A token has at most one mapping owner on each side.

Provenance and `sourceHref` remain separate Quote props. The DBML continues to
describe durable entities incrementally; this migration does not add database
storage, permanent quotation identity, version negotiation, responsive break
variants, or transliteration presentation.

## Producer proof

`apps/web/app/content/quotes/quote-slicer-dao-one.ts` contains the unchanged object
captured from Quote Slicer's browser authoring test. Only a typed declaration was
wrapped around it. Renderer tests use that object for the existing Dao quotation
break, canonical text, provenance/source-link, hover, and touch regressions.
The original lesson asset remains unchanged; content tests compare its tokens,
breaks and mapping correspondence against the captured export.

All 17 existing assets already used this contract before the producer migration.
Canonical text snapshots and ID/reference/ownership checks guard their content.
The blocked-breath missing-space correction is complete. The separate trailing
translation space in L001C-Q03 is preserved pending editorial review.
