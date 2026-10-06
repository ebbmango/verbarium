import type { ComponentType, ElementType } from "react";

/** Wieger's course has this many lessons; the position indicator counts up to it. */
export const lessonsInCourse = 177;

export type Lesson = {
  number: number;
  Content: ComponentType<{ components?: Record<string, ElementType> }>;
};

// Every committed lesson, by its file name: 001.mdx is Lesson 1.
const modules = import.meta.glob<{ default: Lesson["Content"] }>("./*.mdx", { eager: true });

/** The committed lessons in course order. */
export const lessons: Lesson[] = Object.entries(modules)
  .map(([path, module]) => {
    const number = Number(/(\d+)\.mdx$/.exec(path)?.[1]);
    if (!Number.isInteger(number) || number < 1) throw new Error(`${path} is not named by its lesson number`);
    return { number, Content: module.default };
  })
  .sort((left, right) => left.number - right.number);

export function lessonByNumber(number: number): Lesson | undefined {
  return lessons.find((lesson) => lesson.number === number);
}

/** The address of a lesson: `/lessons/1`. */
export function lessonPath(number: number): string {
  return `/lessons/${number}`;
}
