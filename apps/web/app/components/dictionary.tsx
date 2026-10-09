import { Children, isValidElement, type PropsWithChildren, type ReactElement, type ReactNode } from "react";

import { quotationById } from "../content/quotes";
import type { QuotationFile } from "../quotation-file";
import { HanMarkedText, lessonComponents } from "./lesson";
import { ProvenanceName, type QuoteProps, QuoteView } from "./quote";

/** The blocks MDX gives a component, without the line breaks it leaves between them. */
function blocksOf(children: ReactNode): ReactNode[] {
  return Children.toArray(children).filter((child) => typeof child !== "string" || child.trim() !== "");
}

function isElementOf(component: unknown) {
  return (child: ReactNode): child is ReactElement => isValidElement(child) && child.type === component;
}

/** The page's entries, under the Meaning tag: the build gathers them here (app/mdx/remark-dictionary-page.ts). */
export function Entries({ children }: PropsWithChildren) {
  return (
    <section className="dictionary-section">
      <h2 className="dictionary-label">Meaning:</h2>
      {children}
    </section>
  );
}

/** The page's writing outside its entries, under the Etymology tag, after a divider. */
export function Etymology({ children }: PropsWithChildren) {
  return (
    <>
      <hr className="dictionary-rule" />
      <section className="dictionary-section dictionary-etymology">
        <h2 className="dictionary-label">Etymology:</h2>
        {children}
      </section>
    </>
  );
}

/** One treatment of the headword: its readings when the build marks the page as having several entries, then its senses, numbered. */
export function Entry({ children, showReadings = false }: PropsWithChildren<{ showReadings?: boolean }>) {
  const blocks = blocksOf(children);
  const isReading = isElementOf(Reading);
  return (
    <section className="lexical-entry">
      {showReadings && <p className="dictionary-readings">{blocks.filter(isReading)}</p>}
      <ol className="dictionary-senses">{blocks.filter((block) => !isReading(block))}</ol>
    </section>
  );
}

/** One pronunciation, in pinyin; readings on one line are set apart by commas. */
export function Reading({ pinyin }: { pinyin: string }) {
  return <span className="dictionary-reading">{pinyin}</span>;
}

/** One sense of the entry: its gloss in the numbered list, folding its writing and its examples under a chevron. */
export function Sense({ children, gloss }: PropsWithChildren<{ gloss: string }>) {
  const blocks = blocksOf(children);
  const isExample = isElementOf(DictionaryQuote);
  const examples = blocks.filter(isExample);

  return (
    <li className="dictionary-sense">
      {blocks.length === 0 ? (
        <span className="dictionary-gloss">
          <HanMarkedText text={gloss} />
        </span>
      ) : (
        <details open>
          <summary className="dictionary-gloss">
            <HanMarkedText text={gloss} />
          </summary>
          {blocks.filter((block) => !isExample(block))}
          {examples.length > 0 && (
            <ol className="dictionary-examples">
              {examples.map((example, index) => (
                <QuotedExample id={(example.props as QuoteProps).id} key={index} />
              ))}
            </ol>
          )}
        </details>
      )}
    </li>
  );
}

/** The Chinese of a quotation on one line: where Quote Slicer breaks it without punctuation, an ideographic space. */
function attestationLine({ alignment, attestation }: QuotationFile): string {
  const breaks = new Set(alignment.breaks.attestation);
  return attestation.tokens
    .map((token, index) => {
      const previous = attestation.tokens[index - 1];
      return (breaks.has(index) && previous && previous.type !== "punctuation" ? "　" : "") + token.text;
    })
    .join("");
}

/** A quotation as one of a sense's examples, plainly: its Chinese, then a quieter line with its translation and its source. */
function QuotedExample({ id }: { id: string }) {
  const quotation = quotationById(id);
  return (
    <li className="dictionary-example">
      <span lang="zh-Hant">{attestationLine(quotation)}</span>
      <span className="dictionary-example-translation">
        <i>
          <HanMarkedText text={quotation.translation.tokens.map((token) => token.text).join("")} />
        </i>{" "}
        <cite className="dictionary-example-source">
          <ProvenanceName provenance={quotation.provenance} sourceLink={quotation.sourceLink} />
        </cite>
      </span>
    </li>
  );
}

/**
 * `<Quote id="…" />` on a dictionary page. Inside a `<Sense>` it is one of the
 * sense's examples; outside the entries, it is a passage of the etymology,
 * under its source's name.
 */
export function DictionaryQuote({ id }: QuoteProps) {
  const quotation = quotationById(id);
  return (
    <div className="dictionary-source">
      <p className="dictionary-source-name">
        <ProvenanceName provenance={quotation.provenance} sourceLink={quotation.sourceLink} />:
      </p>
      <QuoteView quote={quotation} />
    </div>
  );
}

/** What a dictionary page is written with: markdown as in lessons, quotations, and its own components. */
export const dictionaryComponents = {
  hr: lessonComponents.hr,
  p: lessonComponents.p,
  Quote: DictionaryQuote,
  Entries,
  Entry,
  Etymology,
  Reading,
  Sense,
};
