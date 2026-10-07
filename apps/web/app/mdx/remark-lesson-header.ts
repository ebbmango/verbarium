/**
 * Makes a lesson's own `<LessonHeader number={1} subtitle="…" />` the one
 * place its number and subtitle are written. At compile time this plugin
 * reads the header and exports it from the lesson module as `lessonHeader`,
 * so the lesson registry, the lesson index and the page description use the
 * same text without code in the lesson file.
 *
 * In a lesson file (content/lessons/NNN.mdx) the header must be there once,
 * on a line of its own, with the file's number. A mistake fails the build
 * here, naming the file: pre-rendering would only report a failed page.
 * Other MDX, such as dictionary pages, is left alone.
 */

import { lessonNumberFromPath } from "../content/lessons/lesson-files.ts";
import { attributeValue, exportConst, findComponents, type MdastNode } from "./mdx-tree.ts";

export type LessonHeaderData = { number: number; subtitle: string };

export default function remarkLessonHeader() {
  return (tree: MdastNode, file: { path?: string }) => {
    const path = file.path ?? "";
    const fileName = path.split(/[\\/]/).at(-1) ?? "";
    const lessonNumber = lessonNumberFromPath(path);
    const fail = (problem: string): never => {
      throw new Error(`${fileName || "This lesson"}: ${problem}`);
    };

    const headers = findComponents(tree, "LessonHeader");
    if (headers.length === 0) {
      if (lessonNumber !== null) fail("a lesson starts with <LessonHeader number={…} subtitle=\"…\" />, and this one has none");
      return;
    }
    if (headers.length > 1) fail(`a lesson has one <LessonHeader>, this one has ${headers.length}`);
    if (!tree.children?.includes(headers[0])) fail("<LessonHeader> must stand on a line of its own, outside other components");

    const header: LessonHeaderData = { number: readNumber(headers[0], fail), subtitle: readSubtitle(headers[0], fail) };
    if (lessonNumber !== null && header.number !== lessonNumber) {
      fail(`this file is Lesson ${lessonNumber}, but its <LessonHeader> says number={${header.number}}`);
    }
    tree.children?.push(exportConst("lessonHeader", header));
  };
}

function readNumber(node: MdastNode, fail: (problem: string) => never): number {
  const value = attributeValue(node, "number") as { type?: string; value?: string } | undefined;
  const text = value?.type === "mdxJsxAttributeValueExpression" ? (value.value ?? "").trim() : "";
  return /^\d+$/.test(text) ? Number(text) : fail("<LessonHeader> needs the lesson number in braces, as in number={1}");
}

function readSubtitle(node: MdastNode, fail: (problem: string) => never): string {
  const value = attributeValue(node, "subtitle");
  return typeof value === "string" && value.trim() !== ""
    ? value
    : fail('<LessonHeader> needs a subtitle written in quotes, as in subtitle="…"');
}
