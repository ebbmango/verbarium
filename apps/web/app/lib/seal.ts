/**
 * Draws a seal as SVG markup: a red stone whose edge is pushed in and out by
 * seeded noise, its mark cut out, printed in seal paste through an SVG filter
 * that spreads the ink, frays the edge along paper fibres, breaks the red
 * with fine fibres and lets the paste pool. Each seal's name seeds every
 * part, so a seal is the same at every bake. Lesson seals and markers are
 * also stamped a little off true; the logo stands still.
 *
 * The site does not draw this live: `scripts/bake-seals.ts` renders it with
 * headless Chrome into `public/seals/*.png`, so every browser shows the same
 * print. Everything is drawn in a 100-unit box with a margin of half the box
 * on every side, for the edge and the wobble.
 */

/** 課 (HanWang WCL-02) and 文 (Ma Shan Zheng), traced into the box. */
export const KE =
  "M74.5 16.6Q75.2 16.0 76.2 16.6Q78.7 17.9 80.6 19.7Q82.0 20.8 82.0 21.8Q82.0 22.6 81.3 23.3Q80.6 24.0 80.0 24.8L80.0 36.7L80.2 44.6Q80.5 45.8 78.9 46.6Q78.6 46.7 78.6 46.9Q78.5 47.2 79.4 47.8Q83.1 51.2 84.7 53.5Q85.4 54.6 84.4 55.3Q84.2 55.4 82.8 55.4L70.4 55.4Q69.9 55.4 69.7 55.6Q69.5 56.0 69.9 56.9Q71.5 59.8 74.6 62.6Q78.6 66.0 82.7 67.2Q84.4 67.7 84.2 68.5Q84.0 69.5 83.5 69.6Q82.4 69.8 81.8 71.0Q80.9 72.9 80.2 76.8Q79.8 78.9 77.9 78.5Q75.5 77.8 73.9 75.3Q72.2 73.0 70.5 69.4Q67.9 63.8 66.9 56.6Q66.8 55.4 66.5 55.4Q66.4 55.5 66.4 56.6L66.4 73.1L66.5 81.3Q66.9 82.4 65.8 83.4Q64.8 84.0 62.5 84.4Q59.4 84.8 57.8 84.2Q57.2 84.2 56.9 83.3Q56.8 79.9 56.9 75.5L56.9 67.3Q56.9 66.8 56.8 66.7Q56.5 66.6 55.7 67.6Q52.6 71.2 49.2 73.4Q46.1 75.5 42.4 77.0Q41.3 77.5 41.3 78.7Q41.9 80.7 39.9 81.8Q37.0 82.9 33.0 82.4Q31.6 81.9 31.6 80.6L31.6 79.5Q31.6 78.3 30.5 78.3L29.1 78.3Q27.9 78.3 27.9 79.5L27.9 80.5Q27.9 82.0 27.6 82.7Q26.8 83.8 23.9 84.1Q21.4 84.3 19.9 84.0Q18.0 83.6 18.4 81.7Q18.4 77.7 18.6 73.5L18.6 65.4Q18.6 61.6 18.1 58.4Q18.0 57.8 18.3 57.5Q18.6 57.2 19.5 57.4Q24.4 58.8 27.9 60.2L30.1 60.3Q31.2 60.3 32.7 58.9Q33.4 58.3 34.1 57.7Q35.6 56.2 37.1 57.1Q40.4 58.9 42.2 60.4Q43.5 61.3 43.2 62.5Q43.1 63.1 42.3 63.5Q41.0 64.6 41.0 65.7L41.0 72.5Q41.1 72.8 41.1 73.2Q41.1 73.8 41.3 73.9Q41.6 74.0 42.2 73.3Q49.6 65.3 52.4 56.6Q52.6 56.0 52.3 55.7Q52.1 55.4 51.5 55.4Q46.1 55.4 42.4 55.8Q41.0 56.0 40.2 54.5Q39.9 53.9 39.6 53.4Q39.0 52.1 37.9 52.1L26.7 52.1Q23.6 52.1 20.7 52.4Q19.3 52.6 18.5 51.0L18.2 50.4Q17.8 49.6 18.0 49.3Q18.3 49.0 19.1 49.1Q22.0 49.5 25.1 49.6L28.9 49.6Q30.1 49.6 31.2 48.1Q32.8 46.0 34.3 44.5Q34.9 43.7 35.7 44.2Q38.4 46.0 41.8 49.8Q43.0 50.9 42.2 51.8Q42.0 52.1 40.8 52.1Q40.2 52.1 40.2 52.2Q40.2 52.2 41.0 52.3Q44.5 52.7 48.6 52.9L55.7 52.9Q56.9 52.9 56.9 51.7L56.9 46.8Q56.9 45.6 55.7 45.6L54.0 45.6Q52.9 45.6 52.9 46.4Q53.1 48.1 50.9 48.7Q48.9 49.3 45.6 49.2Q43.5 49.0 43.4 47.3Q43.8 36.9 43.8 33.2Q43.8 32.1 43.6 32.1Q43.6 32.1 43.5 32.1Q43.4 32.2 41.9 32.2L23.2 32.2Q20.5 32.4 17.7 32.6Q16.2 32.8 15.6 31.4L15.3 30.7Q14.8 29.7 15.1 29.3Q15.3 29.1 15.9 29.1Q20.0 29.6 23.6 29.8L30.4 29.8Q31.6 29.8 32.7 28.3Q34.6 25.6 36.2 24.0Q37.5 23.1 39.7 25.7Q41.6 27.5 42.9 29.2Q43.4 29.9 43.6 29.9Q43.8 29.8 43.8 29.2L43.8 25.0Q43.6 20.9 43.2 18.0Q43.2 17.3 43.5 17.0Q43.8 16.7 44.6 16.9Q48.9 18.2 53.3 19.7L69.3 19.7Q70.5 19.7 71.9 18.5Q73.2 17.4 74.5 16.6ZM20.3 16.2Q20.8 15.4 22.2 15.4Q26.8 15.7 30.7 18.0Q34.1 20.2 33.9 23.5Q34.1 27.2 30.8 28.8Q27.8 29.7 25.6 28.4Q24.5 27.4 24.2 26.2Q23.9 24.9 23.6 23.3Q23.3 20.5 21.5 18.1Q20.0 16.9 20.3 16.2ZM33.8 35.2Q34.3 34.2 35.0 34.1Q35.9 33.9 36.9 34.9Q41.3 38.6 42.6 40.8Q42.7 41.2 42.1 41.7Q41.8 41.9 40.4 42.0L28.5 42.0Q24.2 42.1 20.6 42.4Q19.2 42.6 18.5 41.0L18.2 40.3Q17.9 39.6 18.1 39.2Q18.3 38.9 19.1 39.0Q24.4 39.6 29.1 39.5Q30.3 39.5 31.3 38.1Q32.5 36.7 33.8 35.2ZM67.6 45.6Q66.5 45.6 66.5 46.8L66.5 51.6Q66.5 52.9 67.7 52.9L70.5 52.9Q71.7 52.9 72.8 51.4Q74.0 49.9 75.1 48.4Q75.7 47.8 75.6 47.5Q75.5 47.3 74.8 47.3Q72.9 47.5 71.3 46.6Q71.2 46.5 71.0 46.1Q70.8 45.6 69.8 45.6ZM29.1 62.8Q28.0 62.8 28.0 64.0L28.0 74.7Q28.0 75.9 29.2 75.9L30.5 75.9Q31.7 75.9 31.7 74.8L31.7 64.0Q31.7 62.8 30.6 62.8ZM67.6 33.3Q66.5 33.3 66.5 34.5L66.5 41.9Q66.5 43.0 67.7 43.0L69.7 43.0Q70.9 43.0 70.9 41.9L70.9 34.5Q70.9 33.3 69.7 33.3ZM54.0 33.3Q52.9 33.3 52.9 34.5L52.9 41.9Q52.9 43.0 54.0 43.0L55.8 43.0Q57.0 43.0 57.0 41.9L57.0 34.5Q57.0 33.3 55.8 33.3ZM67.7 22.2Q66.5 22.2 66.5 23.4L66.5 29.4Q66.5 30.7 67.7 30.7L69.7 30.7Q70.9 30.7 70.9 29.5L70.9 23.4Q70.9 22.2 69.7 22.2ZM54.0 22.2Q52.9 22.2 52.9 23.4L52.9 29.4Q52.9 30.7 54.0 30.7L55.8 30.7Q57.0 30.7 57.0 29.5L57.0 23.4Q57.0 22.2 55.8 22.2Z";
export const WEN =
  "M43.5 51.8Q44.0 51.5 44.2 50.8Q44.4 50.0 45.3 48.0Q46.2 46.0 46.2 45.5Q46.2 45.0 46.7 43.9Q47.2 42.8 47.2 41.7Q47.2 40.7 47.8 39.4Q48.4 38.1 48.9 38.1Q49.9 38.1 52.0 41.0Q54.0 43.8 54.0 45.2Q54.0 45.7 52.3 49.2Q50.6 52.8 49.6 54.0Q48.9 55.3 48.4 56.5Q48.0 57.3 48.1 57.6Q48.2 57.9 48.9 58.7Q49.9 59.7 50.9 60.1Q51.9 60.6 53.4 61.9Q54.8 63.0 58.5 64.7Q62.2 66.5 65.1 67.4Q68.0 68.3 70.8 69.7Q73.6 71.0 74.0 71.0Q74.5 71.0 75.8 71.7Q77.0 72.3 78.0 72.3Q79.7 72.4 81.4 73.7Q83.1 75.0 83.0 76.2Q82.9 76.8 82.7 76.9Q82.5 77.0 81.8 76.9Q80.7 76.8 80.4 77.2Q80.0 77.5 78.6 77.8Q77.2 78.2 75.4 80.0Q73.8 81.6 73.0 82.0Q72.1 82.4 70.9 82.1Q69.6 81.8 66.9 80.5Q64.2 79.3 63.3 78.6Q60.6 76.5 55.9 73.3Q50.4 69.7 45.9 65.6Q44.6 64.3 44.3 64.3Q43.9 64.2 43.3 64.8Q42.8 65.3 42.1 65.9L39.0 68.5Q37.1 70.1 33.9 72.2Q30.7 74.3 28.7 75.3Q26.9 76.2 25.6 77.2Q22.9 79.0 19.6 79.2Q18.1 79.2 17.5 79.0Q17.0 78.9 17.0 78.1Q17.0 77.5 18.4 76.8Q19.7 76.2 19.9 75.9Q20.1 75.6 23.7 73.5Q29.0 70.4 33.3 66.0Q35.3 63.9 37.5 61.2Q39.7 58.6 39.7 58.3Q39.7 58.1 39.1 57.5Q37.8 56.0 36.1 52.6Q34.0 48.4 33.6 47.0Q33.1 45.7 33.6 45.0Q34.0 44.4 34.6 44.4Q35.3 44.4 38.0 46.6Q38.4 46.9 40.3 49.0Q42.4 51.5 42.8 51.8Q43.0 52.0 43.2 52.0Q43.4 52.0 43.5 51.8ZM37.5 21.1Q36.9 19.8 37.1 19.5Q37.3 19.1 37.8 18.4Q38.3 17.6 39.4 17.8Q40.6 18.1 41.7 18.9Q42.8 19.6 43.3 19.6Q43.7 19.6 45.8 20.3Q47.2 20.8 47.6 21.1Q47.9 21.3 48.2 22.0Q48.4 23.0 48.3 24.5Q48.2 25.9 48.2 27.5Q48.2 29.1 47.3 30.8Q46.3 32.5 46.5 32.8Q47.0 32.9 51.5 32.6Q56.0 32.2 57.8 31.9Q62.5 30.9 65.8 31.2Q69.1 31.4 70.2 32.6Q70.9 33.6 70.6 35.4Q70.3 37.2 69.1 38.1Q68.0 39.0 66.2 38.0Q65.3 37.5 63.2 36.9Q61.1 36.2 55.4 36.2Q50.0 36.2 46.9 36.6Q43.7 37.0 40.0 38.1Q38.0 38.8 36.7 39.0Q33.5 39.4 31.0 40.3Q28.4 41.1 27.8 41.9Q26.5 43.4 23.7 41.9Q22.6 41.2 22.0 40.2Q21.3 39.2 21.8 38.8Q22.0 38.5 23.9 37.9Q25.9 37.2 26.5 37.2Q27.1 37.2 27.6 36.9Q28.1 36.6 32.3 35.6Q36.4 34.5 39.0 34.0Q41.5 33.6 41.7 33.5Q41.8 33.4 41.1 32.0Q40.5 30.7 39.8 28.6Q39.1 26.6 39.1 25.9Q39.1 24.6 37.5 21.1Z";

export const BOX = 100;
const CENTRE = BOX / 2;
/** The margin around the box in the baked image, as a share of the box. */
export const MARGIN = 0.25;
const CORNER = 5;
const POINTS = 140;
/** How deep the edge's slow waver goes, and how many bends it has. */
const WAVER = 1.5;
const BENDS = 6;
/** How far off true a stamp may land: degrees of tilt, shift in box units, and a share of its size. */
const WOBBLE = { tilt: 3, shift: 3, scale: 0.03 };

/**
 * How much of the red the paper breaks, and how much the paste pools: the two
 * prints Emanuel shortlisted on 2026-11-03 from mockups against real seals.
 * `pooled` is baked; `solid` is kept to try later (it takes the site's red).
 */
export const INKS = {
  pooled: { red: "#d9383c", fibres: [0.55, 0.7], pools: [0.25, 0.82] },
  solid: { red: "#e55154", fibres: [0.4, 0.8], pools: [0.15, 0.9] },
};
export const INK = INKS.pooled;

/** Seeded random numbers (mulberry32): the same sequence for the same seed. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seal's name as a seed (FNV-1a over its code points). */
export function hash(name: string): number {
  let h = 2166136261;
  for (const character of name) {
    h ^= character.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Smooth noise around a loop: `n` random values blended between, meeting at 0 and 1. */
function loopNoise(next: () => number, n: number): (t: number) => number {
  const values = Array.from({ length: n }, () => next() * 2 - 1);
  return (t) => {
    const x = (((t % 1) + 1) % 1) * n;
    const i = Math.floor(x);
    const f = x - i;
    const blend = f * f * (3 - 2 * f);
    return values[i % n] * (1 - blend) + values[(i + 1) % n] * blend;
  };
}

/** The stone's outline for a seal's name: a smooth path around the box with a long, gentle waver. */
export function stone(name: string): string {
  const waver = loopNoise(seededRandom(hash(`stone:${name}`)), BENDS);
  const side = BOX - 2 * CORNER;
  const arc = (Math.PI * CORNER) / 2;
  // Clockwise from the top edge: each side from its start, then the arc around its corner.
  const starts = [[CORNER, 0], [BOX, CORNER], [BOX - CORNER, BOX], [0, BOX - CORNER]];
  const along = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const outward = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const corners = [[BOX - CORNER, CORNER], [BOX - CORNER, BOX - CORNER], [CORNER, BOX - CORNER], [CORNER, CORNER]];
  const points: number[][] = [];

  for (let k = 0; k < POINTS; k++) {
    const t = k / POINTS;
    const i = Math.floor(t * 4);
    const d = (t * 4 - i) * (side + arc);
    const angle = ((i - 1) * Math.PI) / 2 + (d - side) / CORNER;
    const [nx, ny] = d < side ? outward[i] : [Math.cos(angle), Math.sin(angle)];
    const [x, y] =
      d < side
        ? [starts[i][0] + along[i][0] * d, starts[i][1] + along[i][1] * d]
        : [corners[i][0] + CORNER * nx, corners[i][1] + CORNER * ny];
    const offset = waver(t) * WAVER;
    points.push([x + nx * offset, y + ny * offset]);
  }

  // A curve through the midpoints, so no point leaves a corner.
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const at = (p: number[]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const start = mid(points[POINTS - 1], points[0]);
  const curves = points.map((p, i) => `Q${at(p)} ${at(mid(p, points[(i + 1) % POINTS]))}`);
  return `M${at(start)}${curves.join("")}Z`;
}

/** How a seal's stamp landed: its tilt in degrees, its shift in box units, and its scale. */
export type Placement = { tilt: number; dx: number; dy: number; scale: number };

export function placement(name: string): Placement {
  const next = seededRandom(hash(`place:${name}`));
  // Three draws summed: between -1 and 1, mostly near 0, rarely at the edge.
  const bell = () => (next() + next() + next()) / 1.5 - 1;
  return { tilt: bell() * WOBBLE.tilt, dx: bell() * WOBBLE.shift, dy: bell() * WOBBLE.shift, scale: 1 + bell() * WOBBLE.scale };
}

/** The ink filter for one seal, seeded by its name. */
function ink(id: string, seed: number): string {
  const alpha = ([slope, intercept]: number[]) =>
    `type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${slope} 0 0 0 ${intercept}"`;
  const m = BOX * MARGIN;
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="${-m}" y="${-m}" width="${BOX + 2 * m}" height="${BOX + 2 * m}" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceGraphic" stdDeviation="0.7" result="spread"/>
<feComponentTransfer in="spread" result="settled"><feFuncA type="linear" slope="4" intercept="-1.3"/></feComponentTransfer>
<feTurbulence type="turbulence" baseFrequency="0.9 0.25" numOctaves="2" seed="${seed % 1000}" result="frayNoise"/>
<feDisplacementMap in="settled" in2="frayNoise" scale="1" xChannelSelector="R" yChannelSelector="G" result="frayed"/>
<feTurbulence type="turbulence" baseFrequency="0.035 0.9" numOctaves="3" seed="${(seed + 11) % 1000}" result="warp"/>
<feTurbulence type="turbulence" baseFrequency="0.9 0.035" numOctaves="3" seed="${(seed + 17) % 1000}" result="weft"/>
<feBlend in="warp" in2="weft" mode="multiply" result="fibres"/>
<feColorMatrix in="fibres" ${alpha(INK.fibres)} result="fibreAlpha"/>
<feComposite in="frayed" in2="fibreAlpha" operator="in" result="broken"/>
<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="${(seed + 23) % 1000}" result="poolNoise"/>
<feColorMatrix in="poolNoise" ${alpha(INK.pools)} result="poolAlpha"/>
<feComposite in="broken" in2="poolAlpha" operator="in" result="pooled"/>
<feGaussianBlur in="pooled" stdDeviation="0.15"/>
</filter>`;
}

/** What is cut out of the stone: a traced glyph, or a letter in the serif. */
export type Mark = { path: string } | { letter: string };

/** The whole seal as SVG markup, `size` pixels for the box, its margin around it. */
export function sealSvg(mark: Mark, name: string, size: number, still = false): string {
  const seed = hash(name);
  const { tilt, dx, dy, scale } = placement(name);
  const stamp = still
    ? ""
    : ` transform="translate(${(CENTRE + dx).toFixed(1)} ${(CENTRE + dy).toFixed(1)}) rotate(${tilt.toFixed(1)}) scale(${scale.toFixed(3)}) translate(${-CENTRE} ${-CENTRE})"`;
  const cut =
    "path" in mark
      ? `<path d="${mark.path}" fill="#000"/>`
      : `<text x="${CENTRE}" y="${CENTRE}" text-anchor="middle" dominant-baseline="central" fill="#000" font-family="Source Serif 4" font-weight="600" font-size="66">${mark.letter}</text>`;
  const m = BOX * MARGIN;
  const outer = size * (1 + 2 * MARGIN);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outer}" height="${outer}" viewBox="${-m} ${-m} ${BOX + 2 * m} ${BOX + 2 * m}">
<defs>${ink("ink", seed)}<mask id="cut" maskUnits="userSpaceOnUse" x="${-m}" y="${-m}" width="${BOX + 2 * m}" height="${BOX + 2 * m}"><path d="${stone(name)}" fill="#fff"/>${cut}</mask></defs>
<g filter="url(#ink)"><g${stamp}><rect x="${-m}" y="${-m}" width="${BOX + 2 * m}" height="${BOX + 2 * m}" fill="${INK.red}" mask="url(#cut)"/></g></g>
</svg>`;
}

/** The seals the site bakes, by the file each is saved as. */
export const SEALS = {
  logo: { mark: { path: WEN } as Mark, name: "logo", size: 32, still: true },
  lesson: (number: number) => ({ mark: { path: KE } as Mark, name: `lesson${number}`, size: 58, still: false }),
  letter: (letter: string, character: string) => ({
    mark: { letter } as Mark,
    name: `${letter}:${character}`,
    size: 34,
    still: false,
  }),
};

/** The baked image's path under public/, from the seal's name. */
export function sealFile(name: string): string {
  return `seals/${name.replace(":", "-")}.png`;
}

/** Every seal a lesson calls for: its own, and one per displayed character. */
export function sealsOfLesson(number: number, source: string) {
  const markers = Array.from(source.matchAll(/<CharDisplay character="([^"]+)" label="([^"]+)"/g), ([, character, label]) =>
    SEALS.letter(label, character.normalize("NFKC")),
  );
  return [SEALS.lesson(number), ...markers];
}
