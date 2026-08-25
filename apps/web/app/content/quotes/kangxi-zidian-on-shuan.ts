import type { QuoteSlicerExport } from "../../quote-slicer-export";

export const kangxiZidianOnShuan = {
  meta: {
    sourceText: "門橫關也。",
    targetText: "It is the horizontal crossbar of a door.",
    provenance: "Kangxi Zidian, quoting Zihui Bu",
  },
  sourceTokens: [
    { id: 0, text: "門", pinyin: "men2", line: 0, type: "character" },
    { id: 1, text: "橫", pinyin: "heng2", line: 0, type: "character" },
    { id: 2, text: "關", pinyin: "guan1", line: 0, type: "character" },
    { id: 3, text: "也", pinyin: "ye3", line: 0, type: "character" },
    { id: 4, text: "。", pinyin: null, line: 0, type: "punctuation" },
  ],
  targetTokens: [
    { id: 0, text: "It", line: 0, type: "text" },
    { id: 1, text: " ", line: 0, type: "whitespace" },
    { id: 2, text: "is", line: 0, type: "text" },
    { id: 3, text: " ", line: 0, type: "whitespace" },
    { id: 4, text: "the", line: 0, type: "text" },
    { id: 5, text: " ", line: 0, type: "whitespace" },
    { id: 6, text: "horizontal", line: 0, type: "text" },
    { id: 7, text: " ", line: 0, type: "whitespace" },
    { id: 8, text: "crossbar", line: 0, type: "text" },
    { id: 9, text: " ", line: 0, type: "whitespace" },
    { id: 10, text: "of", line: 0, type: "text" },
    { id: 11, text: " ", line: 0, type: "whitespace" },
    { id: 12, text: "a", line: 0, type: "text" },
    { id: 13, text: " ", line: 0, type: "whitespace" },
    { id: 14, text: "door.", line: 0, type: "text" },
  ],
  mappings: [
    {
      id: "c44331e0-0bcf-4f45-a08e-90e5981b02b9",
      sourceTokenIds: [0],
      targetTokenIds: [14],
    },
    {
      id: "53d84bc6-276a-4b41-a3a9-79bf2b244d8a",
      sourceTokenIds: [1],
      targetTokenIds: [6],
    },
    {
      id: "5801623b-74ac-470a-ab0c-589655f7795a",
      sourceTokenIds: [2],
      targetTokenIds: [8],
    },
    {
      id: "43739c34-a43a-4b2f-8ca0-18a04c572b4f",
      sourceTokenIds: [3],
      targetTokenIds: [2],
    },
  ],
} satisfies QuoteSlicerExport;
