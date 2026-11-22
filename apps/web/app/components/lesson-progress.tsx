import { useEffect, useRef, useState } from "react";

/** Where a section counts as reached: once its start has risen above this share of the screen. */
const reachedAt = 0.25;

/**
 * Find the opening divider for a main character display. Commentary displays
 * and later displays without a divider start at their own position.
 */
function sectionStart(heading: HTMLElement, index: number): HTMLElement | null {
  if (heading.hasAttribute("data-progress-marker")) return heading;
  const display = heading.closest<HTMLElement>(".char-display") ?? heading;
  if (!heading.id || display.closest(".lesson-note")) return display;
  for (let node = display.previousElementSibling; node; node = node.previousElementSibling) {
    if (node.matches(".char-display")) break;
    if (node.matches("hr.lesson-divider")) return node as HTMLElement;
  }
  return index === 0 ? null : display;
}

/**
 * The strip follows the lesson's character displays and explicitly marked
 * section breaks in reading order.
 */
export function LessonProgress() {
  const [characters, setCharacters] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  // Parallel to `characters`; null is the top of the page.
  const starts = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const markers = [...document.querySelectorAll<HTMLElement>(
      "h2.study-character[data-character], hr[data-progress-marker]",
    )];
    starts.current = markers.map(sectionStart);
    setCharacters(markers.map(({ dataset }) => dataset.progressMarker ?? dataset.character ?? ""));

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
