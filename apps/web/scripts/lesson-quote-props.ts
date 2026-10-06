// Reads, from a lesson's MDX, what each `<Quote>` passes as props: the
// provenance, the source link, and which quotation module it imports. Used by
// the one-off conversion to JSON (#18) and the test that proves it exact.

export type LessonQuoteProps = {
  /** The Quote asset name the lesson imports the quotation from. */
  assetName: string;
  provenance: string;
  sourceLink?: string;
};

export function lessonQuoteProps(mdx: string): LessonQuoteProps[] {
  const assetNames = new Map<string, string>();
  for (const match of mdx.matchAll(/^import \{ (\w+) \} from "\.\.\/quotes\/([^"]+)";$/gm)) {
    assetNames.set(match[1], match[2]);
  }

  return Array.from(
    mdx.matchAll(/^<Quote provenance="([^"]*)" quote=\{(\w+)\}(?: sourceHref="([^"]*)")? \/>$/gm),
    ([, provenance, variable, sourceLink]) => {
      const assetName = assetNames.get(variable);
      if (!assetName) throw new Error(`No import for the quotation ${variable}`);
      return { assetName, provenance, ...(sourceLink === undefined ? {} : { sourceLink }) };
    },
  );
}
