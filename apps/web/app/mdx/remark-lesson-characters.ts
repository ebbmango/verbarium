/**
 * Exports the characters a lesson displays, from its `<CharDisplay>` and
 * `<CharacterFocus>`, as `displayedCharacters`, so a dictionary page can name
 * the lessons that display its headword. A radical or compatibility form is
 * read as the character it looks like, as the dictionary reads it. A display
 * without its character in quotes, or a <CharDisplay> without the reading it
 * teaches, fails the build, naming the file. Other MDX is left alone.
 */

import { lessonNumberFromPath } from "../content/lessons/lesson-files.ts";
import { attributeValue, exportConst, findComponents, type MdastNode } from "./mdx-tree.ts";

function content(node: MdastNode) {
  return (node.children ?? []).filter(child => !(child.type === "text" && !String(child.value).trim()));
}

function focusItemReference(item: MdastNode, file: string): string[] {
  const fail = (message: string): never => { throw new Error(`${file}: <FocusItem> ${message}`); };
  const props = new Map<string, string>();
  for (const attr of item.attributes ?? []) {
    const key = attr.name ?? "";
    if (!["character", "headword", "name", "description"].includes(key) || props.has(key)) {
      fail(`unexpected or repeated attribute ${key}`);
    }
    if (typeof attr.value !== "string" || !attr.value.trim()) return fail(`requires quoted, nonempty ${key}`);
    props.set(key, attr.value);
  }
  if (content(item).length) fail("cannot contain children");
  for (const key of ["character", "headword"]) {
    const value = props.get(key);
    if (value && !/^\p{Script_Extensions=Han}\p{Variation_Selector}?$/u.test(value)) fail(`${key} must be one Han character`);
  }
  const name = props.get("name");
  if (name) {
    if (!/^[\p{L}\p{N}_-]+(?:\.[\p{L}\p{N}_-]+)*$/u.test(name)) fail("name must be a local asset filename");
    if (!props.has("description")) fail("requires a description for artwork");
  } else if (!props.has("character") || props.has("description")) {
    fail("requires character for text, or name and description for artwork");
  }
  const reference = props.get("headword") ?? props.get("character");
  return reference ? [reference.normalize("NFKC")] : [];
}

export default function remarkLessonCharacters() {
  return (tree: MdastNode, file: { path?: string }) => {
    const path = file.path ?? "";
    if (lessonNumberFromPath(path) === null) return;

    const fileName = path.split(/[\\/]/).at(-1);
    for (const display of findComponents(tree, "CharDisplay")) {
      if (typeof attributeValue(display, "reading") !== "string") {
        throw new Error(`${fileName}: <CharDisplay> names the reading it teaches, as in reading="yǔ"`);
      }
    }

    const displays = [...findComponents(tree, "CharDisplay"), ...findComponents(tree, "CharacterFocus")];
    const items = new Set(findComponents(tree, "FocusItem"));
    const characters = displays.flatMap((display) => {
      const group = attributeValue(display, "characters");
      const character = attributeValue(display, "character");
      if (display.name === "CharacterFocus" && content(display).length) {
        if (display.attributes?.length) throw new Error(`${fileName}: <CharacterFocus> with children takes no props`);
        return content(display).flatMap(item => {
          if (!items.delete(item)) throw new Error(`${fileName}: <CharacterFocus> expects direct <FocusItem> children`);
          return focusItemReference(item, fileName ?? path);
        });
      }
      if (display.name === "CharacterFocus" && group !== undefined) {
        if (character !== undefined) {
          throw new Error(`${fileName}: <CharacterFocus> uses either character or characters, not both`);
        }
        if (typeof group !== "string" || !group.trim()) {
          throw new Error(`${fileName}: <CharacterFocus> writes space-separated characters in quotes, as in characters="二 上"`);
        }
        return group.split(/\s+/).filter(Boolean).map((value) => value.normalize("NFKC"));
      }
      if (typeof character === "string") return character.normalize("NFKC");
      throw new Error(`${fileName}: <${display.name}> writes its character in quotes, as in character="雨"`);
    });
    if (items.size) throw new Error(`${fileName}: <FocusItem> must be directly inside <CharacterFocus>`);
    tree.children?.push(exportConst("displayedCharacters", [...new Set(characters)]));
  };
}
