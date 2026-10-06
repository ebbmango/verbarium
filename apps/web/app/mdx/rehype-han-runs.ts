/**
 * Marks Chinese in lesson prose at build time. Authors type plain characters
 * (`一`); this plugin wraps every run of Han characters that markdown put in
 * an element (a paragraph, `strong`, …) in `<span lang="zh-Hant">`, so the
 * web says what language it is and the phone build can give it the WenKai
 * font. Text a component receives directly, and text already inside an
 * element with a `lang`, is left to that component.
 */

const hanRun = /\p{Script=Han}+/gu;

type Node = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  attributes?: Array<{ type: string; name?: string }>;
  children?: Node[];
};

export default function rehypeHanRuns() {
  return (tree: Node) => {
    mark(tree, { inLanguage: false, inElement: false });
  };
}

function mark(node: Node, scope: { inLanguage: boolean; inElement: boolean }) {
  if (!node.children) return;

  node.children = node.children.flatMap((child) => {
    if (child.type === "text") {
      return scope.inElement && !scope.inLanguage ? wrapHanRuns(child) : [child];
    }
    mark(child, {
      inLanguage: scope.inLanguage || hasLanguage(child),
      inElement: child.type === "element",
    });
    return [child];
  });
}

function hasLanguage(node: Node): boolean {
  if (node.type === "element") return Boolean(node.properties?.lang);
  return node.attributes?.some((attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === "lang") ?? false;
}

function wrapHanRuns(text: Node): Node[] {
  const value = text.value ?? "";
  const parts: Node[] = [];
  let consumed = 0;

  for (const run of value.matchAll(hanRun)) {
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
