import LessonOne from "~/content/lessons/001.mdx";
import { lessonComponents } from "~/components/lesson";

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
      <header className="topbar">
        <a className="brand" href="/" aria-label="Verbarium home">
          <span className="brand-mark" aria-hidden="true">
            文
          </span>
          <span className="brand-name">Verbarium</span>
        </a>

        <nav className="primary-nav" aria-label="Primary navigation">
          <a className="nav-tab nav-tab-active" href="#lesson" aria-current="page">
            Lessons
          </a>
          <a className="nav-tab" href="#characters">
            Characters
          </a>
          <a className="nav-tab" href="#flashcards">
            Flashcards
          </a>
        </nav>

        <button className="profile-button" type="button" aria-label="Open profile">
          EB
        </button>
      </header>

      <main className="lesson-shell" id="lesson">
        <article className="lesson lesson-manuscript">
          <LessonOne components={lessonComponents} />
        </article>
      </main>
    </div>
  );
}
