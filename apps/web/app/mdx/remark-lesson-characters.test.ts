import { join } from "node:path";
import { describe, expect, it } from "vitest";

import * as lessonOne from "../content/lessons/001.mdx";
import { compileDictionaryPage, dictionaryDirectory } from "../test/compile-dictionary-page";

const lessonTwo = join(dictionaryDirectory, "../lessons/002.mdx");
const header = '<LessonHeader number={2} subtitle="About 二." />\n\n';
const displayed = async (source: string) =>
  ((await compileDictionaryPage(header + source, lessonTwo)) as Record<string, unknown>).displayedCharacters;

describe("remarkLessonCharacters", () => {
  it("exports each character a lesson displays once, from CharDisplay then CharacterFocus", () => {
    expect(lessonOne.displayedCharacters).toEqual(["一", "雨", "天", "末", "旦", "立", "本", "閂", "丂", "血"]);
  });

  it("reads a radical or compatibility form as the character it looks like", async () => {
    expect(await displayed('<CharDisplay character="⾎" label="A" />\n\n<CharacterFocus character="血" />')).toEqual(["血"]);
  });

  it("fails the build, naming the lesson, for a display without its character in quotes", async () => {
    await expect(displayed('<CharDisplay character={"雨"} label="B" />')).rejects.toThrow(
      '002.mdx: <CharDisplay> writes its character in quotes, as in character="雨"',
    );
    await expect(displayed("<CharacterFocus />")).rejects.toThrow(
      '002.mdx: <CharacterFocus> writes its character in quotes, as in character="雨"',
    );
  });

  it("leaves MDX outside the lessons alone", async () => {
    const page = await compileDictionaryPage(
      '<CharDisplay character="雨" label="B" />\n\n<Entry>\n  <Reading pinyin="yǔ" />\n\n  <Sense gloss="rain" />\n</Entry>\n',
      join(dictionaryDirectory, "雨.mdx"),
    );
    expect((page as Record<string, unknown>).displayedCharacters).toBeUndefined();
  });
});
