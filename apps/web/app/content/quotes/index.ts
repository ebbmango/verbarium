import { parseQuotationFile, type QuotationFile, quoteIdFromAssetName } from "../../quotation-file";

// Every committed quotation file, checked against the contract as the module
// loads: an invalid file stops the build before any page is pre-rendered.
const files = import.meta.glob<unknown>("./L*.json", { eager: true, import: "default" });

const quotations = new Map<string, QuotationFile>();

for (const [path, value] of Object.entries(files)) {
  const assetName = path.replace(/^\.\//, "").replace(/\.json$/, "");
  const quoteId = quoteIdFromAssetName(assetName);
  if (quoteId === null) throw new Error(`${assetName}.json is not a Quote asset name (<Quote ID>-<slug>.json)`);
  if (quotations.has(quoteId)) throw new Error(`${assetName}.json repeats Quote ID ${quoteId}`);
  quotations.set(quoteId, parseQuotationFile(value, `${assetName}.json`));
}

/** The quotation file for a Quote ID. Throws for an ID no file carries. */
export function quotationById(quoteId: string): QuotationFile {
  const quotation = quotations.get(quoteId);
  if (!quotation) {
    throw new Error(`Unknown Quote ID "${quoteId}": no file in app/content/quotes is named ${quoteId}-<slug>.json`);
  }
  return quotation;
}

/** Every Quote ID a lesson may use, in Quote ID order. */
export function quoteIds(): string[] {
  return Array.from(quotations.keys()).sort((left, right) => left.localeCompare(right));
}
