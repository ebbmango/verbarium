import { describe, expect, it } from "vitest";

import { lessonByNumber, lessonPath, lessons, lessonsInCourse } from "./index";

describe("lessons", () => {
  it("lists every committed lesson by the number in its file name, in order", () => {
    expect(lessons.map((lesson) => lesson.number)).toEqual([1]);
    expect(typeof lessons[0].Content).toBe("function");
  });

  it("finds a lesson by number and nothing for one that does not exist", () => {
    expect(lessonByNumber(1)?.number).toBe(1);
    expect(lessonByNumber(2)).toBeUndefined();
    expect(lessonByNumber(Number.NaN)).toBeUndefined();
  });

  it("gives each lesson its address and counts the course", () => {
    expect(lessonPath(1)).toBe("/lessons/1");
    expect(lessonsInCourse).toBe(177);
  });
});
