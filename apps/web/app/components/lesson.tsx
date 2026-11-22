import type { ComponentPropsWithoutRef, CSSProperties, PropsWithChildren, ReactNode } from "react";
import { Fragment } from "react";
import { Link } from "react-router";

import { dictionaryPath } from "../content/dictionary/dictionary-files";
import { hasDictionaryPage } from "../content/dictionary/headwords";
import { formSources } from "../content/forms/form-sources";
import type { LessonHeaderData } from "../mdx/remark-lesson-header";
import { rowSizes } from "../lib/form-rows";
import { splitHanRuns } from "../lib/han-runs";
import { FinishLesson } from "./finish-lesson";
import { LegacyQuote, Quote } from "./quote";
import { LetterSeal } from "./seal";

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
  // The hidden text says the whole title to assistive technology.
  const title = (
    <span className="lesson-title">
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
  /** The section's letter, shown on its seal; left out for a character shown in passing, as in a Commentary, which gets no seal. */
  label?: string;
  /** The reading this lesson teaches: one of those on the character's dictionary page. */
  reading: string;
};

export function CharDisplay({ character, label, reading }: CharDisplayProps) {
  return (
    <div className="char-display">
      {label ? <LetterSeal character={character} className="section-marker" letter={label} /> : null}
      <h2 className="study-character" data-character={character} id={label ? `character-${label.toLowerCase()}` : undefined} lang="zh-Hant">
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

function formMaskStyle(name: string) {
  return { "--inline-form-picture": `url("${formPictureUrl(name)}")` } as CSSProperties;
}

function FormOverlay({ character }: { character?: string }) {
  return <>
    {character && <span className="inline-form-text">{character}</span>}
    <span className="inline-form-picture" aria-hidden="true" />
  </>;
}

/** A historical glyph over real text, so selection, copying and speech retain the character. */
export function InlineForm({ name, character }: { name: string; character: string }) {
  return (
    <span className="inline-form" lang="zh-Hant" style={formMaskStyle(name)}>
      <FormOverlay character={character} />
    </span>
  );
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

  const cardElements = Array.from({ length: cards }, (_, index) => {
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
  });

  // Rows of at most four, the upper rows taking any extra (see rowSizes).
  let next = 0;
  return (
    <figure className="character-forms">
      <figcaption className="visually-hidden">{description}</figcaption>
      <div className="form-grid">
        {rowSizes(cards).map((size) => {
          const first = next;
          next += size;
          return (
            <div className="form-row" key={first}>
              {cardElements.slice(first, next)}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

type SectionBreakProps = PropsWithChildren<{
  ordinal: string;
  marker?: string;
}>;

/** A numbered division of the lesson, under the solid rule that opens it. */
export function SectionBreak({ children, ordinal, marker }: SectionBreakProps) {
  return (
    <>
      <hr className="lesson-divider lesson-divider-solid" data-progress-marker={marker} />
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

/**
 * Where a character's chapter-strip stop jumps to: the end of the element just
 * before this one. Renders nothing visible.
 */
export function ChapterStart() {
  return <div aria-hidden="true" className="chapter-start" data-chapter-start="" />;
}

type FocusItemProps = { headword?: string } & (
  | { character: string; name?: never; description?: never }
  | { name: string; description: string; character?: string }
);

export function FocusItem({ name, description, character }: FocusItemProps) {
  if (name === undefined) return <span className="focus-item">{character}</span>;
  const source = formSources[name];
  const picture = (
    <span className="focus-item" role="img" aria-label={description} lang="en" style={formMaskStyle(name)}>
      <FormOverlay character={character} />
    </span>
  );
  return source ? (
    <a className="focus-source" href={source.href} title={source.label} lang="en"
      aria-label={`${description} Source: ${source.label}`} draggable={false}>
      {picture}
    </a>
  ) : picture;
}

type CharacterFocusProps =
  | { character: string; characters?: never; children?: never }
  | { character?: never; characters: string; children?: never }
  | { character?: never; characters?: never; children: ReactNode };

/** Large characters in the prose, shown without links; `characters` is a space-separated row. */
export function CharacterFocus({ character, characters, children }: CharacterFocusProps) {
  return (
    <div className={`character-focus${characters !== undefined || children !== undefined ? " character-focus-group" : ""}`} lang="zh-Hant">
      {characters !== undefined
        ? characters.split(/\s+/).filter(Boolean).map((value, index) => <span key={index}>{value}</span>)
        : character ?? children}
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
  ChapterStart,
  FocusItem,
  CharacterForms,
  InlineForm,
  ClosingLine,
  Commentary,
  FinishLesson,
  LessonComplete,
  LessonHeader,
  LegacyQuote,
  Quote,
  SectionBreak,
};
