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

import { toneMark, withoutTones } from "../lib/pinyin.ts";
import { quoteIdFromAssetName } from "../quotation-file.ts";
import { attributeValue, exportConst, type MdastNode } from "./mdx-tree.ts";

export type DictionaryPageData = { headword: string; entries: EntryData[] };
type EntryData = { readings: string[]; senses: SenseData[] };
type SenseData = { gloss: string; quoteIds: string[] };

type Fail = (problem: string) => never;

export default function remarkDictionaryPage() {
  return (tree: MdastNode, file: { path?: string }) => {
    const path = file.path ?? "";
    if (!/[\\/]content[\\/]dictionary[\\/][^\\/]+$/.test(path)) return;

    const fileName = path.split(/[\\/]/).at(-1) ?? "";
    const fail: Fail = (problem) => {
      throw new Error(`${fileName}: ${problem}`);
    };

    const headword = fileName.replace(/\.mdx$/, "");
    if (!/^\p{Script=Han}+$/u.test(headword)) {
      fail("a dictionary page is named by its headword in Chinese characters, as in 血.mdx");
    }
    // A radical or compatibility form, as PDFs give, looks like the character but is another one.
    const character = headword.normalize("NFKC");
    if (headword !== character) fail(`${headword} only looks like ${character}: name the page ${character}.mdx`);

    const committedQuoteIds = new Set(
      readdirSync(join(dirname(path), "../quotes")).map((name) => quoteIdFromAssetName(name.replace(/\.json$/, ""))),
    );
    const entries: EntryData[] = [];

    // Walks the page in document order, knowing the <Entry> and <Sense> each component is in.
    const read = (node: MdastNode, entry?: EntryData, sense?: SenseData): void => {
      for (const child of node.children ?? []) {
        const component = child.type.startsWith("mdxJsx") ? child.name : undefined;

        if (component === "Entry") {
          if (entry) return fail("an <Entry> cannot hold another <Entry>");
          const next: EntryData = { readings: [], senses: [] };
          entries.push(next);
          read(child, next);
        } else if (component === "Reading" || component === "Sense") {
          if (!entry || sense) return fail(`a <${component}> goes inside an <Entry> and outside any <Sense>`);
          if (component === "Reading") {
            entry.readings.push(readPinyin(child, fail));
          } else {
            const next: SenseData = { gloss: readGloss(child, fail), quoteIds: [] };
            entry.senses.push(next);
            read(child, entry, next);
          }
        } else {
          if (component === "Quote") sense?.quoteIds.push(readQuoteId(child, committedQuoteIds, fail));
          read(child, entry, sense);
        }
      }
    };
    read(tree);

    if (entries.length === 0) fail("a dictionary page has at least one <Entry>, and this one has none");
    entries.forEach(({ readings, senses }, index) => {
      if (readings.length === 0) fail(`every <Entry> has a <Reading pinyin="…" />, and entry ${index + 1} has none`);
      if (senses.length === 0) fail(`every <Entry> has a <Sense gloss="…">, and entry ${index + 1} has none`);
    });

    tree.children?.push(exportConst("dictionaryPage", { headword, entries } satisfies DictionaryPageData));
  };
}

// ponytail: one syllable with a tone mark; a neutral-tone reading (了 le) or the
// several syllables of a multi-character headword fail. Allow them when a page needs one.
const syllable =
  /^(?:[bpmfdtnlgkhjqxrzcsyw]|[zcs]h)?(?:a(?:i|o|ng?)?|o(?:u|ng)?|e(?:i|r|ng?)?|i(?:a(?:o|ng?)?|e|u|ng?|ong)?|u(?:a(?:i|ng?)?|o|i|n|e)?|ü(?:e|an|n)?)$/;

function readPinyin(reading: MdastNode, fail: Fail): string {
  const value = attributeValue(reading, "pinyin");
  const pinyin = typeof value === "string" ? value.normalize("NFC") : "";
  return isTonedSyllable(pinyin)
    ? pinyin
    : fail(`a <Reading> writes its pinyin in quotes with the tone mark, as in pinyin="xuè"${typeof value === "string" ? `, not "${value}"` : ""}`);
}

/** One pinyin syllable with one tone mark where pinyin puts it: on a or e, on the o of ou, or else on the last vowel. */
function isTonedSyllable(pinyin: string): boolean {
  const [mark, ...more] = pinyin.normalize("NFD").match(toneMark) ?? [];
  const toneless = withoutTones(pinyin);
  const vowel = /[ae]/.exec(toneless) ?? /o(?=u)/.exec(toneless) ?? /[iouü](?!.*[iouü])/.exec(toneless);

  return (
    mark !== undefined &&
    more.length === 0 &&
    syllable.test(toneless) &&
    vowel !== null &&
    `${toneless.slice(0, vowel.index + 1)}${mark}${toneless.slice(vowel.index + 1)}`.normalize("NFC") === pinyin
  );
}

function readGloss(sense: MdastNode, fail: Fail): string {
  const value = attributeValue(sense, "gloss");
  return typeof value === "string" && value.trim() !== ""
    ? value
    : fail('a <Sense> needs a gloss written in quotes, as in gloss="blood"');
}

function readQuoteId(quote: MdastNode, committedQuoteIds: Set<string | null>, fail: Fail): string {
  const id = attributeValue(quote, "id");
  if (typeof id !== "string") return fail('a <Quote> writes its Quote ID in quotes, as in id="L001J-Q01"');
  return committedQuoteIds.has(id) ? id : fail(`<Quote id="${id}"> has no quotation file`);
}
