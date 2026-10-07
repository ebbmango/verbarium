import { describe, expect, it } from "vitest";

import * as lessonOne from "../content/lessons/001.mdx";
import remarkLessonHeader, { type MdastNode } from "./remark-lesson-header";

const lessonFile = "/repo/apps/web/app/content/lessons/002.mdx";

function header(attributes: MdastNode["attributes"]): MdastNode {
  return { type: "mdxJsxFlowElement", name: "LessonHeader", attributes, children: [] };
}
const number = (value: string) => ({
  type: "mdxJsxAttribute",
  name: "number",
  value: { type: "mdxJsxAttributeValueExpression", value },
});
const subtitle = (value: unknown) => ({ type: "mdxJsxAttribute", name: "subtitle", value });
const goodHeader = () => header([number("2"), subtitle("About 二, two strokes.")]);

function run(path: string, ...children: MdastNode[]): MdastNode[] {
  const tree: MdastNode = { type: "root", children };
  remarkLessonHeader()(tree, { path });
  return tree.children ?? [];
}

describe("remarkLessonHeader", () => {
  it("exports the header's number and subtitle from the lesson", () => {
    const exported = run(lessonFile, goodHeader()).at(-1) as MdastNode;
    const program = (exported.data as { estree: { body: Array<{ declaration: { declarations: unknown[] } }> } }).estree;
    const [declarator] = program.body[0].declaration.declarations as Array<{
      id: { name: string };
      init: { properties: Array<{ key: { name: string }; value: { value: unknown } }> };
    }>;

    expect(exported.type).toBe("mdxjsEsm");
    expect(declarator.id.name).toBe("lessonHeader");
    expect(declarator.init.properties.map((p) => [p.key.name, p.value.value])).toEqual([
      ["number", 2],
      ["subtitle", "About 二, two strokes."],
    ]);
  });

  it("leaves MDX outside the lessons alone", () => {
    const paragraph: MdastNode = { type: "paragraph", children: [] };
    expect(run("/repo/apps/web/app/content/dictionary/一.mdx", paragraph)).toEqual([paragraph]);
  });

  it("names the lesson file and the problem", () => {
    expect(() => run(lessonFile, { type: "paragraph", children: [] })).toThrow(
      '002.mdx: a lesson starts with <LessonHeader number={…} subtitle="…" />, and this one has none',
    );
    expect(() => run(lessonFile, header([number("3"), subtitle("x")]))).toThrow(
      "002.mdx: this file is Lesson 2, but its <LessonHeader> says number={3}",
    );
    expect(() => run(lessonFile, header([subtitle("x")]))).toThrow(
      "002.mdx: <LessonHeader> needs the lesson number in braces, as in number={1}",
    );
    expect(() => run(lessonFile, header([number("2")]))).toThrow(
      '002.mdx: <LessonHeader> needs a subtitle written in quotes, as in subtitle="…"',
    );
    expect(() =>
      run(lessonFile, header([number("2"), subtitle({ type: "mdxJsxAttributeValueExpression", value: "x" })])),
    ).toThrow("002.mdx: <LessonHeader> needs a subtitle written in quotes");
    expect(() => run(lessonFile, goodHeader(), goodHeader())).toThrow(
      "002.mdx: a lesson has one <LessonHeader>, this one has 2",
    );
    expect(() => run(lessonFile, { type: "mdxJsxFlowElement", name: "Commentary", children: [goodHeader()] })).toThrow(
      "002.mdx: <LessonHeader> must stand on a line of its own, outside other components",
    );
  });

  it("makes the compiled Lesson 1 carry its own header", () => {
    expect(lessonOne.lessonHeader).toEqual({ number: 1, subtitle: "About the primitive 一, a single stroke." });
  });
});
