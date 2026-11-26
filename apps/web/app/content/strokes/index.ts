/**
 * Stroke outlines for characters a lesson highlights stroke by stroke: one JSON
 * file per character, its strokes as SVG paths in stroke order, cut from the
 * font that shows the character (TW-Kai for `<CharacterFocus>`).
 */
export type StrokeData = {
  character: string;
  font: string;
  viewBox: string;
  notes?: string;
  /** SVG path data, one per stroke, in stroke order. */
  strokes: string[];
};

const files = import.meta.glob<StrokeData>("./*.json", { eager: true, import: "default" });

export const strokeData = new Map(Object.values(files).map((data) => [data.character, data]));

/** The stroke numbers (counted from 1, in stroke order) a `highlight` prop names, checked against the character's strokes. */
export function highlightedStrokes(character: string, highlight: string): { data: StrokeData; strokes: Set<number> } {
  const data = strokeData.get(character);
  if (!data) throw new Error(`No stroke data for ${character}: add app/content/strokes/${character}.json`);
  const strokes = new Set(highlight.split(/\s+/).filter(Boolean).map(Number));
  for (const stroke of strokes) {
    if (!Number.isInteger(stroke) || stroke < 1 || stroke > data.strokes.length) {
      throw new Error(`${character} has strokes 1–${data.strokes.length}; highlight="${highlight}" names ${stroke}`);
    }
  }
  if (!strokes.size) throw new Error(`highlight on ${character} names no strokes`);
  return { data, strokes };
}
