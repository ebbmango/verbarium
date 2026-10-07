import type { Options } from "@mdx-js/rollup";

// Vite's config loader wants the extension on imports reached from a config file.
import rehypeHanRuns from "./rehype-han-runs.ts";
import remarkLessonHeader from "./remark-lesson-header.ts";

/** How lessons compile, for the app build and for the tests alike. */
export const mdxOptions: Options = {
  remarkPlugins: [remarkLessonHeader],
  rehypePlugins: [rehypeHanRuns],
};
