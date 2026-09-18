import type { AttestationTranslationAlignment } from "../../quote-slicer-export";

export const l001aQ01OneFoundation = {
  attestation: {
    tokens: [
      { id: 0, text: "一", pinyin: "yi1", type: "character" },
      { id: 1, text: "也", pinyin: undefined, type: "character" },
      { id: 2, text: "者", pinyin: undefined, type: "character" },
      { id: 3, text: "，", pinyin: null, type: "punctuation" },
      { id: 4, text: "萬", pinyin: "wan4", type: "character" },
      { id: 5, text: "物", pinyin: "wu4", type: "character" },
      { id: 6, text: "之", pinyin: "zhi1", type: "character" },
      { id: 7, text: "本", pinyin: "ben3", type: "character" },
      { id: 8, text: "也", pinyin: "ye3", type: "character" },
      { id: 9, text: "。", pinyin: null, type: "punctuation" },
    ],
  },
  translation: {
    tokens: [
      { id: 0, text: "One", type: "text" },
      { id: 1, text: " ", type: "whitespace" },
      { id: 2, text: "is", type: "text" },
      { id: 3, text: " ", type: "whitespace" },
      { id: 4, text: "the", type: "text" },
      { id: 5, text: " ", type: "whitespace" },
      { id: 6, text: "foundation", type: "text" },
      { id: 7, text: " ", type: "whitespace" },
      { id: 8, text: "of", type: "text" },
      { id: 9, text: " ", type: "whitespace" },
      { id: 10, text: "all", type: "text" },
      { id: 11, text: " ", type: "whitespace" },
      { id: 12, text: "things.", type: "text" },
    ],
  },
  alignment: {
    mappings: [
      {
        id: "b9fc86b2-c9c1-46ba-9825-876c97d5004a",
        sourceTokenIds: [0],
        targetTokenIds: [0],
      },
      {
        id: "7735dd64-a143-48e0-900d-5881ba3f5b76",
        sourceTokenIds: [6],
        targetTokenIds: [8],
      },
      {
        id: "784477b7-9ef6-4bdb-860d-538b730ee0f8",
        sourceTokenIds: [7],
        targetTokenIds: [6, 4],
      },
      {
        id: "2bbbefd2-f81f-40e0-ab74-9c2f4225ef13",
        sourceTokenIds: [5],
        targetTokenIds: [12],
      },
      {
        id: "82402ad0-492e-4a5a-8246-dd0d1d7ef84b",
        sourceTokenIds: [4],
        targetTokenIds: [10],
      },
      {
        id: "5e570f7d-382c-4685-90c7-cac03c2c6eb1",
        sourceTokenIds: [8],
        targetTokenIds: [2],
      },
    ],
    breaks: {
      attestation: [],
      translation: [],
    },
  },
} satisfies AttestationTranslationAlignment;
