import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

import { mdxOptions } from "./app/mdx/options.ts";

const configuredBasePath = process.env.VERBARIUM_BASE_PATH || "/";
const basePath = configuredBasePath.endsWith("/")
  ? configuredBasePath
  : `${configuredBasePath}/`;

export default defineConfig({
  base: basePath,
  plugins: [mdx(mdxOptions), reactRouter()],
  server: {
    host: "0.0.0.0",
  },
  resolve: {
    tsconfigPaths: true,
  },
});
