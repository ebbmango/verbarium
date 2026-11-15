import { useEffect, useRef, useState } from "react";

/** Where a section counts as reached: once its start has risen above this share of the screen. */
const reachedAt = 0.25;

/**
 * Where a character's section starts: the divider line above it, or the top of
 * the page for the first one. Walking back stops at the previous character, so
 * a section never claims a divider that belongs to an earlier one.
 */
function sectionStart(heading: HTMLElement): HTMLElement | null {
  for (let node = heading.closest(".char-display")?.previousElementSibling; node; node = node.previousElementSibling) {
    if (node.matches(".char-display")) return null;
    if (node.matches("hr.lesson-divider")) return node as HTMLElement;
  }
  return null;
}

/**
 * The strip of characters in the empty band at the bottom of a lesson: one per
 * studied character, the one being read drawn larger and darker, each a way to
 * jump to the start of its section. It reads the lesson from the page itself, so
 * a lesson needs nothing extra to appear in it.
 */
export function LessonProgress() {
  const [characters, setCharacters] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  // Parallel to `characters`; null is the top of the page.
  const starts = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const headings = [...document.querySelectorAll<HTMLElement>("h2.study-character[data-character]")];
    starts.current = headings.map(sectionStart);
    setCharacters(headings.map((heading) => heading.dataset.character ?? ""));

    let frame = 0;
    const update = () => {
      frame = 0;
      let reached = 0;
      starts.current.forEach((start, index) => {
        const top = start ? start.getBoundingClientRect().top : -1;
        if (top <= window.innerHeight * reachedAt) reached = index;
      });
      // A short last section can never rise that far: the end of the page is its.
      const page = document.documentElement;
      if (window.innerHeight + window.scrollY >= page.scrollHeight - 2) reached = Math.max(0, starts.current.length - 1);
      setCurrent(reached);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (characters.length === 0) return null;

  const jumpTo = (index: number) => {
    const start = starts.current[index];
    if (start) start.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0 });
  };

  return (
    <nav aria-label="Characters in this lesson" className="lesson-progress">
      {characters.map((character, index) => (
        <button
          aria-current={index === current ? "location" : undefined}
          className={index === current ? "lesson-progress-stop lesson-progress-current" : "lesson-progress-stop"}
          key={index}
          lang="zh-Hant"
          onClick={() => jumpTo(index)}
          type="button"
        >
          {character}
        </button>
      ))}
    </nav>
  );
}
