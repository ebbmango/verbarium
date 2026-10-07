/**
 * What the compile-time plugins share: the slice of an MDX syntax tree they
 * read, finding a file's components in it, and exporting what they read.
 */

/** The slice of an MDX syntax tree the plugins need to know. */
export type MdastNode = {
  type: string;
  name?: string | null;
  value?: unknown;
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: MdastNode[];
  data?: unknown;
};

/** Every `<name>` component in `node`, itself included, in document order. */
export function findComponents(node: MdastNode, name: string): MdastNode[] {
  const found = node.name === name && node.type.startsWith("mdxJsx") ? [node] : [];
  return found.concat((node.children ?? []).flatMap((child) => findComponents(child, name)));
}

/** An attribute's value: a string when written in quotes, an expression node when in braces. */
export function attributeValue(node: MdastNode, name: string): unknown {
  return node.attributes?.find((attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === name)?.value;
}

/** `export const <name> = <value>;` for JSON data keyed by identifiers, with the syntax tree MDX compiles from. */
export function exportConst(name: string, value: unknown): MdastNode {
  return {
    type: "mdxjsEsm",
    value: `export const ${name} = ${JSON.stringify(value)};`,
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
              declarations: [{ type: "VariableDeclarator", id: { type: "Identifier", name }, init: expression(value) }],
            },
          },
        ],
      },
    },
  };
}

function expression(value: unknown): object {
  if (Array.isArray(value)) return { type: "ArrayExpression", elements: value.map(expression) };
  if (typeof value !== "object" || value === null) return { type: "Literal", value, raw: JSON.stringify(value) };

  return {
    type: "ObjectExpression",
    properties: Object.entries(value).map(([key, property]) => ({
      type: "Property",
      kind: "init",
      method: false,
      shorthand: false,
      computed: false,
      key: { type: "Identifier", name: key },
      value: expression(property),
    })),
  };
}
