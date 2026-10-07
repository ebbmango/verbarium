declare module "*.mdx" {
  import type { ComponentType, ElementType } from "react";

  import type { LessonHeaderData } from "~/mdx/remark-lesson-header";

  const MDXContent: ComponentType<{
    components?: Record<string, ElementType>;
  }>;

  /** A lesson's number and subtitle, read from its LessonHeader at compile time (app/mdx/remark-lesson-header.ts). */
  export const lessonHeader: LessonHeaderData | undefined;

  /** The characters a lesson displays, read at compile time (app/mdx/remark-lesson-characters.ts). */
  export const displayedCharacters: string[] | undefined;

  export default MDXContent;
}
