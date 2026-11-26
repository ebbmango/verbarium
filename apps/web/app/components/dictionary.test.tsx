import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as quoteRegistry from "../content/quotes";
import { DictionaryQuote, Sense } from "./dictionary";

const quotation = quoteRegistry.quotationById("L001A-Q03");

afterEach(() => vi.restoreAllMocks());

describe("dictionary source details", () => {
  it.each([false, true])("shows details under the title in a sense example: %s", (isExample) => {
    vi.spyOn(quoteRegistry, "quotationById").mockReturnValue({
      ...quotation,
      provenance: "Book of Songs",
      sourceDetails: "Part II, Book VI, Ode VI, line 5",
    });
    const quote = <DictionaryQuote id="L001A-Q03" />;
    const { container } = render(isExample ? <ol><Sense gloss="one">{quote}</Sense></ol> : quote);
    const source = container.querySelector(isExample ? ".dictionary-example-source" : ".dictionary-source-name");
    expect(source?.querySelector("a")).toHaveTextContent("Book of Songs");
    expect(source?.lastElementChild).toHaveClass("quote-source-details");
    expect(source?.lastElementChild).toHaveTextContent("Part II, Book VI, Ode VI, line 5");
    expect(container.querySelectorAll(".quote-source-details")).toHaveLength(1);
  });

  it.each([false, true])("adds no details markup when absent in a sense example: %s", (isExample) => {
    vi.spyOn(quoteRegistry, "quotationById").mockReturnValue({ ...quotation, sourceDetails: undefined });
    const quote = <DictionaryQuote id="L001A-Q02" />;
    const { container } = render(isExample ? <ol><Sense gloss="one">{quote}</Sense></ol> : quote);
    expect(container.querySelector(".quote-source-details")).toBeNull();
  });
});
