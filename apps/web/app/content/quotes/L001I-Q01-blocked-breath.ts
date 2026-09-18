import type { AttestationTranslationAlignment } from "../../quote-slicer-export";

export const l001iQ01BlockedBreath = {
  attestation: {
    tokens: [
      { id: 0, text: "气", pinyin: "qi4", type: "character" },
      { id: 1, text: "欲", pinyin: "yu4", type: "character" },
      { id: 2, text: "舒", pinyin: "shu1", type: "character" },
      { id: 3, text: "出", pinyin: "chu1", type: "character" },
      { id: 4, text: "。", pinyin: null, type: "punctuation" },
      { id: 5, text: "𠃑", pinyin: undefined, type: "character" },
      { id: 6, text: "上", pinyin: "shang4", type: "character" },
      { id: 7, text: "礙", pinyin: "ai4", type: "character" },
      { id: 8, text: "於", pinyin: "yu2", type: "character" },
      { id: 9, text: "一", pinyin: "yi1", type: "character" },
      { id: 10, text: "也", pinyin: "ye3", type: "character" },
      { id: 11, text: "。", pinyin: null, type: "punctuation" },
    ],
  },
  translation: {
    tokens: [
      { id: 0, text: "Air", type: "text" },
      { id: 1, text: " ", type: "whitespace" },
      { id: 2, text: "wishes", type: "text" },
      { id: 3, text: " ", type: "whitespace" },
      { id: 4, text: "to", type: "text" },
      { id: 5, text: " ", type: "whitespace" },
      { id: 6, text: "come", type: "text" },
      { id: 7, text: " ", type: "whitespace" },
      { id: 8, text: "out.", type: "text" },
      { id: 9, text: "The", type: "text" },
      { id: 10, text: " ", type: "whitespace" },
      { id: 11, text: "upward", type: "text" },
      { id: 12, text: " ", type: "whitespace" },
      { id: 13, text: "flow", type: "text" },
      { id: 14, text: " ", type: "whitespace" },
      { id: 15, text: "is", type: "text" },
      { id: 16, text: " ", type: "whitespace" },
      { id: 17, text: "blocked", type: "text" },
      { id: 18, text: " ", type: "whitespace" },
      { id: 19, text: "by", type: "text" },
      { id: 20, text: " ", type: "whitespace" },
      { id: 21, text: "the", type: "text" },
      { id: 22, text: " ", type: "whitespace" },
      { id: 23, text: "horizontal", type: "text" },
      { id: 24, text: " ", type: "whitespace" },
      { id: 25, text: "stroke.", type: "text" },
    ],
  },
  alignment: {
    mappings: [
      {
        id: "260d4e56-1d22-4fb2-b83c-71e0f1faebda",
        sourceTokenIds: [0],
        targetTokenIds: [0],
      },
      {
        id: "a5c64e6f-cc17-4fd0-b55c-14dc0252e0fe",
        sourceTokenIds: [1],
        targetTokenIds: [2],
      },
      {
        id: "4b502b94-bf72-43b6-874f-b3877c908625",
        sourceTokenIds: [2],
        targetTokenIds: [6],
      },
      {
        id: "ff5b3819-37a9-4313-af90-f6ea3b62bbda",
        sourceTokenIds: [3],
        targetTokenIds: [8],
      },
      {
        id: "2abb8f7c-9c84-419b-af32-5ff29723bdbf",
        sourceTokenIds: [5],
        targetTokenIds: [13],
      },
      {
        id: "b4fe3918-42dc-46d1-a507-ddf42dc800f9",
        sourceTokenIds: [6],
        targetTokenIds: [11],
      },
      {
        id: "835ccda4-ff64-4fa1-9b42-69e2dd4f643b",
        sourceTokenIds: [7],
        targetTokenIds: [17],
      },
      {
        id: "4073a610-fdfb-49e1-90d1-42ee25e7e4a1",
        sourceTokenIds: [8],
        targetTokenIds: [19],
      },
      {
        id: "35855a8f-b7d1-405c-95b6-3002243164db",
        sourceTokenIds: [9],
        targetTokenIds: [23, 25],
      },
      {
        id: "434b77e0-37d9-418e-a365-ab2493e20488",
        sourceTokenIds: [10],
        targetTokenIds: [15],
      },
    ],
    breaks: {
      attestation: [],
      translation: [9],
    },
  },
} satisfies AttestationTranslationAlignment;
