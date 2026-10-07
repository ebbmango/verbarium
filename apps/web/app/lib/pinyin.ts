/** The four tone marks, as combining characters, in tone order: macron, acute, caron, grave. */
const toneMarks = "\u0304\u0301\u030c\u0300";
export const toneMark = new RegExp(`[${toneMarks}]`, "g");

/** Pinyin without its tone marks, ü kept: `xuè` is `xue`, `lǜ` is `lü`. */
export function withoutTones(pinyin: string): string {
  return pinyin.normalize("NFD").replace(toneMark, "").normalize("NFC");
}

/** The tone of a reading, 1 to 4, or 5 for the neutral tone. */
export function toneOf(pinyin: string): number {
  const mark = pinyin.normalize("NFD").match(toneMark)?.[0];
  return mark ? toneMarks.indexOf(mark) + 1 : 5;
}
