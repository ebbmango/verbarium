# Lesson authoring rules

Lessons are MDX files under `apps/web/app/content/lessons/`, one per lesson,
named by the lesson's number: `001.mdx` is Lesson 1, served at `/lessons/1`.
Each lesson starts with one `<LessonHeader>` on a line of its own, and its
`number` must be the one in the file name. The build fails, naming the file,
for a file named any other way, a missing or second header, or another number. The web app compiles them with a component map, and the phone
app (Phase 7, [#29](https://github.com/ebbmango/verbarium/issues/29)) will
compile the same files with a native component map. Whatever the native
renderer cannot show has to be rewritten later, so these rules keep every
lesson portable. They are what Hylia's *Lesson Content Architecture*
decision requires, applied to what Lesson 1 needed.

## The three rules

1. **No raw HTML tags.** A tag written in JSX (`<p>`, `<hr>`, `<span>`,
   `<strong>`, `<br>`, `<blockquote>`, anything in lower case) bypasses the
   component map and reaches the phone as a web tag it cannot draw. Write
   markdown, or use a lesson component.
2. **No `className` and no `style`.** They mean nothing on the phone.
   Components carry their own presentation; a lesson never adjusts it. If a
   component looks wrong, change the component, not the lesson.
3. **Type Chinese as plain characters.** The build marks every run of
   Chinese characters in prose automatically, so the web gives it
   `lang="zh-Hant"` (screen readers switch voice) and the phone gives it
   the WenKai font (it has no font fallback). Never write
   `<span lang="zh-Hant">` by hand. Decided 2026-10-06 on
   [#20](https://github.com/ebbmango/verbarium/issues/20).

## What to write instead

| Instead of | Write |
| --- | --- |
| `<p>…</p>`, also inside `<Commentary>` | A paragraph: the text, with a blank line before and after it. |
| `<strong>…</strong>` | `**…**` |
| `<br/>` inside a paragraph | End the line with a backslash: `Blood.\` then the next line. |
| `<span lang="zh-Hant">一</span>` | `一` |
| `<hr className="lesson-divider lesson-divider-dashed" />` | `---` on a line of its own, with a blank line above and below it (without the blank line above, markdown turns the previous line into a heading). |
| `<hr className="lesson-divider lesson-divider-solid" />` before a `<SectionBreak>` | Nothing: `SectionBreak` draws the solid rule itself. |
| `<blockquote className="lesson-closing-quote" lang="zh-Hant">…</blockquote>` | `<ClosingLine>千里之行　始於足下</ClosingLine>` inside `<LessonComplete>`. |

Markdown a lesson may use: paragraphs, `**bold**`, `*italic*`, a hard line
break (`\` at the end of a line) and the `---` divider. Everything else is a
component.

`---` is the one visual separator a lesson writes itself: the dashed line
between two characters of the same division. A new division of the lesson
(*First*, *Second*, …) is a `SectionBreak`, which carries its own solid rule.
Use `<SectionBreak ordinal="Third" marker="上">` to add a progress marker
for 上 (“up”) at the rule itself. This is useful when the division opens
with prose or a comparison instead of a character heading.

A character's stop on the chapter strip jumps to its section's divider or, in
a Commentary, to the display itself. When that would cut off the prose that
introduces the character, put `<ChapterStart />` on its own line before that
prose. The jump then puts the end of the element just above the marker at the
top of the screen, so the fade swallows that element and the introduction
shows whole. Keep the marker before the introduction, never between the
introduction and the display, and with no other display or divider between it
and the display it belongs to.


## The components

| Component | What it is for |
| --- | --- |
| `<LessonHeader number={1} subtitle="About the primitive 一, a single stroke." />` | The lesson's title block: the title and your subtitle. Once per lesson, first. The subtitle is plain text in quotes; it is also the lesson's line in the lesson index and the page description. To put a double quote in it, write the subtitle between single quotes: `subtitle='About "one" stroke.'`. |
| `<CharDisplay character="雨" label="B" reading="yǔ" />` | Opens a character's section: the big character, its letter, and the reading the lesson teaches, which must be one of those on its dictionary page. The character links to its dictionary page once it has one, and that page names this lesson. |
| `<CharDisplay character="極" reading="jí" />` | The same display without `label`, for a character shown in passing, as inside a `<Commentary>`: no letter seal and no section anchor, same size, still a heading, and its dictionary page still names this lesson. |
| `<CharacterForms character="雨" description="Old and new forms of the character" historical="sinica-03-oracle-bone-雨 sinica-08-bronze-雨" />` | The historical-forms study. `historical` names the pictures in `apps/web/public/forms/`, oldest first, by file name, separated by spaces (a name without an extension means `.svg`; give other names in full, e.g. `….png`); `character` fills the last card. Pictures take the colour of the text around them. `forms` is a minimum card count; cards without a picture show a placeholder. |
| `<Quote id="L001B-Q01" />` | A quotation by its Quote ID; the quotation file carries the text, provenance and source link. |
| `<SectionBreak ordinal="First">…</SectionBreak>` | One of the lesson's numbered divisions; its text is a paragraph that reads on from the ordinal ("First, when written…"), so it starts in lower case. |
| `<Commentary>…</Commentary>` | An aside of paragraphs; may contain `<CharacterForms>`. |
| `<CharacterFocus character="丂" />` | One large character standing alone in the prose; not linked. |
| `<CharacterFocus character="示" highlight="1 2" />` | One large character with some strokes in ink and the rest grey, the ink ones named by their numbers in stroke order, separated by spaces. Needs the character's stroke outlines in `app/content/strokes/<character>.json` (see below); a number the character lacks stops the build. |
| `<CharacterFocus character="丂" size="small" />` | Any `<CharacterFocus>` at two-thirds size, as the design sets a 96 px character beside its 144 px ones; captions keep their size. `size="small"` is the only size. |
| `<CharacterFocus characters="二 上" />` | Multiple large characters side by side, separated by spaces in the prop; not linked. The row is centered and wraps on narrow screens. Use either `character` or `characters`. Each character is recorded for the dictionary's lesson references. |
| `<LessonComplete>` with `<FinishLesson lesson={1} />` and `<ClosingLine>…</ClosingLine>` | The end of the lesson: the button that records the completion, then the vertical closing line. Lessons after Lesson 1 close with `盡人事　聽天命`: the full-width space (U+3000) is the gap between the words, as in Lesson 1's line ([#25](https://github.com/ebbmango/verbarium/issues/25)). |

Props may contain Chinese (`character="一"`); the component marks it.
Numbers go in braces (`lesson={1}`, `forms={3}`), text in quotes.

`LessonHeader` also accepts one paragraph of plain body text instead of the
`subtitle` prop. End a line with a backslash to force a line break in the
subtitle; an ordinary source newline remains a space. For example:

```mdx
<LessonHeader number={3}>
About 三,\
three strokes, and its derivatives.
</LessonHeader>
```

Use either body text or `subtitle`, not both. The lesson index and page
description use the same text with line breaks replaced by spaces.

## Displayed source names

On the first line, name the work where the reader can find the passage.
On the second, use `sourceDetails` for the person who wrote the quoted
words when known. If the linked work preserves a quotation from an earlier
work, record the earlier attribution in research notes or an MDX comment.
Keep chapter names, locators and bibliographical details in those notes.
Use `sourceLink` for the online textual witness.

For example, a quotation file can use `"provenance": "Commentary on the Dao De Jing"` and
`"sourceDetails": "Wang Bi"`. Add or edit these fields
in the JSON file; remove `sourceDetails` entirely when there are no details.
The file format and validator are described in [quotation-contract.md](quotation-contract.md).

Inline quotations also accept details:
`<LegacyQuote source="Rhapsody on the Western Capital" sourceDetails="Zhang Heng">…</LegacyQuote>`.
Existing titles and quotations without details keep their current presentation.

## The seals

A lesson's 課 seal and its A–J markers are images baked once from a drawing
(`apps/web/app/lib/seal.ts`), so every browser shows the same print. After
adding a lesson or a `<CharDisplay>`, or changing the drawing, run
`pnpm bake-seals` in `apps/web` (needs Google Chrome and the network) and
commit `public/seals/`; a test fails until the images match the drawing.

## The historical-form pictures

### Historical forms in a focus display

Keep the single-character and space-separated shortcuts for ordinary text. For
illustrated comparisons, put one `FocusItem` per position inside the focus:

```mdx
<CharacterFocus>
  <FocusItem name="2011F.svg" character="𠄟" description="Historical form of down, with the longer stroke above." />
  <FocusItem character="下" />
</CharacterFocus>
```

Add `caption="…"` to any `<FocusItem>` to set a line of English under it,
as in `<FocusItem character="艸" caption="Vegetable" />`. `subcaption="…"`
adds a second, lighter line below it, past a thin rule. Both are set as the
Figma design's component breakdown (Extra Templates), in the lesson's prose
font: Medium for the caption and Light for the subcaption, upright, sized in proportion to
the characters' full size. For Markdown in them, such as italics, write them as children
instead of props (one or the other, not both), `<Caption>` first:

```mdx
<CharacterFocus>
  <FocusItem character="祘">
    <Caption>*suàn*</Caption>
    <Subcaption>Phonetic</Subcaption>
  </FocusItem>
  <FocusItem character="艸" caption="Vegetable" subcaption="Semantic" />
</CharacterFocus>
```

Add a bare `spine` to a text `<FocusItem>` that a font draws off centre, such
as a radical form: `<FocusItem character="礻" caption="Spirit" spine />`. It
centres the character's ink in its box and its captions under its spine, the
column with the longest unbroken vertical run of ink, such as the upright
stroke of 礻. A character with two uprights about as tall (艸, 祘) has no
single spine, so its captions stay centred under its ink. Without `spine`, the
character and its captions sit centred in the character's box.

Add `nudge="…"` to a text `<FocusItem>`, or to a single
`<CharacterFocus character="…">`, for a character that measures centred but
looks off centre (艸 can look a little left). It moves the character sideways
by that fraction of its size, positive to the right and negative to the left,
as in `nudge="0.03"` or `nudge="-0.02"`; its captions stay where they are. The
build accepts values between -0.5 and 0.5.

A single illustrated child works too. Give each picture its local forms filename
and a short English description. Register its source under that exact name in
`formSources`. The picture links to its source and uses the surrounding ink.
Keep the natural margins in the artwork's viewBox when preparing a form.

Supply `character` when the depicted form has a Unicode representation, even
when a font cannot display it. Readers copy that text. Omit it for an
unencoded form. Use `headword` when the dictionary reference should point to
a particular entry. Without it the compiler uses `character`, or skips the
item if neither is present. These fields take quoted literals.

### Inline forms

Use `<InlineForm name="又-bigseal.svg" character="又" />` within a prose
sentence to show an SVG in place of a character. `name` identifies an asset
in `public/forms/`, with the same filename rules as `CharacterForms`.
`character` is the real text equivalent for selection, copying and screen
readers. The SVG is a decorative overlay, sized to one em and coloured with
the surrounding text. Use this for a single character; use `CharacterForms`
for a standalone study. The `又-bigseal.svg` asset was supplied by the user.

### Standalone forms

For a custom layout, put each row inside a `FormRow`. Rows keep their order
and are centered independently. Within a row, spaces, tabs, and newlines
separate entries, so each filename can sit on its own line:

```mdx
<CharacterForms character="示" description="Historical and current forms of 示">
  <FormRow>
    sinica-05-oracle-bone-示
    sinica-07-oracle-bone-示
    sinica-06-oracle-bone-示
  </FormRow>
  <FormRow>
    sinica-12-chu-slip-示
    sinica-15-small-seal-示
  </FormRow>
  <FormRow>
    sinica-16-small-seal-示
    sinica-17-clerical-示
    current
  </FormRow>
</CharacterForms>
```

This makes rows of 3, 2, and 3. `current` places the `character` at that exact
position; it may appear once and is not added automatically. Within a
`FormRow`, blank lines and indentation are ignored. Filenames keep the usual extension rules, and
`glyph:X` still displays a text form. Use body rows instead of `historical`
and `forms`; the existing prop form keeps its automatic balanced layout.
`FormRow` takes no attributes and must be directly inside `CharacterForms`.
The original body shorthand (one row per source line, without `FormRow`)
also works, but cannot be mixed with explicit rows in the same component.

Candidate pictures for each character are collected, with their sources
(`sources.tsv`) and a `report.md`, in the sibling research repository at
`../wieger-research/by-lesson/<lesson>/<letter>/`, e.g.
`../wieger-research/by-lesson/001/B/` for Lesson 1's 雨. To show one, copy the
picture into `apps/web/public/forms/` as an SVG, keeping its file name (trace a PNG with potrace: flatten on white, scale 4×, threshold at half grey, `potrace -s --flat -t 8 -a 1.0 -O 0.4 -r 288`; the SVG goes into `hanzi-old-forms` and beside its PNG in the research folder), and add that name
to the `historical` prop.
Then add its line to `apps/web/app/content/forms/form-sources.ts`: the web page
it was taken from (its `web address` in `sources.tsv`) and a short label. Each
picture links to that page, and a test fails for a shown picture without one.
The current form links to its dictionary page when it has one.

### Adding a form from a research pack

1. Read `../wieger-research/forms/packs/<unit>/pack.json` (for example,
   `002C/pack.json`). Match the requested name's number and period to an entry
   in `sinica_forms`; use that entry's `image` path and source label. Inspect
   the image before tracing. Black strokes on transparency can look entirely
   black in a dark image viewer.
2. Trace the original PNG to the exact name referenced by the lesson. For the
   research pack's 8-bit RGBA PNGs, the dependency-free Python helper below
   decodes transparency, flattens onto white, scales 4× with nearest-neighbour
   sampling, thresholds at half grey, and runs the potrace settings above.
   It requires `potrace` on PATH and rejects unsupported PNG encodings.

   ```bash
   python3 apps/web/scripts/trace-form.py \
     ../wieger-research/forms/sinica/images/4f5e/00.png \
     apps/web/public/forms/sinica-01-small-seal-佞.svg
   ```

3. Add the exact asset name to `formSources` in
   `apps/web/app/content/forms/form-sources.ts`. Link to the character's own
   Sinica page, `https://xiaoxue.iis.sinica.edu.tw/yanbian/?char=…`, and use
   the pack's source label. A missing source entry loses the clickable
   attribution; a missing SVG makes the CSS mask blank even when the lesson
   markup is correct.
4. Add `<CharacterForms>` to the unit, normally after its opening gloss, with
   the asset name in `historical` and the modern character in `character`.
   Inspect the resulting stroke silhouette and check the historical and
   current forms on the lesson page.
5. Save master copies in the private `hanzi-old-forms` repository and beside
   the research PNG, following the persistence instructions below. If those
   directories are outside the session's writable roots, report that step
   as pending: the ignored file in `public/forms/` fixes localhost only.
   `fetch-forms` deletes local `sinica-*.svg` files before copying masters,
   so an unsaved master will disappear on the next fetch.
6. Check all referenced files and source links:

   ```bash
   pnpm --filter @verbarium/web test app/content/forms/form-sources.test.ts
   ```

The 小學堂 pictures (`public/forms/sinica-*`) are shown on the site but kept
out of this public repo (`.gitignore`). Their master copies live in the private
repo `ebbmango/hanzi-old-forms`, cloned beside this one
(`gh repo clone ebbmango/hanzi-old-forms` in the folder that holds `verbarium`):

- To add one, commit and push it in `hanzi-old-forms`, then run
  `pnpm fetch-forms` in `apps/web` to copy them into `public/forms/`. Run it on a
  fresh clone too, before the dev server or the tests; a test fails for any
  shown picture whose file is missing.
- The deploy workflow checks out `hanzi-old-forms` and copies them itself, with
  the repository secret `FORMS_REPO_TOKEN`: a fine-grained token with read-only
  Contents access to `ebbmango/hanzi-old-forms` only. If the token expires or
  is revoked, the deploy stops at "Check out historical-form pictures"; make a new one and
  replace the secret.

## The form-study font

Historical-form studies set their current form in TW-Kai, shipped whole as
`apps/web/public/fonts/tw-kai.woff2` (15 MB, every glyph of `TW-Kai-98_1.ttf`
from `Fonts_Kai.zip` at <https://www.cns11643.gov.tw/opendata/>, converted to
woff2 with fontTools). While lessons are still being written, every character
is there. Before launch, cut it down to the displayed characters
(fontTools' `pyftsubset`, `--flavor=woff2`) so pages do not load 15 MB.
The font is OFL 1.1; its licence stays beside it.

## Prose

- A blank line separates paragraphs. Wrapping a paragraph over several lines
  is fine: the web collapses the wraps and the phone build will too.
- Put a component's text on its own lines, as Lesson 1 does for
  `<SectionBreak>` and `<Commentary>`: markdown then makes it a paragraph,
  and the build marks its Chinese. Text written on the tag's own line is
  handed to the component as it is, which is what `<ClosingLine>` wants.
- Comments `{/* … */}` vanish from both builds; Lesson 1 keeps each
  quotation's text above its `<Quote>` that way. Apart from comments and
  numeric props, a lesson contains no braces: no variables, no imports.
  Everything a lesson needs comes from its components and the quotation
  files.

## Checking a lesson

```bash
grep -nE '<[a-z]|className=|style=|^import ' apps/web/app/content/lessons/001.mdx
```

No output means the lesson follows the rules: every tag starts with a
capital letter, so it is a component.

## Characters in parts

`<CharacterFocus character="蒜" parts />` draws its character from
`apps/web/app/content/parts/<character>.json`: the character's shapes, cut from
TW-Kai like the stroke outlines below, grouped under each part's name. A part's
name is a character, as a `<FocusItem>` shows it (蒜 has `艸` and `祘`).

Words of the prose wrapped in `<PartWords part="艸">` link to that part, in
the blocks before or after the drawn character, up to the next character drawn
in parts. Linked words and parts rest grey, which shows they respond to the
pointer. Pointing at the words or at the part's ink brings both back to ink, in
and out over 280 ms like a quotation's mappings; the rest stays grey. A `<PartWords>`
naming no part of a character drawn in parts in the lesson stops the build.
`parts` is written bare, takes captions like any single character, and can't be
combined with `highlight`.

```mdx
<CharacterFocus character="蒜" parts />

The <PartWords part="艸">*vegetable*</PartWords> called <PartWords part="祘">*suàn*</PartWords>.
```

When the font draws two parts as separate shapes, as TW-Kai does for 蒜, the
file only groups whole shapes. Where a shape crosses between parts it has to be
cut by hand, as for the strokes of 示. Record how a file was made in its
`notes`.

## Stroke outlines

`<CharacterFocus highlight>` draws its character from
`apps/web/app/content/strokes/<character>.json`: the strokes as SVG paths, in
stroke order, cut from TW-Kai, the font `<CharacterFocus>` uses. A font stores
filled shapes, not strokes, and joins touching strokes into one shape, so each
file is split by hand from the glyph's outlines: whole contours where a stroke
stands alone, and a cut along the joined stroke's own edge where two strokes
meet. Strokes are painted last first, so an earlier stroke lies over the start of
a later one; a stroke that starts on another runs a little way under it, which
keeps the join seamless. The outlines derive from TW-Kai and stay under its SIL
Open Font License. Record how a file was split in its `notes`.
