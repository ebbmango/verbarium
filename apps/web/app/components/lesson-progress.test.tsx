import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonProgress } from "./lesson-progress";

function display(character: string, labeled: boolean) {
  return (
    <div className="char-display">
      <h2 className="study-character" data-character={character} id={labeled ? `character-${character}` : undefined}>
        {character}
      </h2>
    </div>
  );
}

describe("the lesson progress strip", () => {
  afterEach(() => vi.restoreAllMocks());

  it("has a stop for every displayed character, and an unlabeled one in a commentary jumps to itself, not to the top of the page", () => {
    const scrolled: Element[] = [];
    Element.prototype.scrollIntoView = vi.fn(function (this: Element) {
      scrolled.push(this);
    });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    render(
      <>
        {display("亟", true)}
        <aside className="lesson-note">{display("極", false)}</aside>
        <hr className="lesson-divider" />
        {display("亙", true)}
        <LessonProgress />
      </>,
    );

    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["亟", "極", "亙"]);

    fireEvent.click(screen.getByRole("button", { name: "極" }));
    expect(scrollTo).not.toHaveBeenCalled();
    expect(scrolled).toEqual([screen.getByRole("heading", { name: "極" }).closest(".char-display")]);

    fireEvent.click(screen.getByRole("button", { name: "亙" }));
    expect(scrolled.at(-1)).toBe(document.querySelector("hr.lesson-divider"));
  });

  it("jumps a display with a chapter start before it to the end of the element before the marker", () => {
    Element.prototype.scrollIntoView = vi.fn();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window, "scrollY", "get").mockReturnValue(1000);

    render(
      <>
        {display("亟", true)}
        <aside className="lesson-note">
          <figure className="character-forms" />
          <div data-chapter-start="" />
          <p>Although it later came to mean urgent</p>
          {display("極", false)}
        </aside>
        <LessonProgress />
      </>,
    );
    const forms = document.querySelector("figure.character-forms") as HTMLElement;
    vi.spyOn(forms, "getBoundingClientRect").mockReturnValue({ bottom: 340 } as DOMRect);

    fireEvent.click(screen.getByRole("button", { name: "極" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 1340 });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
