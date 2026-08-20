# Verbarium

Verbarium is a reading environment for Literary and Classical Chinese. Its lessons combine authored narrative with quotations whose source text and translation can be explored through many-to-many alignment.

## Language

**Quote Slicer export**:
The complete authoring payload for one quotation: provenance text, ordered source and target tokens, line assignments, and many-to-many mappings. This is the canonical term in specifications and tickets.

**Quote ID**:
The public identifier through which lesson content will refer to a persisted quotation. It has the form `LNNNTQNN`, such as `L001AQ01`: a zero-padded three-digit lesson number, a subsection tag letter, and a zero-padded two-digit quote number assigned within that subsection.
_Avoid_: Quote reference

**Mapping**:
A single alignment group containing any number of source-token IDs and target-token IDs. Activating any member activates every member on both sides.
_Avoid_: Link (ambiguous with hyperlinks)

**Provenance**:
The attribution text that identifies the work or context from which a quotation comes.
_Avoid_: Source link

**Source link**:
The URL of the selected online textual witness for a quotation.
_Avoid_: Provenance link
