import { type RefObject, useEffect } from "react";

/** The canvas font shorthand for an element's computed style. */
function canvasFont(style: CSSStyleDeclaration, fontSize = style.fontSize) {
  return `${style.fontStyle} ${style.fontWeight} ${fontSize} ${style.fontFamily}`;
}

/**
 * How far, in em, to move text sideways so its ink sits in the middle of its
 * advance box. Fonts place some glyphs off centre on purpose: a radical form
 * such as 礻 or 衤 is drawn in the left of its box, where it sits in a compound.
 * `null` when the text cannot be measured.
 */
export function inkOffsetEm(text: string, font: string, fontSizePx: number): number | null {
  const context = document.createElement("canvas").getContext("2d");
  if (!context || !text || !fontSizePx) return null;
  context.font = font;
  const metrics = context.measureText(text);
  // Ink spans [-actualBoundingBoxLeft, actualBoundingBoxRight] around the pen start.
  const inkCentre = (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2;
  return (metrics.width / 2 - inkCentre) / fontSizePx;
}

/**
 * Where, in em from the middle of its advance box, a glyph's spine runs: the
 * column holding its longest unbroken vertical run of ink, such as the
 * upright stroke of 礻 or 衤. Where several columns tie (the stroke's width),
 * the middle of them. `null` when the text cannot be drawn, or has no single
 * spine: another upright, apart from the tallest, at least 60% as tall (the two of
 * 艸, or of the two 示 in 祘).
 */
export function inkSpineEm(text: string, style: CSSStyleDeclaration): number | null {
  const size = 200;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size * 2;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context || !text) return null;
  context.font = canvasFont(style, `${size}px`);
  context.textBaseline = "middle";
  const origin = size / 2;
  context.fillText(text, origin, size);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const runs = Array.from({ length: canvas.width }, (_, x) => {
    let longest = 0;
    let run = 0;
    for (let y = 0; y < canvas.height; y += 1) {
      run = data[(y * canvas.width + x) * 4 + 3] > 127 ? run + 1 : 0;
      longest = Math.max(longest, run);
    }
    return longest;
  });
  const tallest = Math.max(...runs);
  if (!tallest) return null;
  // Columns at least 60% as tall as the tallest, in unbroken bands: one stroke
  // tapers off at its edges within its band, a second upright makes a second
  // band. (艸's side uprights are 74% of its middle one; 礻 and 衤 have one band
  // even at 50%.)
  const bands = runs.filter((run, x) => run >= tallest * 0.6 && !(runs[x - 1] >= tallest * 0.6)).length;
  if (bands > 1) return null;
  let left = runs.indexOf(tallest);
  let right = left;
  while (left > 0 && runs[left - 1] >= tallest * 0.9) left -= 1;
  while (right < runs.length - 1 && runs[right + 1] >= tallest * 0.9) right += 1;
  const spine = (left + right + 1) / 2;
  return (spine - origin - context.measureText(text).width / 2) / size;
}

/**
 * Centres the ink of the element's text horizontally, once its fonts have
 * loaded. The shift is in em, so it holds when the font size changes. Given a
 * `spineRef`, also sets `--ink-spine` on that element (a caption under the
 * text): where the text's spine (see `inkSpineEm`) runs, in the text's em,
 * from the middle of its box. Its CSS turns that into a shift.
 */
export function useInkCentring(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
  spineRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const element = ref.current;
    // No font loading to wait for (as in jsdom): nothing measurable either.
    if (!enabled || !element || !("fonts" in document)) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const style = getComputedStyle(element);
      const text = element.textContent ?? "";
      const fontSize = parseFloat(style.fontSize);
      const offset = inkOffsetEm(text, canvasFont(style), fontSize);
      if (offset === null) return;
      element.style.translate = `${offset.toFixed(4)}em 0`;
      const follower = spineRef?.current;
      const spine = follower ? inkSpineEm(text, style) : null;
      if (follower && spine !== null) {
        follower.style.setProperty("--ink-spine", (offset + spine).toFixed(4));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ref, enabled, spineRef]);
}
