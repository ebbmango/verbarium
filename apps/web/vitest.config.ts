import mdx from "@mdx-js/rollup";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

import { mdxOptions } from "./app/mdx/options.ts";

export default defineConfig(({ mode }) => ({
  plugins: [mdx(mdxOptions)],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
    // The test user for the hosted project's access-rule tests, from an
    // untracked .env (TEST_USER_EMAIL, TEST_USER_PASSWORD) or CI secrets.
    env: loadEnv(mode, import.meta.dirname, "TEST_"),
  },
}));
