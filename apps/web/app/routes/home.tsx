import { Link } from "react-router";

import { PageHeading } from "~/components/lesson";
import { lessonIndexPath, lessonPath, lessons } from "~/content/lessons";

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

/** The home page leads to the first lesson, and to the index of all of them. */
export default function Home() {
  const first = lessons[0];

  return (
    <main className="lesson-shell">
      <section className="lesson landing">
        <PageHeading eyebrow="Etymological lessons" title="Verbarium">
          Reading Literary and Classical Chinese, one character at a time.
        </PageHeading>
        <p>
          <Link className="button-primary" to={lessonPath(first.number)}>
            Begin with Lesson {first.number}
          </Link>
        </p>
        <p>
          <Link className="landing-link" to={lessonIndexPath}>
            All lessons
          </Link>
        </p>
      </section>
    </main>
  );
}
