# Verbarium design follow-up

This document is a handoff for future chats. It records only deferred ideas and ideas that are worth testing. Do not treat a proposed treatment as approved unless the item explicitly says it is ready to implement.

## Current typography context

- Font loading and all visual styles are in `apps/web/app/styles.css`.
- Lesson content is in `apps/web/app/content/lessons/001.mdx`.
- MDX presentation components are in `apps/web/app/components/lesson.tsx`.
- Original Chinese quote paragraphs are marked `lang="zh-Hant"`. They use LXGW WenKai Mono TC at weight 300.
- Chinese embedded in translations or Latin prose falls back to WenKai at weight 400.
- English lesson prose and translations use Source Serif 4.
- Large section-head characters (A, B, C, and so on) use Noto Serif TC.
- Form-study glyphs and standalone character-focus displays retain the Kaiti/Songti system stack.

## 1. Fix visual relationships between lead-ins and quotations

**Status:** Deferred, important.

**Problem:** A prose lead-in can appear visually disconnected from the quotation it introduces. The clearest example is “As explained by Duan Yucai:” immediately before the `Shuowen Jiezi Zhu` quote in `001.mdx`. Because the quote begins so far below it, the lead-in can look more closely related to the paragraph above than to the quote below.

**Current spacing involved:**

- `.lesson-manuscript > p` uses a top margin of `1.4rem`.
- `.lesson-quote` uses `margin: 2.65rem auto`.
- Large section gaps range from roughly `8rem` to `9rem`, with separate mobile overrides.

**Investigation:** Start with relationship-aware spacing instead of globally shrinking every gap. Test a smaller top margin when a quote immediately follows a manuscript paragraph, for example a direct-sibling rule such as `.lesson-manuscript > p + .lesson-quote`. Check whether this improves ordinary paragraph-to-quote transitions or whether explicit lead-in markup/component semantics are needed for phrases such as “As explained by…”.

**Constraints:**

- Preserve the spacious manuscript character of the page.
- Avoid making unrelated blocks feel crowded.
- Check the transition both before and after quotes, on desktop and mobile.
- Do not adopt a single global spacing token until the content relationships have been audited.

**Done when:** Introductory sentences clearly read as belonging to the following quote, while major character and category sections still have deliberate breathing room.

## 2. Evaluate the original/translation hierarchy

**Status:** Completed.

**What this means:** The original Chinese and its English translation currently differ mainly through size, font family, and color. One possible treatment—based on quote-slicer—is to make the English translation Source Serif 4 italic at approximately weight 350 while leaving the Chinese original upright WenKai at weight 300. This would visually label one line as the source and the other as editorial translation without adding interface chrome.

**Current behavior:**

- Original: WenKai, `1.7rem`, weight 300, black.
- Translation: Source Serif 4, `1rem`, weight 400, upright, muted gray inherited from `.lesson-quote`.

**Possible test only:** Compare the current translation against `font-style: italic; font-weight: 350`. Do not commit this direction without first showing or clearly explaining the visual effect.

**Decision:** Adopted the italic treatment after comparing short and long quotations at desktop and mobile widths. The translation now reads as a distinct editorial voice without separating it from the original, and the lighter weight remains legible against the paper texture.

**Done when:** The source and translation are immediately distinguishable but still read as one quotation unit.

## 3. Revisit commentary presentation

**Status:** Worth exploring later.

**Problem:** Commentary currently uses a full subtle border and tinted background. Longer commentary sections may benefit from a clearer editorial structure.

**Relevant CSS:** `.lesson-note`, `.lesson-note p`, `.note-title`, and the nested form-study rules in `apps/web/app/styles.css`.

**Ideas to compare:**

- Keep the current full box but refine padding and title placement.
- Replace the full border with a restrained accent edge.
- Compare centered commentary against left-aligned commentary as a treatment local to notes only.

**Constraint:** The general proposal to left-align all manuscript prose was discarded. Do not reintroduce it. Any alignment experiment must be limited to commentary and reviewed independently.

**Done when:** Long notes are easy to follow and visibly distinct from the lesson manuscript without looking like generic application cards.

## 4. Reassess small metadata sizes

**Status:** Ready for later reassessment.

**Candidates:** `.quote-source`, `.character-forms figcaption span`, `.form-label`, and `.lesson-progress`.

**Decision so far:** The quote-source font has been simplified. Decide whether it needs a modest size increase after using the new treatment. Do not broadly enlarge all metadata without comparing the resulting hierarchy.

**Done when:** Metadata remains quiet but is comfortably legible and consistent across quote attribution and form studies.

## 5. Lesson progress indicator

**Status:** Deferred; do not implement now.

`LessonHeader` receives `total`, and `.lesson-progress`, `.progress-line`, and related CSS already exist, but the component does not render them. This can be revisited when navigation and multi-lesson behavior are in scope.
