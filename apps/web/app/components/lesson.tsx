import type { ComponentPropsWithoutRef, CSSProperties, PropsWithChildren, ReactNode, Ref } from "react";
import { Fragment, useEffect, useRef } from "react";
import { Link } from "react-router";

import { dictionaryPath } from "../content/dictionary/dictionary-files";
import { hasDictionaryPage } from "../content/dictionary/headwords";
import { formSources } from "../content/forms/form-sources";
import { characterParts } from "../content/parts";
import { highlightedStrokes } from "../content/strokes";
import type { LessonHeaderData } from "../mdx/remark-lesson-header";
import { rowSizes } from "../lib/form-rows";
import { useInkCentring } from "../lib/ink-centring";
import { linkParts } from "../lib/part-lighting";
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
export function LessonHeader({ number, subtitle, children }: PropsWithChildren<Omit<LessonHeaderData, "subtitle"> & { subtitle?: string }>) {
  // The hidden text says the whole title to assistive technology.
  const title = (
    <span className="lesson-title">
      <span className="visually-hidden">Lesson {number}</span>
      <span aria-hidden="true">{number}</span>
    </span>
  );

  return <PageHeading title={title} subtitle={subtitle !== undefined ? <HanMarkedText text={subtitle} /> : children} />;
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
  /** Explicit form rows, supplied by the MDX body-row compiler. `current` places `character`. */
  layout?: string;
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

/** A historical glyph over copyable text, or a described picture when no character corresponds. */
export function InlineForm({ name, character, description = "Historical form" }: { name: string; character?: string; description?: string }) {
  return (
    <span className="inline-form" lang={character ? "zh-Hant" : "en"} role={character ? undefined : "img"} aria-label={character ? undefined : description} style={formMaskStyle(name)}>
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

export function CharacterForms({ character, description, forms = 2, historical = "", layout }: CharacterFormsProps) {
  const rows = layout?.split(/\r?\n/).map((line) => line.trim().split(/\s+/).filter(Boolean)).filter((row) => row.length);
  const pictures = rows ? rows.flat() : historical.split(/\s+/).filter(Boolean);
  const cards = rows ? pictures.length : Math.max(forms, pictures.length + (character ? 1 : 0));

  const cardElements = Array.from({ length: cards }, (_, index) => {
    const isCurrent = rows ? pictures[index] === "current" : Boolean(character) && index === cards - 1;
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

  // Authored rows stay intact; otherwise balance rows of at most four (see rowSizes).
  let next = 0;
  return (
    <figure className="character-forms">
      <figcaption className="visually-hidden">{description}</figcaption>
      <div className="form-grid">
        {(rows ? rows.map((row) => row.length) : rowSizes(cards)).map((size) => {
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

type FocusItemProps = { headword?: string; caption?: string; subcaption?: string; spine?: boolean; nudge?: string; parts?: boolean; children?: ReactNode } & (
  | { character: string; name?: never; description?: never }
  | { name: string; description: string; character?: string }
);

/** The line of English under a focus item, in MDX `<Caption>…</Caption>` inside `<FocusItem>`. */
export function Caption({ children }: PropsWithChildren) {
  return <span className="focus-caption">{children}</span>;
}

/** A second, lighter line under a focus item's caption, past a thin rule: `<Subcaption>…</Subcaption>`. */
export function Subcaption({ children }: PropsWithChildren) {
  return <span className="focus-subcaption">{children}</span>;
}

/**
 * Words in the prose that name a part of a character drawn in parts
 * (`<CharacterFocus character="蒜" parts />`): they rest grey with the part,
 * and pointing at either brings both back to ink (see `linkParts`).
 */
export function PartWords({ part, children }: PropsWithChildren<{ part: string }>) {
  return <span className="part-words" data-part-link={part}>{children}</span>;
}

/**
 * A character drawn from its parts' outlines (app/content/parts) over its
 * copyable text. Each part is linked to the `<PartWords>` naming it (see
 * `linkParts`).
 */
function PartsGlyph({ character }: { character: string }) {
  const data = characterParts(character);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const block = ref.current?.closest<HTMLElement>(".character-focus");
    if (!block) return;
    block.setAttribute("data-parts", "");
    const unlink = linkParts(block);
    return () => {
      unlink();
      block.removeAttribute("data-parts");
    };
  }, []);
  return (
    <span ref={ref} className="part-glyph">
      <span className="inline-form-text">{character}</span>
      <svg aria-hidden="true" viewBox={data.viewBox}>
        {Object.entries(data.parts).map(([name, paths]) => (
          <g key={name} data-part={name}>
            {paths.map((path, index) => <path key={index} d={path} />)}
          </g>
        ))}
      </svg>
    </span>
  );
}

/** A text character in a focus row; with `spine`, its ink centred in its box and any captions under its spine. */
function FocusText({ character, captions, spine = false, nudge, parts = false }: { character: string; captions?: ReactNode; spine?: boolean; nudge?: string; parts?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const captionsRef = useRef<HTMLSpanElement>(null);
  useInkCentring(ref, spine, captionsRef);
  const style = nudge === undefined ? undefined : ({ "--nudge": nudge } as CSSProperties);
  const item = (
    <span ref={ref} className="focus-item" style={style}>
      {parts ? <PartsGlyph character={character} /> : character}
    </span>
  );
  return captions === undefined ? item : <FocusCaptioned item={item} captions={captions} captionsRef={captionsRef} />;
}

function FocusCaptioned({ item, captions, captionsRef }: { item: ReactNode; captions: ReactNode; captionsRef?: Ref<HTMLSpanElement> }) {
  return (
    <span className="focus-captioned">
      {item}
      <span ref={captionsRef} className="focus-captions" lang="en">{captions}</span>
    </span>
  );
}

/**
 * One item of a `<CharacterFocus>` row: a character, or a picture of a form.
 * Under it, `caption` sets a line of English and `subcaption` a lighter one
 * below; or write them as `<Caption>` and `<Subcaption>` children, which take
 * Markdown. `spine` is for a character a font draws off centre, such as 礻: it
 * centres the character's ink in its box and its captions under its upright
 * stroke (see `useInkCentring`). `nudge` moves a text character sideways by
 * that fraction of its size, positive to the right, negative to the left, for
 * one that looks off centre though it measures centred (艸); its captions stay.
 * `parts` draws the character from its parts (see `PartsGlyph`).
 */
export function FocusItem({ name, description, character, caption, subcaption, spine, nudge, parts, children }: FocusItemProps) {
  const captions = children ?? (caption === undefined && subcaption === undefined ? undefined : (
    <>
      {caption !== undefined && <Caption><HanMarkedText text={caption} /></Caption>}
      {subcaption !== undefined && <Subcaption><HanMarkedText text={subcaption} /></Subcaption>}
    </>
  ));
  if (name === undefined) return <FocusText character={character} captions={captions} spine={spine} nudge={nudge} parts={parts} />;
  const picture = <FocusPicture name={name} description={description} character={character} />;
  return captions === undefined ? picture : <FocusCaptioned item={picture} captions={captions} />;
}

function FocusPicture({ name, description, character }: { name: string; description: string; character?: string }) {
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

type CharacterFocusProps = { size?: "small" } & (
  | { character: string; highlight?: string; caption?: string; subcaption?: string; spine?: boolean; nudge?: string; parts?: boolean; characters?: never; children?: never }
  | { character?: never; highlight?: never; caption?: never; subcaption?: never; spine?: never; nudge?: never; parts?: never; characters: string; children?: never }
  | { character?: never; highlight?: never; caption?: never; subcaption?: never; spine?: never; nudge?: never; parts?: never; characters?: never; children: ReactNode }
);

/** A character drawn from its stroke outlines, the named strokes in ink and the rest grey, over its copyable text. */
function HighlightedCharacter({ character, highlight }: { character: string; highlight: string }) {
  const { data, strokes } = highlightedStrokes(character, highlight);
  return (
    <span className="stroke-glyph">
      <span className="inline-form-text">{character}</span>
      <svg aria-hidden="true" viewBox={data.viewBox}>
        {/* Painted last stroke first, so an earlier stroke lies over the start of a later one. */}
        {data.strokes.map((path, index) => ({ path, stroke: index + 1 })).reverse().map(({ path, stroke }) => (
          <path key={stroke} className={strokes.has(stroke) ? "stroke-highlight" : undefined} d={path} data-stroke={stroke} />
        ))}
      </svg>
    </span>
  );
}

/** A span whose text's ink is centred in its box, for glyphs a font draws off centre (礻, 衤). */
export function InkCentred({ children }: PropsWithChildren) {
  const ref = useRef<HTMLSpanElement>(null);
  useInkCentring(ref);
  return <span ref={ref} className="ink-centred">{children}</span>;
}

/**
 * Large characters in the prose, shown without links; `characters` is a
 * space-separated row; `highlight` names strokes of `character` to keep in ink,
 * the rest shown grey. `size="small"` draws the characters at two-thirds size.
 * `parts` draws `character` from its parts (app/content/parts), each lit with
 * the focus items beside it that show it.
 */
export function CharacterFocus(props: CharacterFocusProps) {
  const { character, characters, children, highlight, size } = props;
  const ref = useRef<HTMLDivElement>(null);
  const captioned = props.caption !== undefined || props.subcaption !== undefined || props.nudge !== undefined || props.parts === true;
  const plainCharacter = character !== undefined && highlight === undefined && !captioned;
  useInkCentring(ref, plainCharacter);
  if (character !== undefined && highlight === undefined && captioned) {
    // A captioned, nudged or parted single character is a one-item row.
    return (
      <CharacterFocus size={size}>
        <FocusItem character={character} caption={props.caption} subcaption={props.subcaption} spine={props.spine} nudge={props.nudge} parts={props.parts} />
      </CharacterFocus>
    );
  }
  return (
    <div ref={ref} className={`character-focus${characters !== undefined || children !== undefined ? " character-focus-group" : ""}`} lang="zh-Hant" data-size={size}>
      {characters !== undefined
        ? characters.split(/\s+/).filter(Boolean).map((value, index) => <InkCentred key={index}>{value}</InkCentred>)
        : character !== undefined && highlight !== undefined
          ? <HighlightedCharacter character={character} highlight={highlight} />
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
  PartWords,
  Caption,
  Subcaption,
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
