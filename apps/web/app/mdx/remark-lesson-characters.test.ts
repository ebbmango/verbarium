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
    expect(await displayed(`<CharacterFocus size="small">
  <FocusItem name="2011F.svg" character="𠄟" description="Two strokes" />
  <FocusItem name="example" character="二" headword="下" description="Variant" />
  <FocusItem name="other" description="Unencoded" />
  <FocusItem name="another" headword="⾎" description="Unencoded variant" />
  <FocusItem character="血" caption="blood" subcaption="semantic" spine nudge="-0.03" />
  <FocusItem character="二">
    <Caption>*two*</Caption>
    <Subcaption>Semantic</Subcaption>
  </FocusItem>
</CharacterFocus>`)).toEqual(["𠄟", "下", "血", "二"]);
  });

  it("rejects invalid focus items at compile time", async () => {
    for (const props of ['name="example"', 'name="../example" description="Example"', 'character={"二"}', 'character="二上"', 'character="二" caption=""', 'character="二" spine="yes"', 'name="example" description="Example" spine', 'character="二" nudge="right"', 'character="二" nudge="0.6"', 'name="example" description="Example" nudge="0.03"']) {
      await expect(displayed(`<CharacterFocus>
  <FocusItem ${props} />
</CharacterFocus>`)).rejects.toThrow("002.mdx: <FocusItem>");
    }
    await expect(displayed(`<CharacterFocus>
  <FocusItem character="二" caption="Two">
    <Subcaption>Semantic</Subcaption>
  </FocusItem>
</CharacterFocus>`)).rejects.toThrow("not both");
    await expect(displayed(`<CharacterFocus>
  <FocusItem character="二">
    <Subcaption>Semantic</Subcaption>
    <Caption>Two</Caption>
  </FocusItem>
</CharacterFocus>`)).rejects.toThrow("only <Caption> then <Subcaption>");
    await expect(displayed('<FocusItem character="二" />')).rejects.toThrow("directly inside");
    await expect(displayed('<CharacterFocus character="二">text</CharacterFocus>')).rejects.toThrow("takes no props");
    await expect(displayed('<CharacterFocus character="二" size="large" />')).rejects.toThrow('takes size="small" or no size');
    await expect(displayed('<CharacterFocus character="二" label="A" />')).rejects.toThrow("has no prop label");
    expect(await displayed('<CharacterFocus character="蒜" caption="Garlic" nudge=".02" />')).toEqual(["蒜"]);
    await expect(displayed('<CharacterFocus character="二" nudge="-1" />')).rejects.toThrow("between -0.5 and 0.5");
    expect(await displayed('<CharacterFocus character="蒜" caption="Garlic" parts />')).toEqual(["蒜"]);
    await expect(displayed('<CharacterFocus character="蒜" parts="yes" />')).rejects.toThrow("writes parts bare");
    await expect(displayed('<CharacterFocus character="示" parts highlight="1" />')).rejects.toThrow("either parts or highlight");
    await expect(displayed('<CharacterFocus characters="蒜 二" parts />')).rejects.toThrow("takes no captions");
    expect(await displayed('<CharacterFocus character="蒜" parts />\n\nThe <PartWords part="艸">*vegetable*</PartWords> called <PartWords part="祘">*suàn*</PartWords>.')).toEqual(["蒜"]);
    await expect(displayed('<CharacterFocus character="蒜" parts />\n\nThe <PartWords part="木">tree</PartWords>.')).rejects.toThrow("<PartWords> names 木; it must name one of 艸 祘");
    await expect(displayed('The <PartWords part="艸">vegetable</PartWords>.')).rejects.toThrow("in this lesson");
    await expect(displayed('<CharacterFocus size="small">\n  <FocusItem character="蒜" size="large" />\n</CharacterFocus>')).rejects.toThrow("unexpected or repeated attribute size");
  });

  it("leaves MDX outside the lessons alone", async () => {
    const page = await compileDictionaryPage(
      '<CharDisplay character="雨" label="B" />\n\n<Entry>\n  <Reading pinyin="yǔ" />\n\n  <Sense gloss="rain" />\n</Entry>\n',
      join(dictionaryDirectory, "雨.mdx"),
    );
    expect((page as Record<string, unknown>).displayedCharacters).toBeUndefined();
  });
});
