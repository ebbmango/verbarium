import { act, fireEvent, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { l001aQ02DaoOne } from "../content/quotes/L001A-Q02-dao-one";
import { l001aQ03OriginNumber } from "../content/quotes/L001A-Q03-origin-number";
import { l001cQ01HeavenHighest } from "../content/quotes/L001C-Q01-heaven-highest";
import { l001iQ01BlockedBreath } from "../content/quotes/L001I-Q01-blocked-breath";
import type { AttestationTranslationAlignment } from "../quote-slicer-export";
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
  vi.restoreAllMocks();
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
  it("rebuilds a passage from its aligned token sequences", () => {
    const { container } = render(
      <Quote
        provenance="Wang Bi’s notes on the Dao De Jing"
        quote={l001aQ03OriginNumber}
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

  it("rebuilds the migrated passage with alignment-owned line breaks", () => {
    const { container } = render(
      <Quote
        provenance="Shuowen Jiezi"
        quote={l001aQ02DaoOne}
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

  it("preserves boundary whitespace with or without an editorial break", () => {
    const { container, rerender } = render(<Quote quote={l001iQ01BlockedBreath} />);
    const target = container.querySelector("blockquote.lesson-quote")?.children[1] as Element;

    expect(textWithAuthoredBreaks(target)).toBe(
      "Air wishes to come out.\nThe upward flow is blocked by the horizontal stroke.",
    );

    const passageWithoutBreak = {
      ...l001iQ01BlockedBreath,
      alignment: {
        ...l001iQ01BlockedBreath.alignment,
        breaks: { ...l001iQ01BlockedBreath.alignment.breaks, translation: [] },
      },
    } satisfies AttestationTranslationAlignment;

    rerender(<Quote quote={passageWithoutBreak} />);

    const unbrokenTarget = container.querySelector("blockquote.lesson-quote")?.children[1] as Element;
    expect(textWithAuthoredBreaks(unbrokenTarget)).toBe(
      "Air wishes to come out. The upward flow is blocked by the horizontal stroke.",
    );
  });

  it("marks only translated Chinese characters as non-italic", () => {
    const { container } = render(<Quote quote={l001cQ01HeavenHighest} />);
    const target = container.querySelector("blockquote.lesson-quote")?.children[1] as Element;
    const hanzi = token(target, 0);
    const translatedText = token(target, 2);

    expect(hanzi).toHaveTextContent("天");
    expect(hanzi).toHaveClass("quote-target-hanzi");
    expect(translatedText).toHaveTextContent("is");
    expect(translatedText).not.toHaveClass("quote-target-hanzi");
  });

  it("uses token order and explicit boundary positions", () => {
    const multilineQuote = {
      attestation: {
        tokens: [
          { id: 9, text: "甲", pinyin: undefined, type: "character" },
          { id: 3, text: "，", pinyin: null, type: "punctuation" },
          { id: 7, text: "乙", pinyin: "yi3", type: "character" },
        ],
      },
      translation: {
        tokens: [
          { id: 20, text: "First", type: "text" },
          { id: 4, text: "  ", type: "whitespace" },
          { id: 12, text: "part", type: "text" },
          { id: 1, text: "Second", type: "text" },
        ],
      },
      alignment: {
        mappings: [],
        breaks: { attestation: [2], translation: [3] },
      },
    } satisfies AttestationTranslationAlignment;

    const { container } = render(<Quote provenance="An unlinked textual witness" quote={multilineQuote} />);
    const quotation = container.querySelector("blockquote.lesson-quote");
    const source = quotation?.children[0];
    const target = quotation?.children[1];
    const provenance = quotation?.children[2];

    expect(textWithAuthoredBreaks(source as Element)).toBe("甲，\n乙");
    expect(textWithAuthoredBreaks(target as Element)).toBe("First  part\nSecond");
    expect(provenance).toHaveTextContent("An unlinked textual witness");
    expect(within(provenance as HTMLElement).queryByRole("link")).not.toBeInTheDocument();
  });

  it("activates every member of a many-to-many mapping after the cold delay", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const quotation = container.querySelector("blockquote.lesson-quote");
    const source = quotation?.children[0] as Element;
    const target = quotation?.children[1] as Element;
    const firstMember = token(source, 15);
    const secondMember = token(source, 16);
    const targetMember = token(target, 42);

    fireEvent.pointerEnter(firstMember);
    act(() => vi.advanceTimersByTime(499));

    expect(firstMember.style.color).toBe("");
    expect(secondMember.style.color).toBe("");
    expect(targetMember.style.color).toBe("");

    act(() => vi.advanceTimersByTime(1));

    expect(firstMember.style.color).toBe("var(--red)");
    expect(secondMember.style.color).toBe("var(--red)");
    expect(targetMember.style.color).toBe("var(--red)");
  });

  it("activates an unsorted mapping from the target without changing rendered order", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const quotation = container.querySelector("blockquote.lesson-quote");
    const source = quotation?.children[0] as Element;
    const target = quotation?.children[1] as Element;

    fireEvent.pointerEnter(token(target, 4));
    act(() => vi.advanceTimersByTime(500));

    expect(token(source, 1).style.color).toBe("var(--red)");
    expect(token(target, 4).style.color).toBe("var(--red)");
    expect(token(target, 6).style.color).toBe("var(--red)");
    expect(textWithAuthoredBreaks(target)).toBe(
      "At the very beginning, at the great origin,\nthe Dao was established in One.\nIt created and separated Heaven and Earth,\ntransforming into all things.",
    );
  });

  it("does not restart pending activation or flicker active color within one mapping", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const source = container.querySelector("blockquote.lesson-quote")?.children[0] as Element;
    const firstMember = token(source, 15);
    const secondMember = token(source, 16);

    fireEvent.pointerEnter(firstMember);
    act(() => vi.advanceTimersByTime(400));
    fireEvent.pointerEnter(secondMember);
    act(() => vi.advanceTimersByTime(100));

    expect(firstMember.style.color).toBe("var(--red)");
    expect(secondMember.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(firstMember);
    expect(firstMember.style.color).toBe("var(--red)");
    expect(secondMember.style.color).toBe("var(--red)");
  });

  it("keeps equal source and target IDs independent for one-sided mappings", () => {
    vi.useFakeTimers();

    const oneSidedQuote = {
      attestation: {
        tokens: [{ id: 0, text: "甲", pinyin: null, type: "character" }],
      },
      translation: {
        tokens: [{ id: 0, text: "Alpha", type: "text" }],
      },
      alignment: {
        mappings: [
          { id: "source-only", sourceTokenIds: [0], targetTokenIds: [] },
          { id: "target-only", sourceTokenIds: [], targetTokenIds: [0] },
        ],
        breaks: { attestation: [], translation: [] },
      },
    } satisfies AttestationTranslationAlignment;

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

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const quotation = container.querySelector("blockquote") as Element;
    const source = quotation.children[0] as Element;
    const target = quotation.children[1] as Element;
    const mappedOne = token(source, 1);

    fireEvent.pointerEnter(mappedOne);
    act(() => vi.advanceTimersByTime(500));
    expect(mappedOne.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(token(source, 0));

    expect(mappedOne.style.color).toBe("");

    const targetOne = token(target, 4);
    fireEvent.pointerEnter(targetOne);
    act(() => vi.advanceTimersByTime(300));
    expect(targetOne.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(token(target, 0));
    expect(targetOne.style.color).toBe("");
  });

  it("cancels pending work and clears active color when either paragraph is left", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const quotation = container.querySelector("blockquote") as Element;
    const source = quotation.children[0] as Element;
    const target = quotation.children[1] as Element;
    const sourceOne = token(source, 1);
    const targetOne = token(target, 4);

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

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const quotation = container.querySelector("blockquote") as Element;
    const source = quotation.children[0] as Element;
    const target = quotation.children[1] as Element;
    const mappingA = token(source, 1);
    const mappingB = token(source, 2);

    fireEvent.pointerEnter(mappingA);
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(mappingB);
    act(() => vi.advanceTimersByTime(299));

    expect(mappingA.style.color).toBe("var(--red)");
    expect(mappingB.style.color).toBe("");

    act(() => vi.advanceTimersByTime(1));

    expect(mappingA.style.color).toBe("");
    expect(mappingB.style.color).toBe("var(--red)");
    expect(token(target, 12).style.color).toBe("var(--red)");
  });

  it("uses the warm delay only during the 500 ms grace period", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const source = container.querySelector("blockquote")?.children[0] as Element;
    const mappingA = token(source, 1);
    const mappingB = token(source, 2);

    fireEvent.pointerEnter(mappingA);
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(token(source, 0));
    fireEvent.pointerEnter(mappingB);
    act(() => vi.advanceTimersByTime(299));
    expect(mappingB.style.color).toBe("");

    act(() => vi.advanceTimersByTime(1));
    expect(mappingB.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(token(source, 0));
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(mappingA);
    act(() => vi.advanceTimersByTime(300));
    expect(mappingA.style.color).toBe("");

    act(() => vi.advanceTimersByTime(200));
    expect(mappingA.style.color).toBe("var(--red)");
  });

  it("retains the active mapping across target whitespace and an internal gap", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const target = container.querySelector("blockquote")?.children[1] as Element;
    const targetOne = token(target, 4);

    fireEvent.pointerEnter(targetOne);
    act(() => vi.advanceTimersByTime(500));
    expect(targetOne.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(token(target, 5));
    expect(targetOne.style.color).toBe("var(--red)");

    fireEvent.pointerEnter(target);
    expect(targetOne.style.color).toBe("var(--red)");
  });

  it("cancels pending timers when the export changes or the quotation unmounts", () => {
    vi.useFakeTimers();

    const replacementQuote = {
      ...l001aQ02DaoOne,
      alignment: {
        ...l001aQ02DaoOne.alignment,
        mappings: [
          {
            id: l001aQ02DaoOne.alignment.mappings[0].id,
            sourceTokenIds: [2],
            targetTokenIds: [],
          },
        ],
      },
    } satisfies AttestationTranslationAlignment;
    const quoteRender = render(<Quote quote={l001aQ02DaoOne} />);
    const originalSource = quoteRender.container.querySelector("blockquote")?.children[0] as Element;

    fireEvent.pointerEnter(token(originalSource, 1));
    act(() => vi.advanceTimersByTime(400));
    quoteRender.rerender(<Quote quote={replacementQuote} />);
    act(() => vi.advanceTimersByTime(100));

    const replacementSource = quoteRender.container.querySelector("blockquote")?.children[0] as Element;
    const replacementMember = token(replacementSource, 2);
    expect(replacementMember.style.color).toBe("");

    fireEvent.pointerEnter(replacementMember);
    act(() => vi.advanceTimersByTime(499));
    expect(replacementMember.style.color).toBe("");
    act(() => vi.advanceTimersByTime(1));
    expect(replacementMember.style.color).toBe("var(--red)");

    quoteRender.unmount();

    const pendingRender = render(<Quote quote={l001aQ02DaoOne} />);
    const pendingSource = pendingRender.container.querySelector("blockquote")?.children[0] as Element;
    fireEvent.pointerEnter(token(pendingSource, 1));
    expect(vi.getTimerCount()).toBe(1);

    pendingRender.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("activates, toggles, switches, and clears mappings immediately on touch", () => {
    vi.useFakeTimers();

    const { container } = render(
      <div>
        <Quote quote={l001aQ02DaoOne} />
        <button type="button">Outside the quotation</button>
      </div>,
    );
    const quotation = container.querySelector("blockquote") as Element;
    const source = quotation.children[0] as Element;
    const target = quotation.children[1] as Element;
    const sourceOne = token(source, 1);
    const targetOne = token(target, 4);
    const otherMapping = token(source, 2);

    fireEvent.touchStart(sourceOne);
    expect(sourceOne.style.color).toBe("var(--red)");
    expect(targetOne.style.color).toBe("var(--red)");
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.touchStart(sourceOne);
    expect(sourceOne.style.color).toBe("");

    fireEvent.touchStart(otherMapping);
    expect(otherMapping.style.color).toBe("var(--red)");
    fireEvent.touchStart(targetOne);
    expect(otherMapping.style.color).toBe("");
    expect(sourceOne.style.color).toBe("var(--red)");

    fireEvent.touchStart(token(source, 0));
    expect(sourceOne.style.color).toBe("");

    fireEvent.touchStart(targetOne);
    fireEvent.touchStart(within(container).getByRole("button", { name: "Outside the quotation" }));
    expect(targetOne.style.color).toBe("");
  });

  it("keeps touch selection exclusive across quotations", () => {
    const { container } = render(
      <>
        <Quote quote={l001aQ03OriginNumber} />
        <Quote quote={l001aQ02DaoOne} />
      </>,
    );
    const quotations = container.querySelectorAll("blockquote");
    const firstSource = quotations[0].children[0] as Element;
    const secondSource = quotations[1].children[0] as Element;
    const firstMapping = token(firstSource, 0);
    const secondMapping = token(secondSource, 1);

    fireEvent.touchStart(firstMapping);
    expect(firstMapping.style.color).toBe("var(--red)");

    fireEvent.touchStart(secondMapping);
    expect(firstMapping.style.color).toBe("");
    expect(secondMapping.style.color).toBe("var(--red)");
  });

  it("cancels hover work, resets warmth, and guards synthetic pointer events after touch", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const source = container.querySelector("blockquote")?.children[0] as Element;
    const mappingA = token(source, 1);
    const mappingB = token(source, 2);

    fireEvent.pointerEnter(mappingA);
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(token(source, 0));
    expect(vi.getTimerCount()).toBe(1);

    fireEvent.touchStart(mappingB);
    expect(mappingB.style.color).toBe("var(--red)");
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.touchStart(mappingB);
    fireEvent.pointerEnter(mappingB);
    act(() => vi.advanceTimersByTime(500));
    expect(mappingB.style.color).toBe("");
    expect(vi.getTimerCount()).toBe(0);

    act(() => vi.advanceTimersByTime(1));
    fireEvent.pointerEnter(mappingA);
    act(() => vi.advanceTimersByTime(300));
    expect(mappingA.style.color).toBe("");
    act(() => vi.advanceTimersByTime(200));
    expect(mappingA.style.color).toBe("var(--red)");
  });

  it("replaces and removes document touch coordination with the quotation lifecycle", () => {
    const addEventListener = vi.spyOn(document, "addEventListener");
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    const quoteRender = render(<Quote quote={l001aQ02DaoOne} />);
    const firstTouchListener = addEventListener.mock.calls.find(([type]) => type === "touchstart")?.[1];

    expect(firstTouchListener).toBeDefined();

    quoteRender.rerender(<Quote quote={{ ...l001aQ02DaoOne }} />);
    const touchListeners = addEventListener.mock.calls.filter(([type]) => type === "touchstart");
    const replacementTouchListener = touchListeners.at(-1)?.[1];

    expect(removeEventListener).toHaveBeenCalledWith("touchstart", firstTouchListener);
    expect(replacementTouchListener).not.toBe(firstTouchListener);

    quoteRender.unmount();
    expect(removeEventListener).toHaveBeenCalledWith("touchstart", replacementTouchListener);
  });

  it("changes only active text color and removes its presentation immediately on clear", () => {
    vi.useFakeTimers();

    const { container } = render(<Quote quote={l001aQ02DaoOne} />);
    const source = container.querySelector("blockquote")?.children[0] as Element;
    const activeToken = token(source, 1);
    const restingToken = token(source, 0);

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
