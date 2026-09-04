import type { Config } from "@react-router/dev/config";

const configuredBasePath = process.env.VERBARIUM_BASE_PATH || "/";
const basePath = configuredBasePath.endsWith("/")
  ? configuredBasePath
  : `${configuredBasePath}/`;

export default {
  basename: basePath,
  prerender: true,
  ssr: false,
} satisfies Config;
