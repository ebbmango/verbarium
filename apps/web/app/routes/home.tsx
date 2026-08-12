import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verbarium" },
    {
      name: "description",
      content: "Learn Literary and Classical Chinese with Verbarium.",
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
          <a className="nav-tab nav-tab-active" href="#lessons" aria-current="page">
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
    </div>
  );
}
