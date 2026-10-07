/**
 * Reads a dictionary page at compile time. A page in content/dictionary/ is
 * named by its headword (血.mdx) and writes each entry as an `<Entry>` holding
 * `<Reading pinyin="…" />`s and `<Sense gloss="…">`s, with the sense's example
 * quotations as `<Quote id="…" />` inside it. This plugin exports what it read
 * as `dictionaryPage`, which the dictionary's index, search and flashcards are
 * built from, and fails the build, naming the file, for a page that breaks
 * docs/dictionary-authoring.md. Other MDX is left alone.
 */

import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { quoteIdFromAssetName } from "../quotation-file.ts";
import { attributeValue, exportConst, findComponents, type MdastNode } from "./mdx-tree.ts";

export type DictionaryPageData = {
  headword: string;
  entries: Array<{ readings: string[]; senses: Array<{ gloss: string; quoteIds: string[] }> }>;
};

const toneMarked = "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";
// ponytail: checks the letters and that a tone is marked, not each syllable;
// enough for one-character headwords, check syllables once longer ones arrive.
const tonedPinyin = new RegExp(`^[a-zü${toneMarked}]*[${toneMarked}][a-zü${toneMarked}]*$`, "u");

export default function remarkDictionaryPage() {
  return (tree: MdastNode, file: { path?: string }) => {
    const path = file.path ?? "";
    if (!/[\\/]content[\\/]dictionary[\\/][^\\/]+$/.test(path)) return;

    const fileName = path.split(/[\\/]/).at(-1) ?? "";
    const fail = (problem: string): never => {
      throw new Error(`${fileName}: ${problem}`);
    };

    const headword = fileName.replace(/\.mdx$/, "");
    if (!/^\p{Script=Han}+$/u.test(headword)) {
      fail("a dictionary page is named by its headword in Chinese characters, as in 血.mdx");
    }

    const entries = findComponents(tree, "Entry").map((entry) => ({
      readings: findComponents(entry, "Reading").map((reading) => readPinyin(reading, fail)),
      senses: findComponents(entry, "Sense").map((sense) => ({
        gloss: readGloss(sense, fail),
        quoteIds: findComponents(sense, "Quote").map((quote) => String(attributeValue(quote, "id"))),
      })),
    }));
    if (entries.length === 0) fail("a dictionary page has at least one <Entry>");
    for (const { readings, senses } of entries) {
      if (readings.length === 0) fail('every <Entry> has at least one <Reading pinyin="…" />');
      if (senses.length === 0) fail('every <Entry> has at least one <Sense gloss="…">');
    }

    const committed = new Set(
      readdirSync(join(dirname(path), "../quotes")).map((name) => quoteIdFromAssetName(name.replace(/\.json$/, ""))),
    );
    for (const quote of findComponents(tree, "Quote")) {
      const id = attributeValue(quote, "id");
      if (typeof id !== "string" || !committed.has(id)) fail(`<Quote id="${String(id)}"> has no quotation file`);
    }

    tree.children?.push(exportConst("dictionaryPage", { headword, entries } satisfies DictionaryPageData));
  };
}

function readPinyin(reading: MdastNode, fail: (problem: string) => never): string {
  const value = attributeValue(reading, "pinyin");
  const pinyin = typeof value === "string" ? value.normalize("NFC") : "";
  return tonedPinyin.test(pinyin)
    ? pinyin
    : fail(`a <Reading> writes its pinyin in quotes with the tone mark, as in pinyin="xuè"${typeof value === "string" ? `, not "${value}"` : ""}`);
}

function readGloss(sense: MdastNode, fail: (problem: string) => never): string {
  const value = attributeValue(sense, "gloss");
  return typeof value === "string" && value.trim() !== ""
    ? value
    : fail('a <Sense> needs a gloss written in quotes, as in gloss="blood"');
}
