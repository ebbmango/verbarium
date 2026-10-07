/**
 * Makes a lesson's own `<LessonHeader number={1} subtitle="…" />` the one
 * place its number and subtitle are written. At compile time this plugin
 * reads the header and exports it from the lesson module as `lessonHeader`,
 * so the lesson registry, the lesson index and the page description use the
 * same text without code in the lesson file. MDX without a LessonHeader is
 * left alone.
 */

export type LessonHeaderData = { number: number; subtitle: string };

/** The slice of an MDX syntax tree this plugin needs to know. */
export type MdastNode = {
  type: string;
  name?: string | null;
  value?: unknown;
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: MdastNode[];
  data?: unknown;
};

export default function remarkLessonHeader() {
  return (tree: MdastNode, file: { path?: string }) => {
    const where = file.path ?? "This lesson";
    const headers = (tree.children ?? []).filter(
      (node) => node.type === "mdxJsxFlowElement" && node.name === "LessonHeader",
    );
    if (headers.length === 0) return;
    if (headers.length > 1) throw new Error(`${where}: a lesson has one <LessonHeader>, this one has ${headers.length}`);

    const header = headers[0];
    const data: LessonHeaderData = {
      number: numberAttribute(header, where),
      subtitle: textAttribute(header, "subtitle", where),
    };
    tree.children?.push(exportConst("lessonHeader", data));
  };
}

function attribute(node: MdastNode, name: string) {
  return node.attributes?.find((candidate) => candidate.type === "mdxJsxAttribute" && candidate.name === name);
}

function numberAttribute(node: MdastNode, where: string): number {
  const value = attribute(node, "number")?.value as { type?: string; value?: string } | undefined;
  const text = value?.type === "mdxJsxAttributeValueExpression" ? (value.value ?? "").trim() : "";
  if (!/^\d+$/.test(text)) throw new Error(`${where}: <LessonHeader> needs a lesson number, as in number={1}`);
  return Number(text);
}

function textAttribute(node: MdastNode, name: string, where: string): string {
  const value = attribute(node, name)?.value;
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${where}: <LessonHeader> needs a ${name} in quotes, as in ${name}="About the primitive 一, a single stroke."`);
  }
  return value;
}

/** An `export const name = { … }` node, with the syntax tree MDX compiles from. */
function exportConst(name: string, data: Record<string, string | number>): MdastNode {
  const literal = (value: string | number) => ({ type: "Literal", value, raw: JSON.stringify(value) });

  return {
    type: "mdxjsEsm",
    value: `export const ${name} = ${JSON.stringify(data)};`,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        comments: [],
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [],
            source: null,
            attributes: [],
            declaration: {
              type: "VariableDeclaration",
              kind: "const",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: { type: "Identifier", name },
                  init: {
                    type: "ObjectExpression",
                    properties: Object.entries(data).map(([key, value]) => ({
                      type: "Property",
                      kind: "init",
                      method: false,
                      shorthand: false,
                      computed: false,
                      key: { type: "Identifier", name: key },
                      value: literal(value),
                    })),
                  },
                },
              ],
            },
          },
        ],
      },
    },
  };
}
