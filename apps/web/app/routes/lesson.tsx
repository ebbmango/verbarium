import { data } from "react-router";

import { lessonComponents } from "~/components/lesson";
import { lessonByNumber } from "~/content/lessons";

import type { Route } from "./+types/lesson";

function lessonNumber(param: string | undefined): number {
  return /^\d+$/.test(param ?? "") ? Number(param) : Number.NaN;
}

export function meta({ params }: Route.MetaArgs) {
  const number = lessonNumber(params.number);
  return [
    { title: `Lesson ${number} · Verbarium` },
    { name: "description", content: `Lesson ${number} of Verbarium's etymological lessons.` },
  ];
}

export default function LessonPage({ params }: Route.ComponentProps) {
  const lesson = lessonByNumber(lessonNumber(params.number));
  if (!lesson) throw data(`There is no Lesson ${params.number}.`, { status: 404 });

  return (
    <main className="lesson-shell" id="lesson">
      <article className="lesson lesson-manuscript">
        <lesson.Content components={lessonComponents} />
      </article>
    </main>
  );
}
