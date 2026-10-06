# Lesson authoring rules

Lessons are MDX files under `apps/web/app/content/lessons/`, one per lesson
(`001.mdx`). The web app compiles them with a component map, and the phone
app (Stage 7, [#29](https://github.com/ebbmango/verbarium/issues/29)) will
compile the same files with a native component map. Whatever the native
renderer cannot show has to be rewritten later, so these rules keep every
lesson portable. They are what Hylia's *Lesson Content Architecture*
decision requires, applied to what Lesson 1 actually needed.

## The three rules

1. **No raw HTML tags.** A tag written in JSX (`<p>`, `<hr>`, `<span>`,
   `<strong>`, `<br>`, `<blockquote>`, `<button>`, `<div>`) bypasses the
   component map and reaches the phone as a web tag it cannot draw. Write
   markdown, or use a lesson component.
2. **No `className` and no `style`.** They mean nothing on the phone.
   Components carry their own presentation; a lesson never adjusts it.
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
| `*` emphasis is fine too | `*…*` |
| `<br/>` inside a paragraph | End the line with a backslash: `Blood.\` then the next line. |
| `<span lang="zh-Hant">一</span>` | `一` |
| `<hr className="lesson-divider lesson-divider-dashed" />` | `---` on its own line: the dashed divider between characters. |
| `<hr className="lesson-divider lesson-divider-solid" />` before a `<SectionBreak>` | Nothing: `SectionBreak` draws its own solid rule. |
| `<blockquote className="lesson-closing-quote" lang="zh-Hant">…</blockquote>` | `<ClosingLine>千里之行始於足下</ClosingLine>` inside `<LessonComplete>`. |
| `<button>Finish lesson</button>` | `<FinishLesson lesson={1} />` inside `<LessonComplete>`. |
| `style={{ marginTop: "70px" }}` or any `style`/`className` | Nothing. If a component looks wrong, change the component, not the lesson. |

Markdown a lesson may use: paragraphs, `**bold**`, `*italic*`, a hard line
break (`\` at the end of a line), the `---` divider, and `[links](https://…)`.
Everything else is a component.

## The components

| Component | What it is for |
| --- | --- |
| `<LessonHeader number={1} total={177} primitive="一" />` | The lesson's title block. Once per lesson, first. |
| `<CharDisplay character="雨" label="B" />` | Opens a character's section: the big character and its letter. |
| `<CharacterForms character="雨" description="Old and new form of the character" forms={2} />` | The historical-forms study. `forms` is how many cards; `character` fills the last one. |
| `<Quote id="L001B-Q01" />` | A quotation by its Quote ID; the file carries the text, provenance and source link. |
| `<SectionBreak ordinal="First">…</SectionBreak>` | One of the lesson's numbered divisions; its text is a paragraph. Draws the solid rule above itself. |
| `<Commentary>…</Commentary>` | An aside of paragraphs; may contain `<CharacterForms>`. |
| `<CharacterFocus character="丂" />` | One large character standing alone in the prose. |
| `<LessonComplete>` with `<FinishLesson lesson={1} />` and `<ClosingLine>…</ClosingLine>` | The end of the lesson: the button that records the completion, then the vertical closing line. Lessons after Lesson 1 close with `盡人事聽天命` ([#25](https://github.com/ebbmango/verbarium/issues/25)). |

Props may contain Chinese (`character="一"`); the component marks it.

## Prose

- A blank line separates paragraphs. Wrapping a paragraph over several lines
  is fine on the web and the phone build collapses the wraps, but a line
  break that must show is written with a trailing backslash.
- Comments `{/* … */}` are allowed and vanish from both builds; Lesson 1
  keeps each quotation's text above its `<Quote>` that way.
- The `{/* … */}` form is the only JSX expression a lesson should contain:
  no `{variables}`, no imports. Everything a lesson needs comes from its
  components and the quotation files.

## Checking a lesson

```bash
grep -nE '<(p|hr|br|strong|span|blockquote|button|div)[ />]|className=|style=|^import ' apps/web/app/content/lessons/001.mdx
```

No output means the lesson follows the rules. Lesson 1 was brought in line
by [#21](https://github.com/ebbmango/verbarium/issues/21).
