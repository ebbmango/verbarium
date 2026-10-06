import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from "react";

import { lessonsInCourse } from "../content/lessons";
import { FinishLesson } from "./finish-lesson";
import { LegacyQuote, Quote } from "./quote";

export { LegacyQuote, Quote } from "./quote";

type LessonHeaderProps = {
  number: number;
  primitive: string;
};

/** The course position: this lesson's number along a line that ends at the course's last. */
export function CoursePosition({ number }: { number: number }) {
  return (
    <div className="lesson-progress" role="img" aria-label={`Lesson ${number} of ${lessonsInCourse}`}>
      <span>{number}</span>
      <span className="progress-line">
        <span style={{ width: `${(number / lessonsInCourse) * 100}%` }} />
      </span>
      <span>{lessonsInCourse}</span>
    </div>
  );
}

type PageHeadingProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
}>;

/** The title block a page opens with: the eyebrow, the title, a subtitle line, and whatever follows them. */
export function PageHeading({ children, eyebrow, subtitle, title }: PageHeadingProps) {
  return (
    <header className="lesson-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lesson-subtitle">{subtitle}</p>
      {children}
    </header>
  );
}

export function LessonHeader({ number, primitive }: LessonHeaderProps) {
  return (
    <PageHeading
      eyebrow="Etymological lessons"
      title={`Lesson ${number}`}
      subtitle={
        <>
          About the primitive <span lang="zh-Hant">{primitive}</span>, a single stroke.
        </>
      }
    >
      <CoursePosition number={number} />
    </PageHeading>
  );
}

type CharDisplayProps = {
  character: string;
  label: string;
};

export function CharDisplay({ character, label }: CharDisplayProps) {
  const headingId = `character-${label.toLowerCase()}`;

  return (
    <div className="char-display">
      <span className="section-marker">{label}</span>
      <h2 className="study-character" id={headingId} lang="zh-Hant">
        {character}
      </h2>
    </div>
  );
}

type CharacterFormsProps = {
  character?: string;
  description: string;
  forms?: number;
};

export function CharacterForms({ character, description, forms = 2 }: CharacterFormsProps) {
  return (
    <figure className="character-forms">
      <figcaption aria-label={description}>
        <span>Form study</span>
      </figcaption>
      <div className="form-grid" style={{ gridTemplateColumns: `repeat(${forms}, 1fr)` }}>
        {Array.from({ length: forms }, (_, index) => {
          const isCurrent = Boolean(character) && index === forms - 1;

          return (
            <div className={isCurrent ? "form-card form-card-current" : "form-card"} key={index}>
              {isCurrent ? (
                <>
                  <span className="form-glyph" lang="zh-Hant">
                    {character}
                  </span>
                  <span className="form-label">Current form</span>
                </>
              ) : (
                <>
                  <span className="form-placeholder" aria-hidden="true" />
                  <span className="form-label">Historical form pending</span>
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
        <span>{ordinal}</span>
        {children}
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

export function CharacterFocus({ character }: { character: string }) {
  return (
    <div className="character-focus" lang="zh-Hant" aria-label={character}>
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
