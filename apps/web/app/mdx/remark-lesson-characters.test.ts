import { join } from "node:path";
import { describe, expect, it } from "vitest";

import * as lessonOne from "../content/lessons/001.mdx";
import { compileDictionaryPage, dictionaryDirectory } from "../test/compile-dictionary-page";

describe("remarkLessonCharacters", () => {
  it("exports each character a lesson displays once, from CharDisplay then CharacterFocus", () => {
    expect(lessonOne.displayedCharacters).toEqual(["一", "雨", "天", "末", "旦", "立", "本", "閂", "丂", "血"]);
  });

  it("leaves MDX outside the lessons alone", async () => {
    const page = await compileDictionaryPage(
      '<CharDisplay character="雨" label="B" />\n\n<Entry>\n  <Reading pinyin="yǔ" />\n\n  <Sense gloss="rain" />\n</Entry>\n',
      join(dictionaryDirectory, "雨.mdx"),
    );
    expect((page as Record<string, unknown>).displayedCharacters).toBeUndefined();
  });
});
