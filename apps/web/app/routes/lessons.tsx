import { Link } from "react-router";

import { MarkedText, PageHeading } from "~/components/lesson";
import { lessonPath, lessons } from "~/content/lessons";

import type { Route } from "./+types/lessons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lessons · Verbarium" },
    { name: "description", content: "Every lesson of Verbarium's etymological course that is written so far." },
  ];
}

/** The lesson index: every committed lesson, each linking to its address. */
export default function LessonIndex() {
  return (
    <main className="lesson-shell">
      <section className="lesson landing">
        <PageHeading
          eyebrow="Etymological lessons"
          title="Lessons"
          subtitle={lessons.length === 1 ? "One lesson so far." : `${lessons.length} lessons so far.`}
        />
        <ol className="lesson-index">
          {lessons.map((lesson) => (
            <li key={lesson.number}>
              <Link to={lessonPath(lesson.number)}>
                <span className="eyebrow">Lesson {lesson.number}</span>
                <span className="lesson-subtitle">
                  <MarkedText text={lesson.subtitle} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
