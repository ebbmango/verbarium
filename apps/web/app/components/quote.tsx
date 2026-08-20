import { Fragment, type CSSProperties, type PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";

import type { QuoteSlicerExport, SourceToken, TargetToken } from "../quote-slicer-export";

type QuoteProps = {
  quote: QuoteSlicerExport;
  sourceHref?: string;
};

const leadingPunctuation = /^[\p{Ps}\p{Pi}]/u;
const coldHighlightDelay = 500;
const warmHighlightDelay = 300;
const highlightWarmthGrace = 500;

type MappingIndexes = {
  source: Map<number, string>;
  target: Map<number, string>;
};

type TokenInteraction = {
  activeMappingId: string | null;
  mappingIndexes: MappingIndexes;
  onTokenPointerEnter: (mappingId: string | null) => void;
};

function activeTokenStyle(mappingId: string | undefined, activeMappingId: string | null): CSSProperties | undefined {
  return mappingId === activeMappingId ? { color: "var(--red)" } : undefined;
}

function tokenClassName(
  baseClassName: string | undefined,
  mappingId: string | undefined,
  activeMappingId: string | null,
): string | undefined {
  const classNames = [baseClassName, mappingId === activeMappingId ? "quote-token-active" : undefined];
  return classNames.filter(Boolean).join(" ") || undefined;
}

function groupSourceTokens(tokens: SourceToken[]): number[][] {
  const groups: number[][] = [];
  let currentGroup: number[] | null = null;
  let pendingLeadingPunctuation: number[] = [];

  const flushCurrentGroup = () => {
    if (currentGroup) groups.push(currentGroup);
    currentGroup = null;
  };

  const flushPendingLeadingPunctuation = () => {
    if (pendingLeadingPunctuation.length > 0) groups.push(pendingLeadingPunctuation);
    pendingLeadingPunctuation = [];
  };

  tokens.forEach((token, index) => {
    const isPunctuation = token.type === "punctuation";
    const isLeading = isPunctuation && leadingPunctuation.test(token.text);

    if (isLeading) {
      if (
        pendingLeadingPunctuation.length > 0 &&
        tokens[pendingLeadingPunctuation[0]].line !== token.line
      ) {
        flushPendingLeadingPunctuation();
      }
      flushCurrentGroup();
      pendingLeadingPunctuation.push(index);
      return;
    }

    if (isPunctuation) {
      if (currentGroup && tokens[currentGroup[0]].line === token.line) {
        currentGroup.push(index);
      } else {
        flushCurrentGroup();
        flushPendingLeadingPunctuation();
        groups.push([index]);
      }
      return;
    }

    flushCurrentGroup();
    if (
      pendingLeadingPunctuation.length > 0 &&
      tokens[pendingLeadingPunctuation[0]].line === token.line
    ) {
      currentGroup = [...pendingLeadingPunctuation, index];
      pendingLeadingPunctuation = [];
    } else {
      flushPendingLeadingPunctuation();
      currentGroup = [index];
    }
  });

  flushCurrentGroup();
  flushPendingLeadingPunctuation();
  return groups;
}

function SourceTokens({ interaction, tokens }: { interaction: TokenInteraction; tokens: SourceToken[] }) {
  return groupSourceTokens(tokens).map((group, groupIndex) => {
    const lastIndex = group[group.length - 1];
    const hasBreakAfter = lastIndex < tokens.length - 1 && tokens[lastIndex + 1].line !== tokens[lastIndex].line;

    return (
      <Fragment key={`source-group-${groupIndex}`}>
        <span className="quote-source-group">
          {group.map((tokenIndex) => {
            const token = tokens[tokenIndex];
            const mappingId = interaction.mappingIndexes.source.get(token.id);
            return (
              <span
                className={tokenClassName(undefined, mappingId, interaction.activeMappingId)}
                data-token-id={token.id}
                data-token-type={token.type}
                key={`source-${token.id}`}
                onPointerEnter={() => interaction.onTokenPointerEnter(mappingId ?? null)}
                style={activeTokenStyle(mappingId, interaction.activeMappingId)}
              >
                {token.text}
              </span>
            );
          })}
        </span>
        {hasBreakAfter ? <br /> : null}
      </Fragment>
    );
  });
}

function TargetTokens({ interaction, tokens }: { interaction: TokenInteraction; tokens: TargetToken[] }) {
  return tokens.map((token, index) => {
    const isBoundaryWhitespace =
      token.type === "whitespace" && index < tokens.length - 1 && tokens[index + 1].line !== token.line;

    if (isBoundaryWhitespace) return <br key={`target-${token.id}`} />;

    const mappingId = interaction.mappingIndexes.target.get(token.id);

    return (
      <span
        className={tokenClassName(
          token.type === "whitespace" ? "quote-target-whitespace" : undefined,
          mappingId,
          interaction.activeMappingId,
        )}
        data-token-id={token.id}
        data-token-type={token.type}
        key={`target-${token.id}`}
        onPointerEnter={
          token.type === "whitespace" ? undefined : () => interaction.onTokenPointerEnter(mappingId ?? null)
        }
        style={activeTokenStyle(mappingId, interaction.activeMappingId)}
      >
        {token.text}
      </span>
    );
  });
}

type QuoteFrameProps = PropsWithChildren<{
  provenance?: string;
  sourceHref?: string;
  sourcePending?: boolean;
}>;

function QuoteFrame({ children, provenance, sourceHref, sourcePending = false }: QuoteFrameProps) {
  return (
    <blockquote className="lesson-quote">
      {children}
      <footer className={sourcePending ? "quote-source quote-source-pending" : "quote-source"}>
        {sourcePending ? (
          "Source pending"
        ) : sourceHref ? (
          <a href={sourceHref} rel="noopener noreferrer" target="_blank">
            {provenance}
          </a>
        ) : (
          provenance
        )}
      </footer>
    </blockquote>
  );
}

export function Quote({ quote, sourceHref }: QuoteProps) {
  const [activeMappingId, setActiveMappingId] = useState<string | null>(null);
  const pointerMapping = useRef<string | null>(null);
  const warm = useRef(false);
  const lightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mappingIndexes = useMemo<MappingIndexes>(() => {
    const source = new Map<number, string>();
    const target = new Map<number, string>();

    quote.mappings.forEach((mapping) => {
      mapping.sourceTokenIds.forEach((tokenId) => source.set(tokenId, mapping.id));
      mapping.targetTokenIds.forEach((tokenId) => target.set(tokenId, mapping.id));
    });

    return { source, target };
  }, [quote.mappings]);

  const clearLightTimer = () => {
    if (lightTimer.current !== null) {
      clearTimeout(lightTimer.current);
      lightTimer.current = null;
    }
  };

  const clearGraceTimer = () => {
    if (graceTimer.current !== null) {
      clearTimeout(graceTimer.current);
      graceTimer.current = null;
    }
  };

  const startGrace = () => {
    clearGraceTimer();
    graceTimer.current = setTimeout(() => {
      graceTimer.current = null;
      warm.current = false;
    }, highlightWarmthGrace);
  };

  const onTokenPointerEnter = (mappingId: string | null) => {
    if (mappingId === pointerMapping.current) return;
    pointerMapping.current = mappingId;
    clearLightTimer();

    if (mappingId === null) {
      if (activeMappingId !== null) startGrace();
      setActiveMappingId(null);
      return;
    }

    lightTimer.current = setTimeout(() => {
      lightTimer.current = null;
      setActiveMappingId(mappingId);
      warm.current = true;
      clearGraceTimer();
    }, warm.current ? warmHighlightDelay : coldHighlightDelay);
  };

  useEffect(() => {
    pointerMapping.current = null;
    warm.current = false;
    setActiveMappingId(null);

    return () => {
      clearLightTimer();
      clearGraceTimer();
    };
  }, [quote]);

  const interaction = { activeMappingId, mappingIndexes, onTokenPointerEnter };

  return (
    <QuoteFrame provenance={quote.meta.provenance} sourceHref={sourceHref}>
      <p lang="zh-Hant" onPointerLeave={() => onTokenPointerEnter(null)}>
        <SourceTokens interaction={interaction} tokens={quote.sourceTokens} />
      </p>
      <p onPointerLeave={() => onTokenPointerEnter(null)}>
        <TargetTokens interaction={interaction} tokens={quote.targetTokens} />
      </p>
    </QuoteFrame>
  );
}

type LegacyQuoteProps = PropsWithChildren<{
  source?: string;
  sourceHref?: string;
  sourcePending?: boolean;
}>;

export function LegacyQuote({ children, source, sourceHref, sourcePending = false }: LegacyQuoteProps) {
  return (
    <QuoteFrame provenance={source} sourceHref={sourceHref} sourcePending={sourcePending}>
      {children}
    </QuoteFrame>
  );
}
