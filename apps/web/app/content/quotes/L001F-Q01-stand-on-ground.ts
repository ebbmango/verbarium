import type { QuoteSlicerExport } from "../../quote-slicer-export";

export const l001fQ01StandOnGround = {
  meta: {
    sourceText: "住也。从大立一之上。",
    targetText:
      "To stand still. Composed of a person standing above a horizontal stroke.",
    provenance: "Shuowen Jiezi",
  },
  sourceTokens: [
    { id: 0, text: "住", pinyin: "zhu4", line: 0, type: "character" },
    { id: 1, text: "也", pinyin: undefined, line: 0, type: "character" },
    { id: 2, text: "。", pinyin: null, line: 0, type: "punctuation" },
    { id: 3, text: "从", pinyin: "cong2", line: 0, type: "character" },
    { id: 4, text: "大", pinyin: "da4", line: 0, type: "character" },
    { id: 5, text: "立", pinyin: "li4", line: 0, type: "character" },
    { id: 6, text: "一", pinyin: "yi1", line: 0, type: "character" },
    { id: 7, text: "之", pinyin: undefined, line: 0, type: "character" },
    { id: 8, text: "上", pinyin: "shang4", line: 0, type: "character" },
    { id: 9, text: "。", pinyin: null, line: 0, type: "punctuation" },
  ],
  targetTokens: [
    { id: 0, text: "To", line: 0, type: "text" },
    { id: 1, text: " ", line: 0, type: "whitespace" },
    { id: 2, text: "stand", line: 0, type: "text" },
    { id: 3, text: " ", line: 0, type: "whitespace" },
    { id: 4, text: "still.", line: 0, type: "text" },
    { id: 5, text: " ", line: 0, type: "whitespace" },
    { id: 6, text: "Composed", line: 1, type: "text" },
    { id: 7, text: " ", line: 1, type: "whitespace" },
    { id: 8, text: "of", line: 1, type: "text" },
    { id: 9, text: " ", line: 1, type: "whitespace" },
    { id: 10, text: "a", line: 1, type: "text" },
    { id: 11, text: " ", line: 1, type: "whitespace" },
    { id: 12, text: "person", line: 1, type: "text" },
    { id: 13, text: " ", line: 1, type: "whitespace" },
    { id: 14, text: "standing", line: 1, type: "text" },
    { id: 15, text: " ", line: 1, type: "whitespace" },
    { id: 16, text: "above", line: 1, type: "text" },
    { id: 17, text: " ", line: 1, type: "whitespace" },
    { id: 18, text: "a", line: 1, type: "text" },
    { id: 19, text: " ", line: 1, type: "whitespace" },
    { id: 20, text: "horizontal", line: 1, type: "text" },
    { id: 21, text: " ", line: 1, type: "whitespace" },
    { id: 22, text: "stroke.", line: 1, type: "text" },
  ],
  mappings: [
    {
      id: "23174187-666a-45c4-b201-3d30eee0ab30",
      sourceTokenIds: [0],
      targetTokenIds: [2, 4, 0],
    },
    {
      id: "0cfbb2cf-9476-4b4b-9b44-068f1c4a6d3f",
      sourceTokenIds: [3],
      targetTokenIds: [6, 8],
    },
    {
      id: "ea788b1d-b580-46f8-ba93-9826ed6ad4bd",
      sourceTokenIds: [4],
      targetTokenIds: [12, 10],
    },
    {
      id: "0071581a-35a9-45e6-b538-b130e5214e83",
      sourceTokenIds: [5],
      targetTokenIds: [14],
    },
    {
      id: "52915f49-e116-42ad-aea3-57932dfb4731",
      sourceTokenIds: [6],
      targetTokenIds: [18, 20, 22],
    },
    {
      id: "d441179d-1f85-4453-a05a-135d4d664a05",
      sourceTokenIds: [8],
      targetTokenIds: [16],
    },
  ],
} satisfies QuoteSlicerExport;
