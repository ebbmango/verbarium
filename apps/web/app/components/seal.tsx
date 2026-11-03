import { type Seal as Baked, SEALS, sealFile } from "../lib/seal";

/**
 * The seals, as the images `scripts/bake-seals.ts` baked from app/lib/seal.ts.
 * Each image holds the seal with its margin, so the stylesheet pulls the
 * margin back in to place the seal itself.
 */

function Seal({ className, label, lazy, seal }: { className: string; label?: string; lazy?: boolean; seal: Baked }) {
  const outer = seal.size * 1.5;
  return (
    <img
      alt={label ?? ""}
      className={className}
      height={outer}
      loading={lazy ? "lazy" : undefined}
      src={`${import.meta.env.BASE_URL}${sealFile(seal.name)}`}
      width={outer}
    />
  );
}

/** The site's mark: 文 on a stone that stands still. */
export function LogoSeal() {
  return <Seal className="seal-logo" seal={SEALS.logo} />;
}

/** 課, "lesson", stamped beside a lesson's number; each lesson's stone is its own. */
export function LessonSeal({ number }: { number: number }) {
  return <Seal className="seal-lesson" seal={SEALS.lesson(number)} />;
}

/** A section's letter on a small stone of its own, named after the letter and its character. */
export function LetterSeal({ character, className, letter }: { character: string; className: string; letter: string }) {
  return <Seal className={className} label={letter} lazy seal={SEALS.letter(letter, character.normalize("NFKC"))} />;
}
