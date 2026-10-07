import { useParams } from "react-router";

import { dictionaryComponents } from "~/components/dictionary";
import { HanMarkedText, PageHeading } from "~/components/lesson";
import { dictionaryPages, glossesOf } from "~/content/dictionary";

import type { Route } from "./+types/dictionary-page";

function pageFor(headword: string | undefined) {
  return dictionaryPages.find((page) => page.headword === headword);
}

export function meta({ params }: Route.MetaArgs) {
  const page = pageFor(params.headword);
  if (!page) return [{ title: "Dictionary page not found · Verbarium" }];
  return [{ title: `${page.headword} · Verbarium` }, { name: "description", content: glossesOf(page) }];
}

export default function DictionaryPage() {
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
        <PageHeading
          eyebrow="Dictionary"
          title={
            <span className="dictionary-headword" lang="zh-Hant">
              {page.headword}
            </span>
          }
          subtitle={<HanMarkedText text={glossesOf(page)} />}
        />
        <page.Content components={dictionaryComponents} />
      </article>
    </main>
  );
}
