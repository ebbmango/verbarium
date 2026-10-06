import { useParams } from "react-router";

import { lessonComponents, PageHeading } from "~/components/lesson";
import { lessonByNumber } from "~/content/lessons";

import type { Route } from "./+types/lesson";

function lessonFor(param: string | undefined) {
  return /^\d+$/.test(param ?? "") ? lessonByNumber(Number(param)) : undefined;
}

export function meta({ params }: Route.MetaArgs) {
  const lesson = lessonFor(params.number);
  if (!lesson) return [{ title: "Lesson not found · Verbarium" }];
  return [{ title: `Lesson ${lesson.number} · Verbarium` }, { name: "description", content: lesson.description }];
}

export default function LessonPage() {
  const { number } = useParams();
  const lesson = lessonFor(number);

  // Addresses that were not pre-rendered reach here through the 404 fallback,
  // so the page already answers 404; this says why.
  if (!lesson) {
    return (
      <main className="lesson-shell">
        <section className="lesson landing">
          <PageHeading eyebrow="Etymological lessons" title="404">
            There is no Lesson {number}.
          </PageHeading>
        </section>
      </main>
    );
  }

  return (
    <main className="lesson-shell" id="lesson">
      <article className="lesson lesson-manuscript">
        <lesson.Content components={lessonComponents} />
      </article>
    </main>
  );
}
