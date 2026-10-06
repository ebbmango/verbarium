import type { Options } from "@mdx-js/rollup";

import rehypeHanRuns from "./rehype-han-runs.ts";

/** How lessons compile, for the app build and for the tests alike. */
export const mdxOptions: Options = {
  rehypePlugins: [rehypeHanRuns],
};
