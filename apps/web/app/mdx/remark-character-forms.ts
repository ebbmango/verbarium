import { attributeValue, findComponents, type MdastNode } from "./mdx-tree.ts";

function plainText(nodes: MdastNode[], fail: (message: string) => never): string {
  return nodes.map((node) => {
    if (node.type === "text") return String(node.value);
    if (node.type !== "paragraph" || !node.children?.every((child) => child.type === "text")) {
      return fail("body rows must be plain filenames separated by whitespace");
    }
    return node.children.map((child) => String(child.value)).join("");
  }).join("\n");
}

/** Compile explicit FormRows or the original source-line shorthand into form rows. */
export default function remarkCharacterForms() {
  return (tree: MdastNode, file: { path?: string }) => {
    const formRows = new Set(findComponents(tree, "FormRow"));
    for (const node of findComponents(tree, "CharacterForms")) {
      if (!node.children?.length) continue;
      const fail = (message: string): never => {
        throw new Error(`${file.path?.split(/[\\/]/).at(-1) ?? "This file"}: <CharacterForms> ${message}`);
      };
      if (["historical", "forms", "layout"].some((name) => attributeValue(node, name) !== undefined)) {
        fail("uses either body rows or historical/forms/layout props, not both");
      }
      const children = node.children.filter((child) => child.type !== "text" || String(child.value).trim());
      const explicitRows = children.some((child) => formRows.has(child));
      const lines = explicitRows ? children.map((row) => {
        if (!formRows.delete(row)) return fail("cannot mix <FormRow> with unwrapped body text");
        if (row.attributes?.length) fail("<FormRow> takes no attributes");
        const text = plainText(row.children ?? [], fail).replace(/\s+/g, " ").trim();
        if (!text) fail("<FormRow> must contain at least one entry");
        return text;
      }) : plainText(node.children, fail).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      if (!lines.length) fail("needs at least one body row");
      const current = lines.join(" ").split(/\s+/).filter((entry) => entry === "current");
      if (current.length > 1) fail("uses current at most once");
      if (current.length && (typeof attributeValue(node, "character") !== "string" || !String(attributeValue(node, "character")).trim())) {
        fail('needs a quoted character for current, as in character="示"');
      }
      node.attributes ??= [];
      node.attributes.push({ type: "mdxJsxAttribute", name: "layout", value: lines.join("\n") });
      node.children = [];
    }
    if (formRows.size) {
      throw new Error(`${file.path?.split(/[\\/]/).at(-1) ?? "This file"}: <FormRow> must be directly inside <CharacterForms>`);
    }
  };
}
