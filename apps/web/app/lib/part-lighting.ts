/**
 * Links a character drawn in parts (`<CharacterFocus character="蒜" parts />`)
 * to the words that name those parts (`<PartWords part="艸">vegetable</PartWords>`):
 * all rest grey, and pointing at a part or its words brings both back to ink,
 * with the class `part-lit`. The words are those in the blocks beside the drawn
 * character, before or after, up to the next character drawn in parts either way.
 */
export function linkParts(block: HTMLElement): () => void {
  const groups = new Map<string, Element>();
  for (const group of block.querySelectorAll("[data-part]")) groups.set(group.getAttribute("data-part") ?? "", group);

  const blocks: Element[] = [];
  for (const step of ["previousElementSibling", "nextElementSibling"] as const) {
    for (let sibling = block[step]; sibling && !sibling.matches("[data-parts]"); sibling = sibling[step]) blocks.push(sibling);
  }
  const words = new Map<string, Element[]>();
  for (const each of blocks.flatMap((sibling) => [...sibling.querySelectorAll("[data-part-link]")])) {
    const name = each.getAttribute("data-part-link") ?? "";
    if (groups.has(name)) words.set(name, [...(words.get(name) ?? []), each]);
  }

  const cleanups: (() => void)[] = [];
  for (const [name, linked] of words) {
    const pair = [groups.get(name)!, ...linked];
    const on = () => pair.forEach((element) => element.classList.add("part-lit"));
    const off = () => pair.forEach((element) => element.classList.remove("part-lit"));
    for (const element of pair) {
      element.setAttribute("data-part-linked", "");
      element.addEventListener("pointerenter", on);
      element.addEventListener("pointerleave", off);
      cleanups.push(() => {
        element.removeEventListener("pointerenter", on);
        element.removeEventListener("pointerleave", off);
        element.removeAttribute("data-part-linked");
        element.classList.remove("part-lit");
      });
    }
  }
  return () => cleanups.forEach((cleanup) => cleanup());
}
