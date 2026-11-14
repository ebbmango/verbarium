import type { ReactNode } from "react";
import { Link } from "react-router";

import { dictionaryIndexPath } from "../content/dictionary/dictionary-files";
import { lessonIndexPath } from "../content/lessons";
import { LogoSeal } from "./seal";

// Font Awesome Pro 7.3.1 (sharp solid), https://fontawesome.com, under the
// commercial licence the site's owner holds; recorded in Hylia Licences.md.
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" className="side-nav-icon" fill="currentColor" focusable="false" viewBox="0 0 640 640">
      {children}
    </svg>
  );
}

const personChalkboard = (
  <path d="M192 144C222.9 144 248 118.9 248 88C248 57.1 222.9 32 192 32C161.1 32 136 57.1 136 88C136 118.9 161.1 144 192 144zM112 608L176 608L176 400L208 400L208 608L272 608L272 240L432 240L432 176L384 176L384 128L576 128L576 320L384 320L384 288L320 288L320 384L640 384L640 64L320 64L320 176L125 176L115.4 188.7L6.5 332.7L57.5 371.3L112 299.3L112 608z" />
);
const book = (
  <path d="M480 64L96 64L96 576L544 576L544 512L512 512L512 448L544 448L544 64L480 64zM192 448L448 448L448 512L160 512L160 480C160 462.3 174.3 448 192 448zM224 192L448 192L448 240L224 240L224 192zM448 288L448 336L224 336L224 288L448 288z" />
);
const cardsBlank = (
  <path d="M576 576L256 576L256 569.6L527.3 496.9L428.5 128L576 128L576 576zM468.6 463L159.5 545.8L43.5 113.1L352.6 30.2L468.6 463z" />
);

function SideNavItem({ children, label, to }: { children: ReactNode; label: string; to: string }) {
  return (
    <Link aria-label={label} className="side-nav-item" title={label} to={to}>
      <Icon>{children}</Icon>
    </Link>
  );
}

/**
 * The navigation rail down the left edge of a lesson: the logo, then Lessons,
 * Dictionary and Flashcards as pale icons, taking no room from the page. None is
 * marked as current: the reader is in a lesson, and the chapter strip says where.
 */
export function SideNav() {
  return (
    <nav aria-label="Primary navigation" className="side-nav">
      <Link aria-label="Verbarium home" className="brand" to="/">
        <LogoSeal />
      </Link>
      <SideNavItem label="Lessons" to={lessonIndexPath}>
        {personChalkboard}
      </SideNavItem>
      <SideNavItem label="Dictionary" to={dictionaryIndexPath}>
        {book}
      </SideNavItem>
      <a aria-label="Flashcards" className="side-nav-item" href="#flashcards" title="Flashcards">
        <Icon>{cardsBlank}</Icon>
      </a>
    </nav>
  );
}
