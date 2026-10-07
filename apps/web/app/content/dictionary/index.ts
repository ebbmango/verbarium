import type { ComponentType, ElementType } from "react";

import type { DictionaryPageData } from "../../mdx/remark-dictionary-page";

export { dictionaryIndexPath, dictionaryPath, isDictionaryPath } from "./dictionary-files";

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

/** A page's glosses in order, as one line: the line under its headword and its description. */
export function glossesOf(page: DictionaryPageData): string {
  return page.entries.flatMap((entry) => entry.senses.map((sense) => sense.gloss)).join("; ");
}

/** Text without its marks, tone marks included, so `xue` finds `xuè`. */
const unmarked = (text: string) => text.normalize("NFD").replace(/\p{Mark}/gu, "");

/**
 * Whether a page answers a search: by its headword, by the start of a reading
 * with or without tone marks, or by words in its glosses. An empty search
 * finds every page.
 */
export function matchesSearch(page: DictionaryPageData, search: string): boolean {
  const query = search.trim().toLowerCase();
  return (
    page.headword.includes(query) ||
    page.entries.some((entry) => entry.readings.some((reading) => unmarked(reading).startsWith(unmarked(query)))) ||
    glossesOf(page).toLowerCase().includes(query)
  );
}
