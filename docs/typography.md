# Typography

Reference for the design follow-ups labelled `design` in the issue tracker.

- Font loading and all visual styles are in `apps/web/app/styles.css`.
- Lesson content is in `apps/web/app/content/lessons/001.mdx`.
- MDX presentation components are in `apps/web/app/components/lesson.tsx`.
- Original Chinese quote paragraphs are marked `lang="zh-Hant"`. They use LXGW WenKai Mono TC at weight 300.
- Chinese embedded in translations or Latin prose falls back to WenKai at weight 400. In lesson prose it is wrapped in `<span lang="zh-Hant">` at build time by `apps/web/app/mdx/rehype-han-runs.ts`; text that components get in a prop, such as a lesson subtitle, is wrapped the same way by `HanMarkedText`. Authors type plain characters (see `docs/lesson-authoring.md`).
- English lesson prose and translations use Source Serif 4.
- Large section-head characters (A, B, C, and so on) use Noto Serif TC, and so does a dictionary page's headword, at the same size. Its readings are Source Serif 4 italic.
- Form-study glyphs and standalone character-focus displays retain the Kaiti/Songti system stack.
