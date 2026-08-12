import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";

type LessonHeaderProps = {
  number: number;
  total: number;
  primitive: string;
};

export function LessonHeader({ number, primitive, total }: LessonHeaderProps) {
  return (
    <header className="lesson-heading">
      <p className="eyebrow">Etymological lessons</p>
      <h1>Lesson {number}</h1>
      <p className="lesson-subtitle">
        About the primitive <span lang="zh-Hant">{primitive}</span>, a single stroke.
      </p>
      <div className="lesson-progress" aria-label={`Lesson ${number} of ${total}`}>
        <span>{number}</span>
        <span className="progress-line" aria-hidden="true">
          <span style={{ width: `${(number / total) * 100}%` }} />
        </span>
        <span>{total}</span>
      </div>
    </header>
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

type QuoteProps = PropsWithChildren<{
  source?: string;
  sourcePending?: boolean;
}>;

export function Quote({ children, source, sourcePending = false }: QuoteProps) {
  return (
    <blockquote className="lesson-quote">
      {children}
      <footer className={sourcePending ? "quote-source quote-source-pending" : "quote-source"}>
        {sourcePending ? "Source pending" : source}
      </footer>
    </blockquote>
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

export function SectionBreak({ children, ordinal }: SectionBreakProps) {
  return (
    <section className="category-break">
      <span>{ordinal}</span>
      {children}
    </section>
  );
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

function LessonParagraph(props: ComponentPropsWithoutRef<"p">) {
  return <p {...props} />;
}

export const lessonComponents = {
  p: LessonParagraph,
  CharDisplay,
  CharacterFocus,
  CharacterForms,
  Commentary,
  LessonComplete,
  LessonHeader,
  Quote,
  SectionBreak,
};
