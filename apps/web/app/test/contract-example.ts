import { readFileSync } from "node:fs";
import { join } from "node:path";

const contract = readFileSync(join(import.meta.dirname, "../../../../docs/quotation-contract.md"), "utf8");

/** A loosely typed JSON value, so tests can bend it into invalid shapes. */
export type LooseJson = any;

/** The complete example in docs/quotation-contract.md, as written there. */
export function contractExampleText(): string {
  const start = contract.indexOf("```json\n") + "```json\n".length;
  const end = contract.indexOf("```", start);
  return contract.slice(start, end);
}

/** The complete example in docs/quotation-contract.md, parsed fresh each time. */
export function contractExample(): LooseJson {
  return JSON.parse(contractExampleText());
}
