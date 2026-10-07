import { describe, expect, it } from "vitest";

import { lessonByNumber, lessonFromModule, lessons } from "./index";
import { isLessonPath, lessonNumberFromFileName, lessonPath } from "./lesson-files";

describe("lessons", () => {
  it("lists every committed lesson by the number in its file name, in order", () => {
    expect(lessons.map((lesson) => lesson.number)).toEqual([1]);
    expect(lessons[0].subtitle).toBe("About the primitive 一, a single stroke.");
    expect(typeof lessons[0].Content).toBe("function");
  });

  it("finds a lesson by number and nothing for one that does not exist", () => {
    expect(lessonByNumber(1)?.number).toBe(1);
    expect(lessonByNumber(2)).toBeUndefined();
    expect(lessonByNumber(Number.NaN)).toBeUndefined();
  });
});

describe("lesson files", () => {
  it("read the lesson number out of the file name and nothing else", () => {
    expect(lessonNumberFromFileName("001.mdx")).toBe(1);
    expect(lessonNumberFromFileName("020.mdx")).toBe(20);
    expect(lessonNumberFromFileName("lesson-2.mdx")).toBeNull();
    expect(lessonNumberFromFileName("001.mdx.bak")).toBeNull();
    expect(lessonNumberFromFileName("index.ts")).toBeNull();
  });

  it("give each lesson its address and tell the lessons' addresses apart", () => {
    expect(lessonPath(1)).toBe("/lessons/1");
    expect(isLessonPath("/lessons/1")).toBe(true);
    expect(isLessonPath("/lessons")).toBe(true);
    expect(isLessonPath("/lessonsx")).toBe(false);
    expect(isLessonPath("/account")).toBe(false);
  });
});

describe("lessonFromModule", () => {
  const Content = () => null;

  it("takes the number from the file name and the subtitle from the lesson's header", () => {
    expect(lessonFromModule("002.mdx", { default: Content, lessonHeader: { number: 2, subtitle: "About 二." } })).toEqual({
      number: 2,
      subtitle: "About 二.",
      Content,
    });
  });

  it("refuses a lesson whose header is missing or numbered differently from its file", () => {
    expect(() => lessonFromModule("002.mdx", { default: Content })).toThrow("002.mdx has no <LessonHeader>");
    expect(() =>
      lessonFromModule("002.mdx", { default: Content, lessonHeader: { number: 3, subtitle: "x" } }),
    ).toThrow("002.mdx is Lesson 2, but its <LessonHeader> says number={3}");
    expect(() => lessonFromModule("lesson-2.mdx", { default: Content })).toThrow(
      "lesson-2.mdx is not named by its lesson number (NNN.mdx)",
    );
  });
});
