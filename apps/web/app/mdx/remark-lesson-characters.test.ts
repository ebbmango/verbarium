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
    expect(await displayed('<CharDisplay character="⾎" label="A" reading="xuè" />\n\n<CharacterFocus character="血" />')).toEqual(["血"]);
  });

  it("records each grouped focus character, normalizing and deduplicating across displays", async () => {
    expect(await displayed('<CharDisplay character="血" reading="xuè" />\n\n<CharacterFocus characters=" 二  ⾎ 𠄞 二 " />\n\n<CharacterFocus character="上" />'))
      .toEqual(["血", "二", "𠄞", "上"]);
  });

  it("keeps the same lesson references when separate focuses become a group", async () => {
    expect(await displayed('<CharacterFocus characters="二 上" />')).toEqual(
      await displayed('<CharacterFocus character="二" />\n\n<CharacterFocus character="上" />'),
    );
  });

  it("rejects ambiguous, empty or expression-based focus groups", async () => {
    await expect(displayed('<CharacterFocus character="二" characters="二 上" />')).rejects.toThrow("uses either character or characters, not both");
    for (const prop of ['characters=" "', 'characters={"二 上"}']) {
      await expect(displayed(`<CharacterFocus ${prop} />`)).rejects.toThrow('writes space-separated characters in quotes, as in characters="二 上"');
    }
  });

  it("fails the build, naming the lesson, for a display without its character in quotes", async () => {
    await expect(displayed('<CharDisplay character={"雨"} label="B" reading="yǔ" />')).rejects.toThrow(
      '002.mdx: <CharDisplay> writes its character in quotes, as in character="雨"',
    );
    await expect(displayed("<CharacterFocus />")).rejects.toThrow(
      '002.mdx: <CharacterFocus> writes its character in quotes, as in character="雨"',
    );
  });

  it("fails the build, naming the lesson, for a CharDisplay without the reading it teaches", async () => {
    await expect(displayed('<CharDisplay character="雨" label="B" />')).rejects.toThrow(
      '002.mdx: <CharDisplay> names the reading it teaches, as in reading="yǔ"',
    );
  });

  it("indexes illustrated items by declared headword or actual character", async () => {
    expect(await displayed(`<CharacterFocus>
  <FocusItem name="2011F.svg" character="𠄟" description="Two strokes" />
  <FocusItem name="example" character="二" headword="下" description="Variant" />
  <FocusItem name="other" description="Unencoded" />
  <FocusItem name="another" headword="⾎" description="Unencoded variant" />
  <FocusItem character="血" />
</CharacterFocus>`)).toEqual(["𠄟", "下", "血"]);
  });

  it("rejects invalid focus items at compile time", async () => {
    for (const props of ['name="example"', 'name="../example" description="Example"', 'character={"二"}', 'character="二上"']) {
      await expect(displayed(`<CharacterFocus>
  <FocusItem ${props} />
</CharacterFocus>`)).rejects.toThrow("002.mdx: <FocusItem>");
    }
    await expect(displayed('<FocusItem character="二" />')).rejects.toThrow("directly inside");
    await expect(displayed('<CharacterFocus character="二">text</CharacterFocus>')).rejects.toThrow("takes no props");
  });

  it("leaves MDX outside the lessons alone", async () => {
    const page = await compileDictionaryPage(
      '<CharDisplay character="雨" label="B" />\n\n<Entry>\n  <Reading pinyin="yǔ" />\n\n  <Sense gloss="rain" />\n</Entry>\n',
      join(dictionaryDirectory, "雨.mdx"),
    );
    expect((page as Record<string, unknown>).displayedCharacters).toBeUndefined();
  });
});
