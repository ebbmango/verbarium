import mdx from "@mdx-js/rollup";
import { join } from "node:path";
import type { ComponentType, ElementType } from "react";
import * as runtime from "react/jsx-runtime";

import { mdxOptions } from "../mdx/options";
import type { DictionaryPageData } from "../mdx/remark-dictionary-page";

const transform = mdx({ ...mdxOptions, outputFormat: "function-body" }).transform as (
  source: string,
  path: string,
) => Promise<{ code: string }>;

export const dictionaryDirectory = join(import.meta.dirname, "../content/dictionary");

/** Compiles MDX as the build does, as if it were the file at `path`, and runs it for its exports. */
export async function compileDictionaryPage(source: string, path = join(dictionaryDirectory, "血.mdx")) {
  const { code } = await transform(source, path);
  return new Function(code)(runtime) as {
    default: ComponentType<{ components?: Record<string, ElementType> }>;
    dictionaryPage?: DictionaryPageData;
  };
}
