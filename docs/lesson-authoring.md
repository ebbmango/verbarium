# Lesson authoring rules

Lessons are MDX files under `apps/web/app/content/lessons/`, one per lesson,
named by the lesson's number: `001.mdx` is Lesson 1, served at `/lessons/1`.
The number in the file name must be the one `<LessonHeader number={…}>` shows;
a file named any other way, or a header with another number, fails the build. The web app compiles them with a component map, and the phone
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
| `<blockquote className="lesson-closing-quote" lang="zh-Hant">…</blockquote>` | `<ClosingLine>千里之行始於足下</ClosingLine>` inside `<LessonComplete>`. |

Markdown a lesson may use: paragraphs, `**bold**`, `*italic*`, a hard line
break (`\` at the end of a line) and the `---` divider. Everything else is a
component.

`---` is the one visual separator a lesson writes itself: the dashed line
between two characters of the same division. A new division of the lesson
(*First*, *Second*, …) is a `SectionBreak`, which carries its own solid rule.

## The components

| Component | What it is for |
| --- | --- |
| `<LessonHeader number={1} subtitle="About the primitive 一, a single stroke." />` | The lesson's title block: the title, your subtitle, and the course position (Lesson 1 of 177). Once per lesson, first. The subtitle is plain text in quotes; it is also the lesson's line in the lesson index and the page description. |
| `<CharDisplay character="雨" label="B" />` | Opens a character's section: the big character and its letter. |
| `<CharacterForms character="雨" description="Old and new form of the character" forms={2} />` | The historical-forms study. `forms` is how many cards; `character` fills the last one. |
| `<Quote id="L001B-Q01" />` | A quotation by its Quote ID; the quotation file carries the text, provenance and source link. |
| `<SectionBreak ordinal="First">…</SectionBreak>` | One of the lesson's numbered divisions; its text is a paragraph. |
| `<Commentary>…</Commentary>` | An aside of paragraphs; may contain `<CharacterForms>`. |
| `<CharacterFocus character="丂" />` | One large character standing alone in the prose. |
| `<LessonComplete>` with `<FinishLesson lesson={1} />` and `<ClosingLine>…</ClosingLine>` | The end of the lesson: the button that records the completion, then the vertical closing line. Lessons after Lesson 1 close with `盡 人 事  聽 天 命`, spaces included: they are the gaps between the words ([#25](https://github.com/ebbmango/verbarium/issues/25)). |

Props may contain Chinese (`character="一"`); the component marks it.
Numbers go in braces (`lesson={1}`, `forms={3}`), text in quotes.

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
