import type { QuoteSlicerExport } from "../../quote-slicer-export";

export const l001hQ01DoorCrossbar = {
  meta: {
    sourceText: "門橫關也。",
    targetText: "It is the horizontal crossbar of a door.",
    provenance: "Zihui Bu",
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
      id: "c0d25bf4-9370-4224-9c90-8f5b5cf46294",
      sourceTokenIds: [3],
      targetTokenIds: [0, 2],
    },
    {
      id: "45bf81e2-8301-4a41-a31c-2fd523592e3c",
      sourceTokenIds: [0],
      targetTokenIds: [14],
    },
    {
      id: "0e199304-d627-4b1e-be41-223a5b158081",
      sourceTokenIds: [1],
      targetTokenIds: [6],
    },
    {
      id: "4bc316b0-2ed8-4a3d-8c46-85cb64fde0e3",
      sourceTokenIds: [2],
      targetTokenIds: [8],
    },
  ],
} satisfies QuoteSlicerExport;
