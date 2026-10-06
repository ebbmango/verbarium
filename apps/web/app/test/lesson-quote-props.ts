// Reads, from a lesson's MDX, what each `<Quote>` passes as props: the
// provenance, the source link, and which quotation module it imports. Used by
// the one-off conversion to JSON (#18) and the test that proves it exact.

export type LessonQuoteProps = {
  /** The Quote asset name the lesson imports the quotation from. */
  assetName: string;
  provenance: string;
  sourceLink?: string;
};

/** The lesson's quotations by Quote asset name. */
export function lessonQuoteProps(mdx: string): Map<string, LessonQuoteProps> {
  const assetNames = new Map<string, string>();
  for (const match of mdx.matchAll(/^import \{ (\w+) \} from "\.\.\/quotes\/([^"]+)";$/gm)) {
    assetNames.set(match[1], match[2]);
  }

  const quotes = new Map<string, LessonQuoteProps>();
  for (const [, provenance, variable, sourceLink] of mdx.matchAll(
    /^<Quote provenance="([^"]*)" quote=\{(\w+)\}(?: sourceHref="([^"]*)")? \/>$/gm,
  )) {
    const assetName = assetNames.get(variable);
    if (!assetName) throw new Error(`No import for the quotation ${variable}`);
    quotes.set(assetName, { assetName, provenance, ...(sourceLink === undefined ? {} : { sourceLink }) });
  }
  return quotes;
}
