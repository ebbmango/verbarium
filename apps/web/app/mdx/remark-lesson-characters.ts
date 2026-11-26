/**
 * Exports the characters a lesson displays, from its `<CharDisplay>` and
 * `<CharacterFocus>`, as `displayedCharacters`, so a dictionary page can name
 * the lessons that display its headword. A radical or compatibility form is
 * read as the character it looks like, as the dictionary reads it. A display
 * without its character in quotes, or a <CharDisplay> without the reading it
 * teaches, fails the build, naming the file. Other MDX is left alone.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { lessonNumberFromPath } from "../content/lessons/lesson-files.ts";
import { attributeValue, exportConst, findComponents, type MdastNode } from "./mdx-tree.ts";

function content(node: MdastNode) {
  return (node.children ?? []).filter(child => !(child.type === "text" && !String(child.value).trim()));
}

/** A nudge is a signed fraction of the character's size, within half of it: "0.03", "-0.05". */
function checkNudge(value: string, fail: (message: string) => never) {
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(value) || Math.abs(Number(value)) > 0.5) {
    fail(`writes nudge as a fraction of the character's size between -0.5 and 0.5, as in nudge="0.03", not ${value}`);
  }
}

function focusItemReference(item: MdastNode, file: string): string[] {
  const fail = (message: string): never => { throw new Error(`${file}: <FocusItem> ${message}`); };
  const props = new Map<string, string>();
  for (const attr of item.attributes ?? []) {
    const key = attr.name ?? "";
    if (!["character", "headword", "name", "description", "caption", "subcaption", "spine", "nudge", "parts"].includes(key) || props.has(key)) {
      fail(`unexpected or repeated attribute ${key}`);
    }
    if (key === "spine" || key === "parts") {
      if (attr.value !== null && attr.value !== undefined) fail(`writes ${key} bare, as in <FocusItem character="礻" ${key} />`);
      props.set(key, "");
      continue;
    }
    if (typeof attr.value !== "string" || !attr.value.trim()) return fail(`requires quoted, nonempty ${key}`);
    props.set(key, attr.value);
  }
  const captions = content(item);
  if (captions.length) {
    if (props.has("caption") || props.has("subcaption")) fail("takes captions as props or as children, not both");
    const names = captions.map(child => child.type.startsWith("mdxJsx") ? child.name : child.type).join(" ");
    if (!["Caption", "Caption Subcaption", "Subcaption"].includes(names)) {
      fail(`may contain only <Caption> then <Subcaption>, found ${names}`);
    }
  }
  for (const key of ["character", "headword"]) {
    const value = props.get(key);
    if (value && !/^\p{Script_Extensions=Han}\p{Variation_Selector}?$/u.test(value)) fail(`${key} must be one Han character`);
  }
  const nudge = props.get("nudge");
  if (nudge !== undefined) checkNudge(nudge, fail);
  const name = props.get("name");
  if (name) {
    if (!/^[\p{L}\p{N}_-]+(?:\.[\p{L}\p{N}_-]+)*$/u.test(name)) fail("name must be a local asset filename");
    if (!props.has("description")) fail("requires a description for artwork");
    if (props.has("spine")) fail("takes spine only for a text character, not artwork");
    if (props.has("nudge")) fail("takes nudge only for a text character, not artwork");
    if (props.has("parts")) fail("takes parts only for a text character, not artwork");
  } else if (!props.has("character") || props.has("description")) {
    fail("requires character for text, or name and description for artwork");
  }
  const reference = props.get("headword") ?? props.get("character");
  return reference ? [reference.normalize("NFKC")] : [];
}

/** The part names of a character's outline file (app/content/parts), or none when it has no file. */
function partNames(character: string): string[] {
  const file = join(import.meta.dirname, "../content/parts", `${character}.json`);
  return existsSync(file) ? Object.keys(JSON.parse(readFileSync(file, "utf8")).parts) : [];
}

/** `<PartWords part="艸">` must name a part of a character the lesson draws with `parts`. */
function checkPartWords(tree: MdastNode, fileName: string) {
  const drawn = findComponents(tree, "CharacterFocus").filter((display) => display.attributes?.some((attribute) => attribute.name === "parts"));
  const names = new Set(drawn.flatMap((display) => {
    const character = attributeValue(display, "character");
    return typeof character === "string" ? partNames(character) : [];
  }));
  for (const words of findComponents(tree, "PartWords")) {
    const part = attributeValue(words, "part");
    if (typeof part !== "string" || !names.has(part)) {
      const known = names.size ? `one of ${[...names].join(" ")}` : `a part of a <CharacterFocus character="…" parts /> in this lesson`;
      throw new Error(`${fileName}: <PartWords> names ${typeof part === "string" ? part : "no part"}; it must name ${known}`);
    }
  }
}

export default function remarkLessonCharacters() {
  return (tree: MdastNode, file: { path?: string }) => {
    const path = file.path ?? "";
    if (lessonNumberFromPath(path) === null) return;

    const fileName = path.split(/[\\/]/).at(-1);
    checkPartWords(tree, fileName ?? path);
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
      if (display.name === "CharacterFocus") {
        const size = attributeValue(display, "size");
        if (size !== undefined && size !== "small") throw new Error(`${fileName}: <CharacterFocus> takes size="small" or no size`);
        const allowed = ["size", "character", "characters", "highlight", "caption", "subcaption", "spine", "nudge", "parts"];
        const unknown = display.attributes?.find((attribute) => !allowed.includes(attribute.name ?? ""));
        if (unknown) throw new Error(`${fileName}: <CharacterFocus> has no prop ${unknown.name}`);
        const parts = display.attributes?.find((attribute) => attribute.name === "parts");
        if (parts && parts.value !== null && parts.value !== undefined) throw new Error(`${fileName}: <CharacterFocus> writes parts bare, as in <CharacterFocus character="蒜" parts />`);
        if (parts && attributeValue(display, "highlight") !== undefined) throw new Error(`${fileName}: <CharacterFocus> uses either parts or highlight, not both`);
        const nudge = attributeValue(display, "nudge");
        if (nudge !== undefined) {
          checkNudge(typeof nudge === "string" ? nudge : "", (message) => { throw new Error(`${fileName}: <CharacterFocus> ${message}`); });
        }
        if (group !== undefined && ["caption", "subcaption", "spine", "nudge", "parts", "highlight"].some((name) => attributeValue(display, name) !== undefined)) {
          throw new Error(`${fileName}: <CharacterFocus characters> takes no captions; write <FocusItem> children instead`);
        }
      }
      if (display.name === "CharacterFocus" && content(display).length) {
        if (display.attributes?.some((attribute) => attribute.name !== "size")) {
          throw new Error(`${fileName}: <CharacterFocus> with children takes no props but size`);
        }
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
