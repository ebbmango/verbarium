import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { lessonComponents } from "../../components/lesson";
import { dictionaryPages } from "../dictionary";
import { resetFakeSupabase } from "../../test/fake-supabase";
import { lessonSources } from "../../test/lesson-sources";
import { renderWithSession } from "../../test/render-with-session";
import LessonOne from "./001.mdx";

vi.mock("../../lib/supabase", () => import("../../test/fake-supabase"));

const source = lessonSources().get("001.mdx") ?? "";
const han = /\p{Script=Han}/u;

beforeEach(resetFakeSupabase);

function renderLesson(): HTMLElement {
  renderWithSession(
    <article className="lesson lesson-manuscript">
      <LessonOne components={lessonComponents} />
    </article>,
  );
  return screen.getByRole("article");
}

describe("Lesson 1", () => {
  it("follows the authoring rules: no raw tags, no className or style, no imports", () => {
    expect(source).not.toMatch(/<[a-z]|className=|style=|^import /m);
  });

  it("keeps its structure: 17 quotations, four divisions under solid rules, five dashed dividers", () => {
    const article = renderLesson();
    expect(article.querySelectorAll("blockquote.lesson-quote")).toHaveLength(17);
    expect(article.querySelectorAll("hr.lesson-divider-dashed")).toHaveLength(5);

    const solidRules = Array.from(article.querySelectorAll("hr.lesson-divider-solid"));
    expect(solidRules).toHaveLength(4);
    for (const rule of solidRules) {
      expect(rule.nextElementSibling).toHaveClass("category-break");
    }
  });

  it("writes its commentaries as paragraphs with bold runs", () => {
    const article = renderLesson();
    const commentaries = Array.from(article.querySelectorAll("aside.lesson-note"));

    expect(commentaries).toHaveLength(2);
    for (const commentary of commentaries) {
      const children = Array.from(commentary.children).map((child) => child.tagName);
      expect(children[0]).toBe("SPAN");
      expect(children.slice(1).every((tag) => tag === "P" || tag === "FIGURE")).toBe(true);
    }
    expect(commentaries[1].querySelectorAll("p")).toHaveLength(9);
    expect(commentaries[1].querySelectorAll("strong")).toHaveLength(5);
    expect(commentaries[1].querySelector("figure.character-forms")).not.toBeNull();
  });

  it("keeps the authored line breaks in its prose and the closing line", () => {
    const article = renderLesson();
    const blood = Array.from(article.querySelectorAll(":scope > p")).find((p) => p.textContent?.startsWith("Blood."));

    expect(blood?.querySelector("br")).not.toBeNull();
    expect(blood?.textContent?.replace(/\s+/g, " ")).toBe("Blood. A 皿 (vase) containing 一 (something).");

    const tree = Array.from(article.querySelectorAll(":scope > p")).find((p) => p.textContent?.startsWith("A horizontal stroke cuts through the top"));
    expect(tree?.querySelector("br")).not.toBeNull();

    const closing = article.querySelector("blockquote.lesson-closing-quote");
    expect(closing).toHaveAttribute("lang", "zh-Hant");
    expect(closing?.textContent).toBe("千里之行　始於足下");
    expect(closing?.querySelector("p")).toBeNull();
  });

  it("reads each displayed character, in every lesson, as one of the readings on its dictionary page", () => {
    const displays = Array.from(lessonSources().values()).flatMap((mdx) =>
      Array.from(mdx.matchAll(/<CharDisplay character="([^"]+)" label="[^"]+" reading="([^"]+)" \/>/g)),
    );

    expect(displays.length).toBeGreaterThanOrEqual(10);
    for (const [, character, reading] of displays) {
      const page = dictionaryPages.find((candidate) => candidate.headword === character.normalize("NFKC"));
      if (!page) continue;
      expect(page.entries.flatMap((entry) => entry.readings), `${character} ${reading}`).toContain(reading);
    }
  });

  it("marks every run of Chinese in its prose with lang zh-Hant", () => {
    const article = renderLesson();
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
    const unmarked: string[] = [];
    let marked = 0;

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      // Quotations mark their own text; their translations are QuoteView's business.
      if (!han.test(node.textContent ?? "") || node.parentElement?.closest("blockquote.lesson-quote")) continue;
      if (node.parentElement?.closest('[lang="zh-Hant"]')) marked += 1;
      else unmarked.push(node.textContent ?? "");
    }

    expect(unmarked).toEqual([]);
    expect(article.querySelectorAll('p > span[lang="zh-Hant"]').length).toBeGreaterThan(20);
    expect(marked).toBeGreaterThan(20);
  });
});
