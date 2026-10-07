/**
 * How dictionary pages are named: `血.mdx` is the page for 血, at
 * `/dictionary/血`. Shared by the build's pre-render list and the scripts, so
 * they can never disagree; only erasable TypeScript, since the build config
 * imports it directly.
 */

/** The headword a page's file is named by, or null for any other file. Dotfiles are skipped, as the registry's glob skips them. */
export function headwordFromFileName(fileName: string): string | null {
  return fileName.endsWith(".mdx") && !fileName.startsWith(".") ? fileName.slice(0, -".mdx".length) : null;
}

/** The address of the dictionary index. */
export const dictionaryIndexPath = "/dictionary";

/** The address of a dictionary page: `/dictionary/血`. */
export function dictionaryPath(headword: string): string {
  return `${dictionaryIndexPath}/${headword}`;
}

/** Whether an address is the dictionary index or a dictionary page. */
export function isDictionaryPath(pathname: string): boolean {
  return pathname === dictionaryIndexPath || pathname.startsWith(`${dictionaryIndexPath}/`);
}
