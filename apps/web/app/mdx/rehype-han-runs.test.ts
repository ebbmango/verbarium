import { describe, expect, it } from "vitest";

import rehypeHanRuns from "./rehype-han-runs";

type Node = Parameters<ReturnType<typeof rehypeHanRuns>>[0];

const text = (value: string): Node => ({ type: "text", value });
const span = (value: string): Node => ({
  type: "element",
  tagName: "span",
  properties: { lang: "zh-Hant" },
  children: [text(value)],
});
const element = (tagName: string, children: Node[], properties: Record<string, unknown> = {}): Node => ({
  type: "element",
  tagName,
  properties,
  children,
});
const component = (children: Node[], attributes: Array<{ type: string; name?: string }> = []): Node => ({
  type: "mdxJsxFlowElement",
  attributes,
  children,
});

function marked(...children: Node[]): Node[] {
  const tree: Node = { type: "root", children };
  rehypeHanRuns()(tree);
  return tree.children ?? [];
}

describe("rehypeHanRuns", () => {
  it("wraps every run of Han characters in a paragraph", () => {
    const [paragraph] = marked(
      element("p", [text("Drops of water falling from a 冂 cloud that hangs to 一 heaven; 丿 means the vertical falling.")]),
    );

    expect(paragraph.children).toEqual([
      text("Drops of water falling from a "),
      span("冂"),
      text(" cloud that hangs to "),
      span("一"),
      text(" heaven; "),
      span("丿"),
      text(" means the vertical falling."),
    ]);
  });

  it("keeps a run of several characters in one span, also inside strong", () => {
    const [paragraph] = marked(element("p", [element("strong", [text("千里之行始於足下 begins")]), text(" with 一")]));

    expect(paragraph.children).toEqual([
      element("strong", [span("千里之行始於足下"), text(" begins")]),
      text(" with "),
      span("一"),
    ]);
  });

  it("marks paragraphs markdown made inside a component, but not text the component gets directly", () => {
    const [section, closingLine] = marked(
      component([element("p", [text("一 represents heaven.")])]),
      component([text("千里之行始於足下")]),
    );

    expect(section.children).toEqual([element("p", [span("一"), text(" represents heaven.")])]);
    expect(closingLine.children).toEqual([text("千里之行始於足下")]);
  });

  it("leaves text that already sits inside a lang", () => {
    const quotation = element("p", [text("一也者")], { lang: "zh-Hant" });
    const labelled = component([element("p", [text("天")])], [{ type: "mdxJsxAttribute", name: "lang" }]);
    const [first, second] = marked(quotation, labelled);

    expect(first).toEqual(element("p", [text("一也者")], { lang: "zh-Hant" }));
    expect(second.children).toEqual([element("p", [text("天")])]);
  });

  it("leaves text without Han characters as it was, and does not count punctuation as Han", () => {
    const plain = text("The rain.");
    const [paragraph] = marked(element("p", [plain, text("天（heaven）。")]));

    expect(paragraph.children?.[0]).toBe(plain);
    expect(paragraph.children?.slice(1)).toEqual([span("天"), text("（heaven）。")]);
  });
});
