/**
 * Exports the characters a lesson displays, from its `<CharDisplay>` and
 * `<CharacterFocus>`, as `displayedCharacters`, so a dictionary page can name
 * the lessons that display its headword. A radical or compatibility form is
 * read as the character it looks like, as the dictionary reads it. A display
 * without its character in quotes fails the build, naming the file. Other MDX
 * is left alone.
 */

import { lessonNumberFromPath } from "../content/lessons/lesson-files.ts";
import { attributeValue, exportConst, findComponents, type MdastNode } from "./mdx-tree.ts";

export default function remarkLessonCharacters() {
  return (tree: MdastNode, file: { path?: string }) => {
    const path = file.path ?? "";
    if (lessonNumberFromPath(path) === null) return;

    const displays = [...findComponents(tree, "CharDisplay"), ...findComponents(tree, "CharacterFocus")];
    const characters = displays.map((display) => {
      const character = attributeValue(display, "character");
      if (typeof character === "string") return character.normalize("NFKC");
      throw new Error(`${path.split(/[\\/]/).at(-1)}: <${display.name}> writes its character in quotes, as in character="雨"`);
    });
    tree.children?.push(exportConst("displayedCharacters", [...new Set(characters)]));
  };
}
