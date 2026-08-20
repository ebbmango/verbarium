import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { wangBiNotesOnOne } from "../content/quotes/wang-bi-notes-on-one";
import type { QuoteSlicerExport } from "../quote-slicer-export";
import { LegacyQuote, Quote } from "./quote";

function textWithAuthoredBreaks(element: Element): string {
  return Array.from(element.childNodes, (node) => {
    if (node.nodeName === "BR") return "\n";
    if (node instanceof Element) return textWithAuthoredBreaks(node);
    return node.textContent ?? "";
  }).join("");
}

describe("LegacyQuote", () => {
  it("preserves authored quotation content and linked provenance", () => {
    const { container } = render(
      <LegacyQuote source="The textual witness" sourceHref="https://example.com/witness">
        <p lang="zh-Hant">甲<br />乙</p>
        <p>The translation</p>
      </LegacyQuote>,
    );

    const quotation = container.querySelector("blockquote.lesson-quote");

    expect(quotation).not.toBeNull();
    expect(quotation?.children).toHaveLength(3);
    expect(quotation?.children[0]).toHaveAttribute("lang", "zh-Hant");
    expect(quotation?.children[0]).toContainHTML("甲<br>乙");
    expect(quotation?.children[1]).toHaveTextContent("The translation");

    const provenance = quotation?.children[2];
    expect(provenance).toHaveClass("quote-source");
    expect(within(provenance as HTMLElement).getByRole("link", { name: "The textual witness" })).toHaveAttribute(
      "href",
      "https://example.com/witness",
    );
  });
});

describe("Quote", () => {
  it("rebuilds the first quotation from its Quote Slicer export", () => {
    const { container } = render(
      <Quote
        quote={wangBiNotesOnOne}
        sourceHref="https://ctext.org/dao-de-zhen-jing-zhu#n90518"
      />,
    );

    const quotation = container.querySelector("blockquote.lesson-quote");

    expect(quotation).not.toBeNull();
    expect(Array.from(quotation?.children ?? [], ({ tagName }) => tagName)).toEqual(["P", "P", "FOOTER"]);

    const source = quotation?.children[0];
    expect(source).toHaveAttribute("lang", "zh-Hant");
    expect(source?.textContent).toBe("一者，數之始也，物之極也。");
    expect(source?.querySelectorAll("br")).toHaveLength(0);

    const target = quotation?.children[1];
    expect(target?.textContent).toBe("One is the origin of number and the utmost of things.");
    expect(target?.querySelectorAll("br")).toHaveLength(0);

    const provenance = quotation?.children[2];
    expect(within(provenance as HTMLElement).getByRole("link", { name: "Wang Bi’s notes on the Dao De Jing" })).toHaveAttribute(
      "href",
      "https://ctext.org/dao-de-zhen-jing-zhu#n90518",
    );
    expect(quotation).not.toHaveTextContent("yi1");
    expect(quotation).not.toHaveTextContent("shu4");
  });

  it("uses token order and line assignments instead of flattened metadata", () => {
    const multilineQuote = {
      meta: {
        sourceText: "Wrong source order",
        targetText: "Wrong target order",
        provenance: "An unlinked textual witness",
      },
      sourceTokens: [
        { id: 9, text: "甲", pinyin: undefined, line: 0, type: "character" },
        { id: 3, text: "，", pinyin: null, line: 0, type: "punctuation" },
        { id: 7, text: "乙", pinyin: "yi3", line: 1, type: "character" },
      ],
      targetTokens: [
        { id: 20, text: "First", line: 0, type: "text" },
        { id: 4, text: "  ", line: 0, type: "whitespace" },
        { id: 12, text: "part", line: 0, type: "text" },
        { id: 5, text: " ", line: 0, type: "whitespace" },
        { id: 1, text: "Second", line: 1, type: "text" },
      ],
      mappings: [],
    } satisfies QuoteSlicerExport;

    const { container } = render(<Quote quote={multilineQuote} />);
    const quotation = container.querySelector("blockquote.lesson-quote");
    const source = quotation?.children[0];
    const target = quotation?.children[1];
    const provenance = quotation?.children[2];

    expect(textWithAuthoredBreaks(source as Element)).toBe("甲，\n乙");
    expect(textWithAuthoredBreaks(target as Element)).toBe("First  part\nSecond");
    expect(quotation).not.toHaveTextContent("Wrong source order");
    expect(quotation).not.toHaveTextContent("Wrong target order");
    expect(provenance).toHaveTextContent("An unlinked textual witness");
    expect(within(provenance as HTMLElement).queryByRole("link")).not.toBeInTheDocument();
  });
});
