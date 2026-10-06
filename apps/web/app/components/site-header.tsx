import { Link, useLocation } from "react-router";

import { isLessonPath, lessonIndexPath } from "../content/lessons";
import { ProfileButton } from "./profile-button";

export function SiteHeader() {
  // The Lessons tab is current on the lesson index and on every lesson.
  const onLessons = isLessonPath(useLocation().pathname);

  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="Verbarium home">
        <span className="brand-mark" aria-hidden="true">
          文
        </span>
        <span className="brand-name">Verbarium</span>
      </Link>

      <nav className="primary-nav" aria-label="Primary navigation">
        <Link
          aria-current={onLessons ? "page" : undefined}
          className={onLessons ? "nav-tab nav-tab-active" : "nav-tab"}
          to={lessonIndexPath}
        >
          Lessons
        </Link>
        <a className="nav-tab" href="#characters">
          Characters
        </a>
        <a className="nav-tab" href="#flashcards">
          Flashcards
        </a>
      </nav>

      <ProfileButton />
    </header>
  );
}
