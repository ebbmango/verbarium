import { describe, expect, it } from "vitest";

import rehypeHanRuns, { type HastNode } from "./rehype-han-runs";

const text = (value: string): HastNode => ({ type: "text", value });
const span = (value: string): HastNode => ({
  type: "element",
  tagName: "span",
  properties: { lang: "zh-Hant" },
  children: [text(value)],
});
const element = (tagName: string, children: HastNode[], properties: Record<string, unknown> = {}): HastNode => ({
  type: "element",
  tagName,
  properties,
  children,
});
const component = (children: HastNode[], attributes: HastNode["attributes"] = []): HastNode => ({
  type: "mdxJsxFlowElement",
  attributes,
  children,
});

function marked(...children: HastNode[]): HastNode[] {
  const tree: HastNode = { type: "root", children };
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

  it("keeps Chinese punctuation inside the run it touches, never on its own", () => {
    const [paragraph] = marked(element("p", [text("the saying 一，二。 and then（heaven）after")]));

    expect(paragraph.children).toEqual([
      text("the saying "),
      span("一，二。"),
      text(" and then（heaven）after"),
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

  it("leaves text that already sits inside something marked as Chinese, but not another language", () => {
    const quotation = element("p", [text("一也者")], { lang: "zh-Hant" });
    const labelled = component(
      [element("p", [text("天")])],
      [{ type: "mdxJsxAttribute", name: "lang", value: "zh-Hant" }],
    );
    const english = element("p", [text("一")], { lang: "en" });
    const [first, second, third] = marked(quotation, labelled, english);

    expect(first).toEqual(element("p", [text("一也者")], { lang: "zh-Hant" }));
    expect(second.children).toEqual([element("p", [text("天")])]);
    expect(third).toEqual(element("p", [span("一")], { lang: "en" }));
  });

  it("leaves text without Han characters as it was, and characters outside the basic plane whole", () => {
    const plain = text("The rain.");
    const [paragraph] = marked(element("p", [plain, text("𠃑 above 一")]));

    expect(paragraph.children?.[0]).toBe(plain);
    expect(paragraph.children?.slice(1)).toEqual([span("𠃑"), text(" above "), span("一")]);
  });
});
