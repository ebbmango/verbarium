import { Link, useLocation } from "react-router";

import { ProfileButton } from "./profile-button";

/** The Lessons tab is current on the home page and on every lesson. */
function lessonsTabClassName(pathname: string) {
  const current = pathname === "/" || pathname.startsWith("/lessons");
  return current ? "nav-tab nav-tab-active" : "nav-tab";
}

export function SiteHeader() {
  const lessonsTab = lessonsTabClassName(useLocation().pathname);

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
          aria-current={lessonsTab === "nav-tab nav-tab-active" ? "page" : undefined}
          className={lessonsTab}
          to="/"
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
