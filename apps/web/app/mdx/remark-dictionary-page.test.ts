import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { compileDictionaryPage, dictionaryDirectory as dictionary } from "../test/compile-dictionary-page";

async function compile(source: string, path = join(dictionary, "血.mdx")) {
  return (await compileDictionaryPage(source, path)).dictionaryPage;
}

const page = `Prose may come before, between and after the entries.

<Quote id="L001A-Q01" />

<Entry>
  <Reading pinyin="xuè" />
  <Reading pinyin="xiě" />

  <Sense gloss="blood">
    The blood of people and animals.

    <Quote id="L001J-Q01" />
  </Sense>

  <Sense gloss="related by birth" />
</Entry>
`;

describe("remarkDictionaryPage", () => {
  it("exports the page's headword, readings, glosses and each sense's example Quote IDs", async () => {
    expect(await compile(page)).toEqual({
      headword: "血",
      entries: [
        {
          readings: ["xuè", "xiě"],
          senses: [
            { gloss: "blood", quoteIds: ["L001J-Q01"] },
            { gloss: "related by birth", quoteIds: [] },
          ],
        },
      ],
    });
  });

  it("reads readings written on one line, and accepts the tone mark wherever pinyin puts it", async () => {
    const oneLine = '<Entry>\n  <Reading pinyin="xuè" /> or <Reading pinyin="xiě" />\n  <Sense gloss="blood" />\n</Entry>';
    expect((await compile(oneLine))?.entries[0].readings).toEqual(["xuè", "xiě"]);

    for (const pinyin of ["jiǒng", "zhōu", "guī", "huò", "nǚ", "lüè", "ér", "shuāng"]) {
      expect((await compile(page.replace("xuè", pinyin)))?.entries[0].readings[0]).toBe(pinyin);
    }
    // A tone mark typed as a separate combining character is read as the one character.
    expect((await compile(page.replace("xuè", "xue\u0300")))?.entries[0].readings[0]).toBe("xuè");
  });

  it("leaves MDX outside the dictionary alone", async () => {
    expect(await compile("Only prose.", "/repo/apps/web/app/content/notes/血.mdx")).toBeUndefined();
  });

  it("names the page and the problem", async () => {
    await expect(compile(page, join(dictionary, "blood.mdx"))).rejects.toThrow(
      "blood.mdx: a dictionary page is named by its headword in Chinese characters, as in 血.mdx",
    );
    await expect(compile(page, join(dictionary, "⾎.mdx"))).rejects.toThrow(
      "⾎.mdx: ⾎ only looks like 血: name the page 血.mdx",
    );
    await expect(compile("Only prose.")).rejects.toThrow(
      "血.mdx: a dictionary page has at least one <Entry>, and this one has none",
    );
    await expect(compile(`${page}\n<Entry>\n  <Sense gloss="kin" />\n</Entry>`)).rejects.toThrow(
      '血.mdx: every <Entry> has a <Reading pinyin="…" />, and entry 2 has none',
    );
    await expect(compile('<Entry>\n  <Reading pinyin="xuè" />\n</Entry>')).rejects.toThrow(
      '血.mdx: every <Entry> has a <Sense gloss="…">, and entry 1 has none',
    );
    for (const pinyin of ["xue4", "xue", "Xuè", "xùe", "xuèxiě", "blòod"]) {
      await expect(compile(page.replace("xuè", pinyin))).rejects.toThrow(
        `血.mdx: a <Reading> writes its pinyin in quotes with the tone mark, as in pinyin="xuè", not "${pinyin}"`,
      );
    }
    await expect(compile(page.replace(' gloss="blood"', ""))).rejects.toThrow(
      '血.mdx: a <Sense> needs a gloss written in quotes, as in gloss="blood"',
    );
    await expect(compile(page.replace("L001J-Q01", "L001J-Q09"))).rejects.toThrow(
      '血.mdx: <Quote id="L001J-Q09"> has no quotation file',
    );
    await expect(compile(page.replace('id="L001J-Q01"', 'id={"L001J-Q01"}'))).rejects.toThrow(
      '血.mdx: a <Quote> writes its Quote ID in quotes, as in id="L001J-Q01"',
    );
  });

  it("refuses readings and senses outside an entry, and components nested where they would blur its data", async () => {
    const outside = "血.mdx: a <Reading> goes inside an <Entry> and outside any <Sense>";
    await expect(compile(`${page}\n<Reading pinyin="xuè" />`)).rejects.toThrow(outside);
    await expect(compile(page.replace("The blood", '<Reading pinyin="xuè" />\n\n    The blood'))).rejects.toThrow(outside);
    await expect(compile(page.replace("The blood", '<Sense gloss="kin" />\n\n    The blood'))).rejects.toThrow(
      "血.mdx: a <Sense> goes inside an <Entry> and outside any <Sense>",
    );
    await expect(compile(page.replace("</Entry>", "  <Entry />\n</Entry>"))).rejects.toThrow(
      "血.mdx: an <Entry> cannot hold another <Entry>",
    );
  });
});
