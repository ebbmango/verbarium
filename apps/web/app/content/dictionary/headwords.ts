import { headwordFromFileName } from "./dictionary-files";

// Which headwords have a page, from the file names alone: the build keeps only
// the keys of this glob, so lessons can link to pages without loading them.
const headwords = new Set(Object.keys(import.meta.glob("./*.mdx")).map((path) => headwordFromFileName(path.slice(2))));

/** Whether a headword has a committed dictionary page. */
export function hasDictionaryPage(headword: string): boolean {
  return headwords.has(headword);
}
