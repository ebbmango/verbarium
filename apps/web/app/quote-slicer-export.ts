export type SourceToken = {
  id: number;
  text: string;
  line: number;
  type: "character" | "punctuation" | "number" | "symbol";
  pinyin?: string | null;
};

export type TargetToken = {
  id: number;
  text: string;
  line: number;
  type: "text" | "hanzi" | "punctuation" | "whitespace";
};

export type QuoteMapping = {
  id: string;
  sourceTokenIds: number[];
  targetTokenIds: number[];
};

export type QuoteSlicerExport = {
  meta: {
    sourceText: string;
    targetText: string;
    provenance: string;
  };
  sourceTokens: SourceToken[];
  targetTokens: TargetToken[];
  mappings: QuoteMapping[];
};
