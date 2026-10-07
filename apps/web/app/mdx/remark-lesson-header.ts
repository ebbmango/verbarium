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

import { lessonNumberFromFileName } from "../content/lessons/lesson-files.ts";

export type LessonHeaderData = { number: number; subtitle: string };

/** The slice of an MDX syntax tree this plugin needs to know. */
export type MdastNode = {
  type: string;
  name?: string | null;
  value?: unknown;
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: MdastNode[];
  data?: unknown;
};

export default function remarkLessonHeader() {
  return (tree: MdastNode, file: { path?: string }) => {
    const path = file.path ?? "";
    const fileName = path.split(/[\\/]/).at(-1) ?? "";
    const lessonNumber = /[\\/]content[\\/]lessons[\\/][^\\/]+$/.test(path) ? lessonNumberFromFileName(fileName) : null;
    const fail = (problem: string): never => {
      throw new Error(`${fileName || "This lesson"}: ${problem}`);
    };

    const headers = findLessonHeaders(tree);
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
    tree.children?.push(exportLessonHeader(header));
  };
}

function findLessonHeaders(node: MdastNode): MdastNode[] {
  const found = node.name === "LessonHeader" && node.type.startsWith("mdxJsx") ? [node] : [];
  return found.concat((node.children ?? []).flatMap(findLessonHeaders));
}

function attributeValue(node: MdastNode, name: string): unknown {
  return node.attributes?.find((attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === name)?.value;
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

/** `export const lessonHeader = { number, subtitle };`, with the syntax tree MDX compiles from. */
function exportLessonHeader(header: LessonHeaderData): MdastNode {
  const property = (key: keyof LessonHeaderData) => ({
    type: "Property",
    kind: "init",
    method: false,
    shorthand: false,
    computed: false,
    key: { type: "Identifier", name: key },
    value: { type: "Literal", value: header[key], raw: JSON.stringify(header[key]) },
  });

  return {
    type: "mdxjsEsm",
    value: `export const lessonHeader = ${JSON.stringify(header)};`,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        comments: [],
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [],
            source: null,
            attributes: [],
            declaration: {
              type: "VariableDeclaration",
              kind: "const",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: { type: "Identifier", name: "lessonHeader" },
                  init: { type: "ObjectExpression", properties: [property("number"), property("subtitle")] },
                },
              ],
            },
          },
        ],
      },
    },
  };
}
