import type { ComponentType, ElementType } from "react";

import { lessonNumberFromFileName } from "./lesson-files";

export { isLessonPath, lessonIndexPath, lessonPath } from "./lesson-files";

export type Lesson = {
  number: number;
  /** What the lesson is about, for the page's description: its header's subtitle. */
  description: string;
  Content: ComponentType<{ components?: Record<string, ElementType> }>;
};

// Each lesson's subtitle, as its LessonHeader shows it. Lessons cannot carry
// their own metadata (the authoring rules keep code out of them), so it lives here.
const descriptions: Record<number, string> = {
  1: "About the primitive 一, a single stroke.",
};

// Every committed lesson, by its file name: 001.mdx is Lesson 1.
const modules = import.meta.glob<{ default: Lesson["Content"] }>("./*.mdx", { eager: true });

/** The committed lessons in course order. */
export const lessons: Lesson[] = Object.entries(modules)
  .map(([path, module]) => {
    const fileName = path.replace(/^\.\//, "");
    const number = lessonNumberFromFileName(fileName);
    if (number === null) throw new Error(`${fileName} is not named by its lesson number (NNN.mdx)`);
    return { number, description: descriptions[number] ?? `Lesson ${number} of Verbarium's etymological lessons.`, Content: module.default };
  })
  .sort((left, right) => left.number - right.number);

lessons.forEach((lesson, index) => {
  if (lessons[index - 1]?.number === lesson.number) throw new Error(`Two lesson files are numbered ${lesson.number}`);
});

export function lessonByNumber(number: number): Lesson | undefined {
  return lessons.find((lesson) => lesson.number === number);
}
