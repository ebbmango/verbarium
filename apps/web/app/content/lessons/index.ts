import type { ComponentType, ElementType } from "react";

import type { LessonHeaderData } from "../../mdx/remark-lesson-header";
import { lessonNumberFromFileName } from "./lesson-files";

export { isLessonPath, lessonIndexPath, lessonPath, lessonsInCourse } from "./lesson-files";

export type Lesson = {
  number: number;
  /** The lesson's subtitle, as its own LessonHeader writes it; also the page description. */
  subtitle: string;
  /** The characters it displays with CharDisplay and CharacterFocus. */
  displayedCharacters: string[];
  Content: ComponentType<{ components?: Record<string, ElementType> }>;
};

export type LessonModule = { default: Lesson["Content"]; lessonHeader?: LessonHeaderData; displayedCharacters?: string[] };

/** One lesson from its file: the number comes from the file name and must match its header's. */
export function lessonFromModule(fileName: string, module: LessonModule): Lesson {
  const number = lessonNumberFromFileName(fileName);
  if (number === null) throw new Error(`${fileName} is not named by its lesson number (NNN.mdx)`);

  const header = module.lessonHeader;
  if (!header) throw new Error(`${fileName} has no <LessonHeader>`);
  if (header.number !== number) {
    throw new Error(`${fileName} is Lesson ${number}, but its <LessonHeader> says number={${header.number}}`);
  }
  return { number, subtitle: header.subtitle, displayedCharacters: module.displayedCharacters ?? [], Content: module.default };
}

// Every committed lesson, by its file name: 001.mdx is Lesson 1.
const modules = import.meta.glob<LessonModule>("./*.mdx", { eager: true });

/** The committed lessons in course order. */
export const lessons: Lesson[] = Object.entries(modules)
  .map(([path, module]) => lessonFromModule(path.replace(/^\.\//, ""), module))
  .sort((left, right) => left.number - right.number);

lessons.forEach((lesson, index) => {
  if (lessons[index - 1]?.number === lesson.number) throw new Error(`Two lesson files are numbered ${lesson.number}`);
});

export function lessonByNumber(number: number): Lesson | undefined {
  return lessons.find((lesson) => lesson.number === number);
}
