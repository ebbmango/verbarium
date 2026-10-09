import { Link, useParams } from "react-router";

import { dictionaryComponents, Reading } from "~/components/dictionary";
import { HanMarkedText, PageHeading } from "~/components/lesson";
import { dictionaryPages, glossesOf } from "~/content/dictionary";
import { dictionaryIndexPath } from "~/content/dictionary/dictionary-files";
import { lessonPath, lessons } from "~/content/lessons";

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

  const readings = new Set(page.entries.flatMap((entry) => entry.readings));
  const displayedIn = lessons.filter((lesson) => lesson.displayedCharacters.includes(page.headword));

  return (
    <main className="lesson-shell">
      <article className="dictionary-page">
        <header className="dictionary-header">
          <h1 className="dictionary-headword" lang="zh-Hant">
            {page.headword}
          </h1>
          <p className="dictionary-readings">
            {Array.from(readings, (reading) => (
              <Reading key={reading} pinyin={reading} />
            ))}
          </p>
        </header>
        <page.Content components={dictionaryComponents} />
        <hr className="dictionary-rule" />
        <nav className="dictionary-tags" aria-label="Related pages">
          {displayedIn.map((lesson) => (
            <Link key={lesson.number} to={lessonPath(lesson.number)}>
              Lesson {lesson.number}
            </Link>
          ))}
          <Link to={dictionaryIndexPath}>Dictionary</Link>
        </nav>
      </article>
    </main>
  );
}
