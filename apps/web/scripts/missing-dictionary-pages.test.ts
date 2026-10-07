import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const script = join(import.meta.dirname, "missing-dictionary-pages.ts");

/** Runs the script on these lessons and dictionary pages, by file name. */
function run(lessons: Record<string, string>, pages: string[]): string {
  const root = mkdtempSync(join(tmpdir(), "dictionary-"));
  mkdirSync(join(root, "lessons"));
  mkdirSync(join(root, "dictionary"));
  for (const [name, source] of Object.entries(lessons)) writeFileSync(join(root, "lessons", name), source);
  for (const page of pages) writeFileSync(join(root, "dictionary", page), "");
  return execFileSync("node", [script, join(root, "lessons"), join(root, "dictionary")], { encoding: "utf8" });
}

describe("missing-dictionary-pages script", () => {
  it("lists each character a lesson writes outside its quotations, once, under the first lesson without a page for it", () => {
    const output = run(
      {
        "001.mdx": `<LessonHeader number={1} subtitle="About 一." />

<CharDisplay character="雨" label="B" forms={/* two */ 2} />

The rain falls from a 冂 cloud {/* 水从雲下也。 */ } onto ⾎, {
  // 千里之行
} and on.

<Quote id="L001B-Q01" />

<LegacyQuote source="說文解字">地之數也。</LegacyQuote>

<ClosingLine lang="zh-Hant">盡 人 事</ClosingLine>`,
        "002.mdx": "Two strokes: 二, under 一 and 雨.",
        "notes.mdx": "Not a lesson: 水.",
      },
      ["雨.mdx", "血.mdx", "二", ".一.mdx"],
    );

    // ⾎ is the radical form of 血, which has a page; a file 二 without .mdx, or a dotfile, is no page.
    expect(output).toBe("Lesson 1: 一 冂\nLesson 2: 二\n3 character(s) without a page\n");
  });

  it("says when every character has a page", () => {
    expect(run({ "001.mdx": "一" }, ["一.mdx"])).toBe("Every character the lessons write has a dictionary page.\n");
  });
});
