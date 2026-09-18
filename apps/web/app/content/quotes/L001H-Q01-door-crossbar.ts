import type { AttestationTranslationAlignment } from "../../quote-slicer-export";

export const l001hQ01DoorCrossbar = {
  attestation: {
    tokens: [
      { id: 0, text: "門", pinyin: "men2", type: "character" },
      { id: 1, text: "橫", pinyin: "heng2", type: "character" },
      { id: 2, text: "關", pinyin: "guan1", type: "character" },
      { id: 3, text: "也", pinyin: "ye3", type: "character" },
      { id: 4, text: "。", pinyin: null, type: "punctuation" },
    ],
  },
  translation: {
    tokens: [
      { id: 0, text: "It", type: "text" },
      { id: 1, text: " ", type: "whitespace" },
      { id: 2, text: "is", type: "text" },
      { id: 3, text: " ", type: "whitespace" },
      { id: 4, text: "the", type: "text" },
      { id: 5, text: " ", type: "whitespace" },
      { id: 6, text: "horizontal", type: "text" },
      { id: 7, text: " ", type: "whitespace" },
      { id: 8, text: "crossbar", type: "text" },
      { id: 9, text: " ", type: "whitespace" },
      { id: 10, text: "of", type: "text" },
      { id: 11, text: " ", type: "whitespace" },
      { id: 12, text: "a", type: "text" },
      { id: 13, text: " ", type: "whitespace" },
      { id: 14, text: "door.", type: "text" },
    ],
  },
  alignment: {
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
    breaks: {
      attestation: [],
      translation: [],
    },
  },
} satisfies AttestationTranslationAlignment;
