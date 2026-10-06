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

/** Han characters with the CJK punctuation blocks; a run must contain Han. */
const hanRun = /[\p{Script=Han}　-〿＀-￯]+/gu;
const han = /\p{Script=Han}/u;

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
  const value = text.value ?? "";
  const parts: HastNode[] = [];
  let consumed = 0;

  for (const run of value.matchAll(hanRun)) {
    if (!han.test(run[0])) continue;
    if (run.index > consumed) parts.push({ type: "text", value: value.slice(consumed, run.index) });
    parts.push({
      type: "element",
      tagName: "span",
      properties: { lang: "zh-Hant" },
      children: [{ type: "text", value: run[0] }],
    });
    consumed = run.index + run[0].length;
  }

  if (parts.length === 0) return [text];
  if (consumed < value.length) parts.push({ type: "text", value: value.slice(consumed) });
  return parts;
}
