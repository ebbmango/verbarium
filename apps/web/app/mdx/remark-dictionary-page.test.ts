import mdx from "@mdx-js/rollup";
import { join } from "node:path";
import * as runtime from "react/jsx-runtime";
import { describe, expect, it } from "vitest";

import { mdxOptions } from "./options";

// Compiles a page as the build does, then runs it to read what it exports.
const transform = mdx({ ...mdxOptions, outputFormat: "function-body" }).transform as (
  source: string,
  path: string,
) => Promise<{ code: string }>;
const dictionary = join(import.meta.dirname, "../content/dictionary");

async function compile(source: string, path = join(dictionary, "血.mdx")) {
  const { code } = await transform(source, path);
  return new Function(code)(runtime).dictionaryPage;
}

const page = `Prose may come before, between and after the entries.

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
  it("exports the page's headword, readings, glosses and example Quote IDs", async () => {
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

  it("leaves MDX outside the dictionary alone", async () => {
    expect(await compile("Only prose.", "/repo/apps/web/app/content/notes/血.mdx")).toBeUndefined();
  });

  it("names the page and the problem", async () => {
    await expect(compile(page, join(dictionary, "blood.mdx"))).rejects.toThrow(
      "blood.mdx: a dictionary page is named by its headword in Chinese characters, as in 血.mdx",
    );
    await expect(compile("Only prose.")).rejects.toThrow("血.mdx: a dictionary page has at least one <Entry>");
    await expect(compile('<Entry>\n  <Sense gloss="blood" />\n</Entry>')).rejects.toThrow(
      '血.mdx: every <Entry> has at least one <Reading pinyin="…" />',
    );
    await expect(compile('<Entry>\n  <Reading pinyin="xuè" />\n</Entry>')).rejects.toThrow(
      '血.mdx: every <Entry> has at least one <Sense gloss="…">',
    );
    for (const pinyin of ["xue4", "xue", "Xuè"]) {
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
  });
});
