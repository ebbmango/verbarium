import type { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router";

// Not the registry: that would bundle every dictionary page into the header.
import { dictionaryIndexPath, isDictionaryPath } from "../content/dictionary/dictionary-files";
import { isLessonPath, lessonIndexPath } from "../content/lessons";
import { ProfileButton } from "./profile-button";

function NavTab({ children, current, to }: PropsWithChildren<{ current: boolean; to: string }>) {
  return (
    <Link aria-current={current ? "page" : undefined} className={current ? "nav-tab nav-tab-active" : "nav-tab"} to={to}>
      {children}
    </Link>
  );
}

export function SiteHeader() {
  // A tab is current on its index and on every page under it.
  const { pathname } = useLocation();

  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="Verbarium home">
        <span className="brand-mark" aria-hidden="true">
          文
        </span>
        <span className="brand-name">Verbarium</span>
      </Link>

      <nav className="primary-nav" aria-label="Primary navigation">
        <NavTab current={isLessonPath(pathname)} to={lessonIndexPath}>
          Lessons
        </NavTab>
        <NavTab current={isDictionaryPath(pathname)} to={dictionaryIndexPath}>
          Dictionary
        </NavTab>
        <a className="nav-tab" href="#flashcards">
          Flashcards
        </a>
      </nav>

      <ProfileButton />
    </header>
  );
}
