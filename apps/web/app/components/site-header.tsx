import { Link, NavLink } from "react-router";

function navTabClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-tab nav-tab-active" : "nav-tab";
}

export function SiteHeader() {
  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="Verbarium home">
        <span className="brand-mark" aria-hidden="true">
          文
        </span>
        <span className="brand-name">Verbarium</span>
      </Link>

      <nav className="primary-nav" aria-label="Primary navigation">
        <NavLink className={navTabClassName} end to="/">
          Lessons
        </NavLink>
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
  );
}
