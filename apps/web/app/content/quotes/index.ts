import type { QuotationFile } from "../../quotation-file";
import { parseQuotationFile, quoteIdsByAssetName } from "../../quotation-file";

// Every committed quotation file, checked against the contract as the module
// loads: an invalid file stops the build before any page is pre-rendered.
const files = import.meta.glob<unknown>("./L*.json", { eager: true, import: "default" });
const valueByAssetName = new Map(
  Object.entries(files).map(([path, value]) => [path.replace(/^\.\//, "").replace(/\.json$/, ""), value]),
);
const { quoteIds, problems } = quoteIdsByAssetName(Array.from(valueByAssetName.keys()));
if (problems.length > 0) throw new Error(problems.join("\n"));

/** Every committed quotation by Quote ID. */
export const quotations: ReadonlyMap<string, QuotationFile> = new Map(
  Array.from(quoteIds, ([assetName, quoteId]) => [
    quoteId,
    parseQuotationFile(valueByAssetName.get(assetName), `${assetName}.json`),
  ]),
);

/** The quotation file for a Quote ID. Throws for an ID no file carries. */
export function quotationById(quoteId: string): QuotationFile {
  const quotation = quotations.get(quoteId);
  if (!quotation) {
    throw new Error(`Unknown Quote ID "${quoteId}": no file in app/content/quotes is named ${quoteId}-<slug>.json`);
  }
  return quotation;
}
