import type { ComponentType, ElementType } from "react";

import type { DictionaryPageData } from "../../mdx/remark-dictionary-page";

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
