import mdx from "@mdx-js/rollup";
import { defineConfig } from "vitest/config";

import { mdxOptions } from "./app/mdx/options.ts";

export default defineConfig({
  plugins: [mdx(mdxOptions)],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
  },
});
