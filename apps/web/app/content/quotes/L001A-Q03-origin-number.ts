import type { AttestationTranslationAlignment } from "../../quote-slicer-export";

export const l001aQ03OriginNumber = {
  attestation: {
    tokens: [
      { id: 0, text: "一", pinyin: "yi1", type: "character" },
      { id: 1, text: "者", pinyin: undefined, type: "character" },
      { id: 2, text: "，", pinyin: null, type: "punctuation" },
      { id: 3, text: "數", pinyin: "shu4", type: "character" },
      { id: 4, text: "之", pinyin: "zhi1", type: "character" },
      { id: 5, text: "始", pinyin: "shi3", type: "character" },
      { id: 6, text: "也", pinyin: "ye3", type: "character" },
      { id: 7, text: "，", pinyin: null, type: "punctuation" },
      { id: 8, text: "物", pinyin: "wu4", type: "character" },
      { id: 9, text: "之", pinyin: "zhi1", type: "character" },
      { id: 10, text: "極", pinyin: "ji2", type: "character" },
      { id: 11, text: "也", pinyin: "ye3", type: "character" },
      { id: 12, text: "。", pinyin: null, type: "punctuation" },
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
      { id: 6, text: "origin", type: "text" },
      { id: 7, text: " ", type: "whitespace" },
      { id: 8, text: "of", type: "text" },
      { id: 9, text: " ", type: "whitespace" },
      { id: 10, text: "number", type: "text" },
      { id: 11, text: " ", type: "whitespace" },
      { id: 12, text: "and", type: "text" },
      { id: 13, text: " ", type: "whitespace" },
      { id: 14, text: "the", type: "text" },
      { id: 15, text: " ", type: "whitespace" },
      { id: 16, text: "utmost", type: "text" },
      { id: 17, text: " ", type: "whitespace" },
      { id: 18, text: "of", type: "text" },
      { id: 19, text: " ", type: "whitespace" },
      { id: 20, text: "things.", type: "text" },
    ],
  },
  alignment: {
    mappings: [
      {
        id: "9cfcfa91-70d5-40e1-8e56-e3e8f1fdc7f1",
        sourceTokenIds: [0],
        targetTokenIds: [0],
      },
      {
        id: "23bcfb73-04b7-4f4c-b9f6-6d412b66493e",
        sourceTokenIds: [5],
        targetTokenIds: [6, 4],
      },
      {
        id: "d83afeda-de52-4685-9d7f-ae0cf9519a96",
        sourceTokenIds: [3],
        targetTokenIds: [10],
      },
      {
        id: "7514de75-aa0d-439d-8fb6-02ff082e7386",
        sourceTokenIds: [4],
        targetTokenIds: [8],
      },
      {
        id: "2c6c55bb-b0fe-4ecd-9ac3-10c531a77cb5",
        sourceTokenIds: [6, 11],
        targetTokenIds: [2],
      },
      {
        id: "2fbd80c5-117f-432f-b8e0-ac928a4fa08d",
        sourceTokenIds: [10],
        targetTokenIds: [16],
      },
      {
        id: "8c3fb1e9-2ce8-48e9-8618-32a7f37061d6",
        sourceTokenIds: [8],
        targetTokenIds: [20],
      },
      {
        id: "827655c1-e934-4c77-8483-d90a60fb321f",
        sourceTokenIds: [9],
        targetTokenIds: [18],
      },
    ],
    breaks: {
      attestation: [],
      translation: [],
    },
  },
} satisfies AttestationTranslationAlignment;
