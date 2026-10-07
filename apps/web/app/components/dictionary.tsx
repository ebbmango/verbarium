import type { PropsWithChildren } from "react";

import { HanMarkedText, lessonComponents, Quote } from "./lesson";

/** One treatment of the headword: its readings, then its senses. */
export function Entry({ children }: PropsWithChildren) {
  return <section className="lexical-entry">{children}</section>;
}

/** One pronunciation of the entry, in pinyin; an entry's readings share a line. */
export function Reading({ pinyin }: { pinyin: string }) {
  return <span className="dictionary-reading">{pinyin}</span>;
}

/** One sense of the entry: its gloss, then the writing and quotations that explain it. */
export function Sense({ children, gloss }: PropsWithChildren<{ gloss: string }>) {
  return (
    <section className="dictionary-sense">
      <h2 className="dictionary-gloss">
        <HanMarkedText text={gloss} />
      </h2>
      {children}
    </section>
  );
}

/** What a dictionary page is written with: markdown as in lessons, quotations, and its own components. */
export const dictionaryComponents = { hr: lessonComponents.hr, p: lessonComponents.p, Quote, Entry, Reading, Sense };
