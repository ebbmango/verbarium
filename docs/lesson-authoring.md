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

## The components

| Component | What it is for |
| --- | --- |
| `<LessonHeader number={1} subtitle="About the primitive 一, a single stroke." />` | The lesson's title block: the title and your subtitle. Once per lesson, first. The subtitle is plain text in quotes; it is also the lesson's line in the lesson index and the page description. To put a double quote in it, write the subtitle between single quotes: `subtitle='About "one" stroke.'`. |
| `<CharDisplay character="雨" label="B" reading="yǔ" />` | Opens a character's section: the big character, its letter, and the reading the lesson teaches, which must be one of those on its dictionary page. The character links to its dictionary page once it has one, and that page names this lesson. |
| `<CharacterForms character="雨" description="Old and new forms of the character" historical="sinica-03-oracle-bone-雨 sinica-08-bronze-雨" />` | The historical-forms study. `historical` names the pictures in `apps/web/public/forms/`, oldest first, by file name, separated by spaces (a name without an extension means `.svg`; give other names in full, e.g. `….png`); `character` fills the last card. Pictures take the colour of the text around them. `forms` is a minimum card count; cards without a picture show a placeholder. |
| `<Quote id="L001B-Q01" />` | A quotation by its Quote ID; the quotation file carries the text, provenance and source link. |
| `<SectionBreak ordinal="First">…</SectionBreak>` | One of the lesson's numbered divisions; its text is a paragraph that reads on from the ordinal ("First, when written…"), so it starts in lower case. |
| `<Commentary>…</Commentary>` | An aside of paragraphs; may contain `<CharacterForms>`. |
| `<CharacterFocus character="丂" />` | One large character standing alone in the prose; not linked. |
| `<LessonComplete>` with `<FinishLesson lesson={1} />` and `<ClosingLine>…</ClosingLine>` | The end of the lesson: the button that records the completion, then the vertical closing line. Lessons after Lesson 1 close with `盡人事　聽天命`: the full-width space (U+3000) is the gap between the words, as in Lesson 1's line ([#25](https://github.com/ebbmango/verbarium/issues/25)). |

Props may contain Chinese (`character="一"`); the component marks it.
Numbers go in braces (`lesson={1}`, `forms={3}`), text in quotes.

## The seals

A lesson's 課 seal and its A–J markers are images baked once from a drawing
(`apps/web/app/lib/seal.ts`), so every browser shows the same print. After
adding a lesson or a `<CharDisplay>`, or changing the drawing, run
`pnpm bake-seals` in `apps/web` (needs Google Chrome and the network) and
commit `public/seals/`; a test fails until the images match the drawing.

## The historical-form pictures

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
