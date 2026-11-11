import type { ComponentPropsWithoutRef, CSSProperties, PropsWithChildren, ReactNode } from "react";
import { Fragment } from "react";
import { Link } from "react-router";

import { dictionaryPath } from "../content/dictionary/dictionary-files";
import { hasDictionaryPage } from "../content/dictionary/headwords";
import { formSources } from "../content/forms/form-sources";
import type { LessonHeaderData } from "../mdx/remark-lesson-header";
import { splitHanRuns } from "../lib/han-runs";
import { FinishLesson } from "./finish-lesson";
import { LegacyQuote, Quote } from "./quote";
import { LessonSeal, LetterSeal } from "./seal";

export { LegacyQuote, Quote } from "./quote";

/** Text a component gets in a prop, with its Chinese marked the way the build marks prose. */
export function HanMarkedText({ text }: { text: string }) {
  return splitHanRuns(text).map((run, index) => (
    <Fragment key={index}>{run.chinese ? <span lang="zh-Hant">{run.text}</span> : run.text}</Fragment>
  ));
}

type PageHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle: ReactNode;
};

/** The title block a page opens with: any eyebrow, the title and a subtitle line. */
export function PageHeading({ eyebrow, subtitle, title }: PageHeadingProps) {
  return (
    <header className="lesson-heading">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p className="lesson-subtitle">{subtitle}</p>
    </header>
  );
}

/** A lesson's title block. Its number and subtitle are also read at compile time (app/mdx/remark-lesson-header.ts). */
export function LessonHeader({ number, subtitle }: LessonHeaderData) {
  // The seal says 課, "lesson"; the hidden text says the whole title to assistive technology.
  const title = (
    <span className="lesson-title">
      <LessonSeal number={number} />
      <span className="visually-hidden">Lesson {number}</span>
      <span aria-hidden="true">{number}</span>
    </span>
  );

  return <PageHeading title={title} subtitle={<HanMarkedText text={subtitle} />} />;
}

/** A character the lesson displays, linking to its dictionary page when it has one; a look-alike form links to its character's. */
function DisplayedCharacter({ character }: { character: string }) {
  const headword = character.normalize("NFKC");
  return hasDictionaryPage(headword) ? <Link to={dictionaryPath(headword)}>{character}</Link> : character;
}

type CharDisplayProps = {
  character: string;
  label: string;
  /** The reading this lesson teaches: one of those on the character's dictionary page. */
  reading: string;
};

export function CharDisplay({ character, label, reading }: CharDisplayProps) {
  const headingId = `character-${label.toLowerCase()}`;

  return (
    <div className="char-display">
      <LetterSeal character={character} className="section-marker" letter={label} />
      <h2 className="study-character" id={headingId} lang="zh-Hant">
        <DisplayedCharacter character={character} />
      </h2>
      <p className="study-reading">{reading}</p>
    </div>
  );
}

type CharacterFormsProps = {
  character?: string;
  description: string;
  forms?: number;
  /** Historical-form pictures in `public/forms/`, oldest first, by file name, separated by spaces; a name without an extension means `.svg`. A `glyph:X` entry shows the current form of X as text instead of a picture. */
  historical?: string;
};

/** Where a historical-form picture is served; a name without an extension means `.svg`. */
export function formPictureUrl(name: string) {
  return `${import.meta.env.BASE_URL}forms/${/\.\w+$/.test(name) ? name : `${name}.svg`}`;
}

/** A historical-form picture, linking to the page it was taken from. */
function FormPicture({ name }: { name: string }) {
  const source = formSources[name];
  // Drawn as a mask over the text colour, so a picture takes the ink of its surroundings (muted in a Commentary).
  const picture = (
    <span
      aria-label={source ? `Historical form, from ${source.label}` : "Historical form"}
      className="form-picture"
      role="img"
      style={{ "--form-picture": `url("${formPictureUrl(name)}")` } as CSSProperties}
    />
  );

  return source ? (
    <a className="form-source" href={source.href} rel="noopener noreferrer" target="_blank" title={source.label}>
      {picture}
    </a>
  ) : (
    picture
  );
}

export function CharacterForms({ character, description, forms = 2, historical = "" }: CharacterFormsProps) {
  const pictures = historical.split(/\s+/).filter(Boolean);
  const cards = Math.max(forms, pictures.length + (character ? 1 : 0));

  return (
    <figure className="character-forms">
      <figcaption className="visually-hidden">{description}</figcaption>
      <div className="form-grid">
        {Array.from({ length: cards }, (_, index) => {
          const isCurrent = Boolean(character) && index === cards - 1;
          const entry = isCurrent ? undefined : pictures[index];
          const glyph = entry?.startsWith("glyph:") ? entry.slice("glyph:".length) : undefined;
          const picture = glyph ? undefined : entry;

          return (
            <div className="form-card" key={index}>
              {picture ? (
                <FormPicture name={picture} />
              ) : isCurrent || glyph ? (
                <>
                  <span className="form-glyph" lang="zh-Hant">
                    <DisplayedCharacter character={(glyph ?? character) as string} />
                  </span>
                  <span className="visually-hidden">Current form</span>
                </>
              ) : (
                <>
                  <span className="form-placeholder" aria-hidden="true" />
                  <span className="visually-hidden">Historical form pending</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

type SectionBreakProps = PropsWithChildren<{
  ordinal: string;
}>;

/** A numbered division of the lesson, under the solid rule that opens it. */
export function SectionBreak({ children, ordinal }: SectionBreakProps) {
  return (
    <>
      <hr className="lesson-divider lesson-divider-solid" />
      <section className="category-break">
        <strong>{ordinal},</strong> {children}
      </section>
    </>
  );
}

/** The dashed divider between two characters: what markdown's `---` becomes. */
export function LessonDivider() {
  return <hr className="lesson-divider lesson-divider-dashed" />;
}

export function Commentary({ children }: PropsWithChildren) {
  return (
    <aside className="lesson-note lesson-note-wide">
      <span className="note-title">Commentary</span>
      {children}
    </aside>
  );
}

/** One large character standing alone in the prose: shown, not linked. */
export function CharacterFocus({ character }: { character: string }) {
  return (
    <div className="character-focus" lang="zh-Hant">
      {character}
    </div>
  );
}

export function LessonComplete({ children }: PropsWithChildren) {
  return <footer className="lesson-complete">{children}</footer>;
}

/** The vertical line of Chinese that closes a lesson. */
export function ClosingLine({ children }: PropsWithChildren) {
  return (
    <blockquote className="lesson-closing-quote" lang="zh-Hant">
      {children}
    </blockquote>
  );
}

function LessonParagraph(props: ComponentPropsWithoutRef<"p">) {
  return <p {...props} />;
}

export const lessonComponents = {
  hr: LessonDivider,
  p: LessonParagraph,
  CharDisplay,
  CharacterFocus,
  CharacterForms,
  ClosingLine,
  Commentary,
  FinishLesson,
  LessonComplete,
  LessonHeader,
  LegacyQuote,
  Quote,
  SectionBreak,
};
