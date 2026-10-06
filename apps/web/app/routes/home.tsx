import { Link } from "react-router";

import { lessonPath, lessons } from "~/content/lessons";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verbarium" },
    {
      name: "description",
      content: "Etymological lessons in Literary and Classical Chinese, with quotations you can explore.",
    },
  ];
}

/** Until the lesson index exists (#23), the home page leads to the first lesson. */
export default function Home() {
  const first = lessons[0];

  return (
    <main className="lesson-shell">
      <section className="lesson landing">
        <header className="lesson-heading">
          <p className="eyebrow">Etymological lessons</p>
          <h1>Verbarium</h1>
          <p className="lesson-subtitle">
            Reading Literary and Classical Chinese, one character at a time.
          </p>
        </header>
        <p>
          <Link className="button-primary" to={lessonPath(first.number)}>
            Begin with Lesson {first.number}
          </Link>
        </p>
      </section>
    </main>
  );
}
