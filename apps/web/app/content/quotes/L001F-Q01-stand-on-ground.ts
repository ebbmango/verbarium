import type { AttestationTranslationAlignment } from "../../quote-slicer-export";

export const l001fQ01StandOnGround = {
  attestation: {
    tokens: [
      { id: 0, text: "住", pinyin: "zhu4", type: "character" },
      { id: 1, text: "也", pinyin: undefined, type: "character" },
      { id: 2, text: "。", pinyin: null, type: "punctuation" },
      { id: 3, text: "从", pinyin: "cong2", type: "character" },
      { id: 4, text: "大", pinyin: "da4", type: "character" },
      { id: 5, text: "立", pinyin: "li4", type: "character" },
      { id: 6, text: "一", pinyin: "yi1", type: "character" },
      { id: 7, text: "之", pinyin: undefined, type: "character" },
      { id: 8, text: "上", pinyin: "shang4", type: "character" },
      { id: 9, text: "。", pinyin: null, type: "punctuation" },
    ],
  },
  translation: {
    tokens: [
      { id: 0, text: "To", type: "text" },
      { id: 1, text: " ", type: "whitespace" },
      { id: 2, text: "stand", type: "text" },
      { id: 3, text: " ", type: "whitespace" },
      { id: 4, text: "still.", type: "text" },
      { id: 5, text: " ", type: "whitespace" },
      { id: 6, text: "Composed", type: "text" },
      { id: 7, text: " ", type: "whitespace" },
      { id: 8, text: "of", type: "text" },
      { id: 9, text: " ", type: "whitespace" },
      { id: 10, text: "a", type: "text" },
      { id: 11, text: " ", type: "whitespace" },
      { id: 12, text: "person", type: "text" },
      { id: 13, text: " ", type: "whitespace" },
      { id: 14, text: "standing", type: "text" },
      { id: 15, text: " ", type: "whitespace" },
      { id: 16, text: "above", type: "text" },
      { id: 17, text: " ", type: "whitespace" },
      { id: 18, text: "a", type: "text" },
      { id: 19, text: " ", type: "whitespace" },
      { id: 20, text: "horizontal", type: "text" },
      { id: 21, text: " ", type: "whitespace" },
      { id: 22, text: "stroke.", type: "text" },
    ],
  },
  alignment: {
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
    breaks: {
      attestation: [],
      translation: [6],
    },
  },
} satisfies AttestationTranslationAlignment;
