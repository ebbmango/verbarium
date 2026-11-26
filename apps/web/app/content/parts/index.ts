/**
 * Outlines of characters a lesson breaks into parts: one JSON file per
 * character, its shapes grouped under each part's name (a character, as a
 * `<FocusItem>` shows it), cut from the font that shows the character (TW-Kai
 * for `<CharacterFocus>`).
 */
export type PartData = {
  character: string;
  font: string;
  viewBox: string;
  notes?: string;
  /** SVG path data for each part's shapes, keyed by the part's name. */
  parts: Record<string, string[]>;
};

const files = import.meta.glob<PartData>("./*.json", { eager: true, import: "default" });

export const partData = new Map(Object.values(files).map((data) => [data.character, data]));

/** A character's parts, or an error naming the file to add. */
export function characterParts(character: string): PartData {
  const data = partData.get(character);
  if (!data) throw new Error(`No part outlines for ${character}: add app/content/parts/${character}.json`);
  return data;
}
