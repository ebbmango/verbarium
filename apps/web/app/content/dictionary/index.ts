import type { ComponentType, ElementType } from "react";

import { toneOf, withoutTones } from "../../lib/pinyin";
import type { DictionaryPageData } from "../../mdx/remark-dictionary-page";

export { dictionaryPath } from "./dictionary-files";

export type DictionaryPage = DictionaryPageData & {
  Content: ComponentType<{ components?: Record<string, ElementType> }>;
};

// Every committed dictionary page, compiled and checked by app/mdx/remark-dictionary-page.ts as it loads.
const modules = import.meta.glob<{ default: DictionaryPage["Content"]; dictionaryPage: DictionaryPageData }>(
  "./*.mdx",
  { eager: true },
);

/** The committed dictionary pages, with what their entries say. */
export const dictionaryPages: DictionaryPage[] = Object.values(modules).map((module) => ({
  ...module.dictionaryPage,
  Content: module.default,
}));

/** A page's glosses in order, as one line: its description, and its line in the dictionary index. */
export function glossesOf(page: DictionaryPageData): string {
  return page.entries.flatMap((entry) => entry.senses.map((sense) => sense.gloss)).join("; ");
}

/** Dictionary order: by the first reading's syllable, then its tone, then the headword, the same in every browser. */
export function byReading(left: DictionaryPageData, right: DictionaryPageData): number {
  const key = (page: DictionaryPageData) => {
    const reading = page.entries[0].readings[0];
    return `${withoutTones(reading)} ${toneOf(reading)} ${page.headword}`;
  };
  const [a, b] = [key(left), key(right)];
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Whether a page answers a search. Every word of it must match: the headword,
 * the start of a reading, tones ignored (`xue`, `xuè` and `xue4` all find
 * `xuè`, and `lv` finds `lǜ`), or the start of a word in a gloss. A radical or
 * full-width form is read as the character it looks like. An empty search finds
 * every page.
 */
export function matchesSearch(page: DictionaryPageData, search: string): boolean {
  const words = search.normalize("NFKC").toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((word) => {
    const syllable = withoutTones(word.replace(/[1-5]$/, "").replace(/v|u:/g, "ü"));
    return (
      page.headword.includes(word) ||
      page.entries.some(
        (entry) =>
          entry.readings.some((reading) => withoutTones(reading).startsWith(syllable)) ||
          entry.senses.some((sense) => sense.gloss.toLowerCase().split(/[^\p{L}\p{N}]+/u).some((part) => part.startsWith(word))),
      )
    );
  });
}
