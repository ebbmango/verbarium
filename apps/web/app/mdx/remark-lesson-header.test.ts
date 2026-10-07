import { describe, expect, it } from "vitest";

import * as lessonOne from "../content/lessons/001.mdx";
import remarkLessonHeader, { type MdastNode } from "./remark-lesson-header";

function header(attributes: MdastNode["attributes"]): MdastNode {
  return { type: "mdxJsxFlowElement", name: "LessonHeader", attributes, children: [] };
}
const number = (value: string) => ({
  type: "mdxJsxAttribute",
  name: "number",
  value: { type: "mdxJsxAttributeValueExpression", value },
});
const subtitle = (value: unknown) => ({ type: "mdxJsxAttribute", name: "subtitle", value });

function run(...children: MdastNode[]): MdastNode[] {
  const tree: MdastNode = { type: "root", children };
  remarkLessonHeader()(tree, { path: "002.mdx" });
  return tree.children ?? [];
}

describe("remarkLessonHeader", () => {
  it("exports the header's number and subtitle from the lesson", () => {
    const children = run(header([number("2"), subtitle("About 二, two strokes.")]));

    const exported = children.at(-1) as MdastNode;
    expect(exported.type).toBe("mdxjsEsm");
    expect(exported.value).toBe('export const lessonHeader = {"number":2,"subtitle":"About 二, two strokes."};');
  });

  it("leaves MDX without a LessonHeader alone", () => {
    const paragraph: MdastNode = { type: "paragraph", children: [] };
    expect(run(paragraph)).toEqual([paragraph]);
  });

  it("names the file and the problem when the header is incomplete", () => {
    expect(() => run(header([subtitle("About 二.")]))).toThrow(
      "002.mdx: <LessonHeader> needs a lesson number, as in number={1}",
    );
    expect(() => run(header([number("2")]))).toThrow("002.mdx: <LessonHeader> needs a subtitle in quotes");
    expect(() => run(header([number("2"), subtitle({ type: "mdxJsxAttributeValueExpression", value: "x" })]))).toThrow(
      "002.mdx: <LessonHeader> needs a subtitle in quotes",
    );
    expect(() => run(header([number("2"), subtitle("x")]), header([number("2"), subtitle("x")]))).toThrow(
      "002.mdx: a lesson has one <LessonHeader>, this one has 2",
    );
  });

  it("makes the compiled Lesson 1 carry its own header", () => {
    expect(lessonOne.lessonHeader).toEqual({ number: 1, subtitle: "About the primitive 一, a single stroke." });
  });
});
