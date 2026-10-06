import LessonOne from "~/content/lessons/001.mdx";
import { lessonComponents } from "~/components/lesson";
import { SiteHeader } from "~/components/site-header";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lesson 1 · Verbarium" },
    {
      name: "description",
      content: "About the primitive 一, a single stroke.",
    },
  ];
}

export default function Home() {
  return (
    <div className="paper">
      <SiteHeader />

      <main className="lesson-shell" id="lesson">
        <article className="lesson lesson-manuscript">
          <LessonOne components={lessonComponents} />
        </article>
      </main>
    </div>
  );
}
