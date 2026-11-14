const perRow = 4;

/**
 * How many historical-form pictures go on each row: no more than four, as even
 * as possible, the upper rows taking the extra ones (5 is 3 and 2, 7 is 4 and 3,
 * 10 is 4, 3 and 3).
 */
export function rowSizes(count: number): number[] {
  if (count <= 0) return [];
  const rows = Math.ceil(count / perRow);
  const base = Math.floor(count / rows);
  const extra = count % rows;
  return Array.from({ length: rows }, (_, row) => base + (row < extra ? 1 : 0));
}
