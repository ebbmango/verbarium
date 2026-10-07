/** Han characters with the CJK punctuation blocks; a run must contain Han. */
const hanRun = /[\p{Script=Han}　-〿＀-￯]+/gu;
const han = /\p{Script=Han}/u;

export type TextRun = { text: string; chinese: boolean };

/**
 * Splits text into runs of Chinese and runs of everything else, in order.
 * Chinese punctuation touching a Chinese run stays inside it, so a screen
 * reader does not switch voice mid-phrase. Shared by the build-time marking
 * of lesson prose and by components that receive Chinese in a prop.
 */
export function splitHanRuns(value: string): TextRun[] {
  const runs: TextRun[] = [];
  let consumed = 0;

  for (const run of value.matchAll(hanRun)) {
    if (!han.test(run[0])) continue;
    if (run.index > consumed) runs.push({ text: value.slice(consumed, run.index), chinese: false });
    runs.push({ text: run[0], chinese: true });
    consumed = run.index + run[0].length;
  }

  if (consumed < value.length) runs.push({ text: value.slice(consumed), chinese: false });
  return runs;
}
