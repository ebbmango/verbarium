/**
 * Marks Chinese in lesson prose at build time. Authors type plain characters
 * (`一`); this plugin wraps every run of Han characters that markdown put in
 * an element (a paragraph, `strong`, …) in `<span lang="zh-Hant">`, so the
 * web says what language it is and the phone build can give it the WenKai
 * font. Chinese punctuation touching a run stays inside it, so a screen
 * reader does not switch voice mid-phrase. Text a component receives
 * directly, and text already inside an element marked as Chinese, is left
 * to that component.
 */

import { splitHanRuns } from "../lib/han-runs.ts";

/** The slice of a hast or MDX tree this plugin needs to know. */
export type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: HastNode[];
};

export default function rehypeHanRuns() {
  return (tree: HastNode) => {
    mark(tree, { inChinese: false, inElement: false });
  };
}

function mark(node: HastNode, scope: { inChinese: boolean; inElement: boolean }) {
  if (!node.children) return;

  node.children = node.children.flatMap((child) => {
    if (child.type === "text") {
      return scope.inElement && !scope.inChinese ? wrapHanRuns(child) : [child];
    }
    mark(child, {
      inChinese: scope.inChinese || isMarkedChinese(child),
      inElement: child.type === "element",
    });
    return [child];
  });
}

function isMarkedChinese(node: HastNode): boolean {
  const lang =
    node.type === "element"
      ? node.properties?.lang
      : node.attributes?.find((attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === "lang")?.value;
  return typeof lang === "string" && lang.startsWith("zh");
}

function wrapHanRuns(text: HastNode): HastNode[] {
  const runs = splitHanRuns(text.value ?? "");
  if (!runs.some((run) => run.chinese)) return [text];

  return runs.map((run) =>
    run.chinese
      ? { type: "element", tagName: "span", properties: { lang: "zh-Hant" }, children: [{ type: "text", value: run.text }] }
      : { type: "text", value: run.text },
  );
}
