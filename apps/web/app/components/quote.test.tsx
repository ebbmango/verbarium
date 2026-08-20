import { act, fireEvent, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { shuowenJieziOnOne } from "../content/quotes/shuowen-jiezi-on-one";
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

function token(paragraph: Element, id: number): HTMLElement {
  const element = paragraph.querySelector(`[data-token-id="${id}"]`);

  expect(element).not.toBeNull();
  return element as HTMLElement;
}

afterEach(() => {
  vi.useRealTimers();
});

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
    const sourceLink = within(provenance as HTMLElement).getByRole("link", { name: "The textual witness" });
    expect(sourceLink).toHaveAttribute("href", "https://example.com/witness");
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
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
    const sourceLink = within(provenance as HTMLElement).getByRole("link", {
      name: "Wang Bi’s notes on the Dao De Jing",
    });
    expect(sourceLink).toHaveAttribute("href", "https://ctext.org/dao-de-zhen-jing-zhu#n90518");
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(quotation).not.toHaveTextContent("yi1");
    expect(quotation).not.toHaveTextContent("shu4");
  });

  it("rebuilds the second quotation with its authored line breaks", () => {
    const { container } = render(
      <Quote
        quote={shuowenJieziOnOne}
        sourceHref="https://ctext.org/shuo-wen-jie-zi/yi-bu#n26162"
      />,
    );

    const quotation = container.querySelector("blockquote.lesson-quote");
    const source = quotation?.children[0] as Element;
    const target = quotation?.children[1] as Element;
    const provenance = quotation?.children[2] as HTMLElement;

    expect(textWithAuthoredBreaks(source)).toBe("惟初太始，道立於一，\n造分天地，化成萬物。");
    expect(textWithAuthoredBreaks(target)).toBe(
      "At the very beginning, at the great origin,\nthe Dao was established in One.\nIt created and separated Heaven and Earth,\ntransforming into all things.",
    );

    const sourceLink = within(provenance).getByRole("link", { name: "Shuowen Jiezi" });
    expect(sourceLink).toHaveAttribute("href", "https://ctext.org/shuo-wen-jie-zi/yi-bu#n26162");
    expect(quotation).not.toHaveTextContent("chu1");
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

  it("activates every member of a many-to-many mapping after the cold delay", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const quotation = container.querySelector("blockquote.lesson-quote");
    const source = quotation?.children[0] as Element;
    const target = quotation?.children[1] as Element;
    const firstYe = token(source, 6);
    const secondYe = token(source, 11);
    const targetIs = token(target, 2);

    fireEvent.pointerEnter(firstYe);
    act(() => vi.advanceTimersByTime(499));

    expect(firstYe.style.color).toBe("");
    expect(secondYe.style.color).toBe("");
    expect(targetIs.style.color).toBe("");

    act(() => vi.advanceTimersByTime(1));

    expect(firstYe.style.color).toBe("var(--red)");
    expect(secondYe.style.color).toBe("var(--red)");
    expect(targetIs.style.color).toBe("var(--red)");
  });

  it("activates an unsorted mapping from the target without changing rendered order", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const quotation = container.querySelector("blockquote.lesson-quote");
    const source = quotation?.children[0] as Element;
    const target = quotation?.children[1] as Element;

    fireEvent.pointerEnter(token(target, 4));
    act(() => vi.advanceTimersByTime(500));

    expect(token(source, 5).style.color).toBe("var(--red)");
    expect(token(target, 4).style.color).toBe("var(--red)");
    expect(token(target, 6).style.color).toBe("var(--red)");
    expect(target.textContent).toBe("One is the origin of number and the utmost of things.");
  });

  it("does not restart pending activation or flicker active color within one mapping", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const source = container.querySelector("blockquote.lesson-quote")?.children[0] as Element;
    const firstYe = token(source, 6);
    const secondYe = token(source, 11);

    fireEvent.pointerEnter(firstYe);
    act(() => vi.advanceTimersByTime(400));
    fireEvent.pointerEnter(secondYe);
    act(() => vi.advanceTimersByTime(100));

    expect(firstYe.style.color).toBe("var(--red)");
    expect(secondYe.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(firstYe);
    expect(firstYe.style.color).toBe("var(--red)");
    expect(secondYe.style.color).toBe("var(--red)");
  });

  it("keeps equal source and target IDs independent for one-sided mappings", () => {
    vi.useFakeTimers();

    const oneSidedQuote = {
      meta: { sourceText: "甲", targetText: "Alpha", provenance: "A witness" },
      sourceTokens: [{ id: 0, text: "甲", pinyin: null, line: 0, type: "character" }],
      targetTokens: [{ id: 0, text: "Alpha", line: 0, type: "text" }],
      mappings: [
        { id: "source-only", sourceTokenIds: [0], targetTokenIds: [] },
        { id: "target-only", sourceTokenIds: [], targetTokenIds: [0] },
      ],
    } satisfies QuoteSlicerExport;

    const sourceRender = render(<Quote quote={oneSidedQuote} />);
    const sourceParagraph = sourceRender.container.querySelector("blockquote")?.children[0] as Element;
    const targetParagraph = sourceRender.container.querySelector("blockquote")?.children[1] as Element;

    fireEvent.pointerEnter(token(sourceParagraph, 0));
    act(() => vi.advanceTimersByTime(500));

    expect(token(sourceParagraph, 0).style.color).toBe("var(--red)");
    expect(token(targetParagraph, 0).style.color).toBe("");

    sourceRender.unmount();

    const targetRender = render(<Quote quote={oneSidedQuote} />);
    const nextSourceParagraph = targetRender.container.querySelector("blockquote")?.children[0] as Element;
    const nextTargetParagraph = targetRender.container.querySelector("blockquote")?.children[1] as Element;

    fireEvent.pointerEnter(token(nextTargetParagraph, 0));
    act(() => vi.advanceTimersByTime(500));

    expect(token(nextSourceParagraph, 0).style.color).toBe("");
    expect(token(nextTargetParagraph, 0).style.color).toBe("var(--red)");
  });

  it("clears immediately when the pointer enters an unmapped source or target token", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const quotation = container.querySelector("blockquote") as Element;
    const source = quotation.children[0] as Element;
    const target = quotation.children[1] as Element;
    const mappedOne = token(source, 0);

    fireEvent.pointerEnter(mappedOne);
    act(() => vi.advanceTimersByTime(500));
    expect(mappedOne.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(token(source, 1));

    expect(mappedOne.style.color).toBe("");

    const targetOne = token(target, 0);
    fireEvent.pointerEnter(targetOne);
    act(() => vi.advanceTimersByTime(300));
    expect(targetOne.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(token(target, 12));
    expect(targetOne.style.color).toBe("");
  });

  it("cancels pending work and clears active color when either paragraph is left", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const quotation = container.querySelector("blockquote") as Element;
    const source = quotation.children[0] as Element;
    const target = quotation.children[1] as Element;
    const sourceOne = token(source, 0);
    const targetOne = token(target, 0);

    fireEvent.pointerEnter(sourceOne);
    act(() => vi.advanceTimersByTime(400));
    fireEvent.pointerLeave(source);
    act(() => vi.advanceTimersByTime(100));
    expect(sourceOne.style.color).toBe("");

    fireEvent.pointerEnter(targetOne);
    act(() => vi.advanceTimersByTime(500));
    expect(targetOne.style.color).toBe("var(--red)");

    fireEvent.pointerLeave(target);
    expect(targetOne.style.color).toBe("");
  });

  it("retains active mapping A until mapping B activates after the warm delay", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const quotation = container.querySelector("blockquote") as Element;
    const source = quotation.children[0] as Element;
    const target = quotation.children[1] as Element;
    const mappingA = token(source, 0);
    const mappingB = token(source, 3);

    fireEvent.pointerEnter(mappingA);
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(mappingB);
    act(() => vi.advanceTimersByTime(299));

    expect(mappingA.style.color).toBe("var(--red)");
    expect(mappingB.style.color).toBe("");

    act(() => vi.advanceTimersByTime(1));

    expect(mappingA.style.color).toBe("");
    expect(mappingB.style.color).toBe("var(--red)");
    expect(token(target, 10).style.color).toBe("var(--red)");
  });

  it("uses the warm delay only during the 500 ms grace period", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const source = container.querySelector("blockquote")?.children[0] as Element;
    const mappingA = token(source, 0);
    const mappingB = token(source, 3);

    fireEvent.pointerEnter(mappingA);
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(token(source, 1));
    fireEvent.pointerEnter(mappingB);
    act(() => vi.advanceTimersByTime(299));
    expect(mappingB.style.color).toBe("");

    act(() => vi.advanceTimersByTime(1));
    expect(mappingB.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(token(source, 1));
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(mappingA);
    act(() => vi.advanceTimersByTime(300));
    expect(mappingA.style.color).toBe("");

    act(() => vi.advanceTimersByTime(200));
    expect(mappingA.style.color).toBe("var(--red)");
  });

  it("retains the active mapping across target whitespace and an internal gap", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const target = container.querySelector("blockquote")?.children[1] as Element;
    const targetOne = token(target, 0);

    fireEvent.pointerEnter(targetOne);
    act(() => vi.advanceTimersByTime(500));
    expect(targetOne.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(token(target, 1));
    expect(targetOne.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(target);
    expect(targetOne.style.color).toBe("var(--red)");
  });

  it("cancels pending timers when the export changes or the quotation unmounts", () => {
    vi.useFakeTimers();

    const replacementQuote = {
      ...wangBiNotesOnOne,
      mappings: [
        {
          id: wangBiNotesOnOne.mappings[0].id,
          sourceTokenIds: [3],
          targetTokenIds: [],
        },
      ],
    } satisfies QuoteSlicerExport;
    const quoteRender = render(<Quote quote={wangBiNotesOnOne} />);
    const originalSource = quoteRender.container.querySelector("blockquote")?.children[0] as Element;

    fireEvent.pointerEnter(token(originalSource, 0));
    act(() => vi.advanceTimersByTime(400));
    quoteRender.rerender(<Quote quote={replacementQuote} />);
    act(() => vi.advanceTimersByTime(100));

    const replacementSource = quoteRender.container.querySelector("blockquote")?.children[0] as Element;
    const replacementMember = token(replacementSource, 3);
    expect(replacementMember.style.color).toBe("");

    fireEvent.pointerEnter(replacementMember);
    act(() => vi.advanceTimersByTime(499));
    expect(replacementMember.style.color).toBe("");
    act(() => vi.advanceTimersByTime(1));
    expect(replacementMember.style.color).toBe("var(--red)");

    quoteRender.unmount();

    const pendingRender = render(<Quote quote={wangBiNotesOnOne} />);
    const pendingSource = pendingRender.container.querySelector("blockquote")?.children[0] as Element;
    fireEvent.pointerEnter(token(pendingSource, 0));
    expect(vi.getTimerCount()).toBe(1);

    pendingRender.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("changes only active text color and removes its presentation immediately on clear", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={wangBiNotesOnOne} />);
    const source = container.querySelector("blockquote")?.children[0] as Element;
    const activeToken = token(source, 0);
    const restingToken = token(source, 1);

    fireEvent.pointerEnter(activeToken);
    act(() => vi.advanceTimersByTime(500));

    expect(activeToken).toHaveClass("quote-token-active");
    expect(activeToken.style.color).toBe("var(--red)");
    expect(activeToken.style.background).toBe("");
    expect(activeToken.style.fontWeight).toBe("");
    expect(activeToken.style.opacity).toBe("");
    expect(activeToken.style.padding).toBe("");
    expect(restingToken).not.toHaveClass("quote-token-active");
    expect(restingToken.getAttribute("style")).toBeNull();

    fireEvent.pointerEnter(restingToken);

    expect(activeToken).not.toHaveClass("quote-token-active");
    expect(activeToken.style.color).toBe("");
  });
});
