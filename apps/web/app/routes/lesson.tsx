import { lessonComponents } from "~/components/lesson";
import { lessonByNumber } from "~/content/lessons";

import type { Route } from "./+types/lesson";

function lessonFor(param: string | undefined) {
  return /^\d+$/.test(param ?? "") ? lessonByNumber(Number(param)) : undefined;
}

export function meta({ params }: Route.MetaArgs) {
  const lesson = lessonFor(params.number);
  if (!lesson) return [{ title: "Lesson not found · Verbarium" }];
  return [
    { title: `Lesson ${lesson.number} · Verbarium` },
    { name: "description", content: `Lesson ${lesson.number} of Verbarium's etymological lessons.` },
  ];
}

export default function LessonPage({ params }: Route.ComponentProps) {
  const lesson = lessonFor(params.number);

  // Addresses that were not pre-rendered reach here through the 404 fallback,
  // so the page already answers 404; this says why.
  if (!lesson) {
    return (
      <main className="lesson-shell">
        <section className="lesson landing">
          <header className="lesson-heading">
            <p className="eyebrow">Etymological lessons</p>
            <h1>404</h1>
            <p className="lesson-subtitle">There is no Lesson {params.number}.</p>
          </header>
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
