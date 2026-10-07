import { useParams } from "react-router";

import { dictionaryComponents } from "~/components/dictionary";
import { HanMarkedText, PageHeading } from "~/components/lesson";
import { type DictionaryPage, dictionaryPages } from "~/content/dictionary";

import type { Route } from "./+types/dictionary-page";

function pageFor(headword: string | undefined) {
  return dictionaryPages.find((page) => page.headword === headword);
}

/** The page's glosses in order: its line on the page and its description. */
function glossesOf(page: DictionaryPage) {
  return page.entries.flatMap((entry) => entry.senses.map((sense) => sense.gloss)).join("; ");
}

export function meta({ params }: Route.MetaArgs) {
  const page = pageFor(params.headword);
  if (!page) return [{ title: "Dictionary page not found · Verbarium" }];
  return [{ title: `${page.headword} · Verbarium` }, { name: "description", content: glossesOf(page) }];
}

export default function DictionaryPageRoute() {
  const { headword } = useParams();
  const page = pageFor(headword);

  // Addresses that were not pre-rendered reach here through the 404 fallback,
  // so the page already answers 404; this says why.
  if (!page) {
    return (
      <main className="lesson-shell">
        <section className="lesson landing">
          <PageHeading
            eyebrow="Dictionary"
            title="404"
            subtitle={<HanMarkedText text={`There is no dictionary page for ${headword}.`} />}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="lesson-shell">
      <article className="lesson lesson-manuscript">
        <header className="lesson-heading">
          <p className="eyebrow">Dictionary</p>
          <h1 className="dictionary-headword" lang="zh-Hant">
            {page.headword}
          </h1>
          <p className="lesson-subtitle">{glossesOf(page)}</p>
        </header>
        <page.Content components={dictionaryComponents} />
      </article>
    </main>
  );
}
