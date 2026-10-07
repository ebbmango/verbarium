/**
 * Exports the characters a lesson displays, from its `<CharDisplay>` and
 * `<CharacterFocus>`, as `displayedCharacters`, so a dictionary page can name
 * the lessons that display its headword. Other MDX is left alone.
 */

import { attributeValue, exportConst, findComponents, type MdastNode } from "./mdx-tree.ts";

export default function remarkLessonCharacters() {
  return (tree: MdastNode, file: { path?: string }) => {
    if (!/[\\/]content[\\/]lessons[\\/][^\\/]+$/.test(file.path ?? "")) return;

    const displays = [...findComponents(tree, "CharDisplay"), ...findComponents(tree, "CharacterFocus")];
    const characters = displays.map((display) => attributeValue(display, "character"));
    tree.children?.push(
      exportConst("displayedCharacters", [...new Set(characters)].filter((character) => typeof character === "string")),
    );
  };
}
