import { Fragment, type PropsWithChildren } from "react";

import type { QuoteSlicerExport, SourceToken, TargetToken } from "../quote-slicer-export";

type QuoteProps = {
  quote: QuoteSlicerExport;
  sourceHref?: string;
};

const leadingPunctuation = /^[\p{Ps}\p{Pi}]/u;

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

function SourceTokens({ tokens }: { tokens: SourceToken[] }) {
  return groupSourceTokens(tokens).map((group, groupIndex) => {
    const lastIndex = group[group.length - 1];
    const hasBreakAfter = lastIndex < tokens.length - 1 && tokens[lastIndex + 1].line !== tokens[lastIndex].line;

    return (
      <Fragment key={`source-group-${groupIndex}`}>
        <span className="quote-source-group">
          {group.map((tokenIndex) => {
            const token = tokens[tokenIndex];
            return (
              <span data-token-id={token.id} data-token-type={token.type} key={`source-${token.id}`}>
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

function TargetTokens({ tokens }: { tokens: TargetToken[] }) {
  return tokens.map((token, index) => {
    const isBoundaryWhitespace =
      token.type === "whitespace" && index < tokens.length - 1 && tokens[index + 1].line !== token.line;

    if (isBoundaryWhitespace) return <br key={`target-${token.id}`} />;

    return (
      <span
        className={token.type === "whitespace" ? "quote-target-whitespace" : undefined}
        data-token-id={token.id}
        data-token-type={token.type}
        key={`target-${token.id}`}
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
          <a href={sourceHref}>{provenance}</a>
        ) : (
          provenance
        )}
      </footer>
    </blockquote>
  );
}

export function Quote({ quote, sourceHref }: QuoteProps) {
  return (
    <QuoteFrame provenance={quote.meta.provenance} sourceHref={sourceHref}>
      <p lang="zh-Hant">
        <SourceTokens tokens={quote.sourceTokens} />
      </p>
      <p>
        <TargetTokens tokens={quote.targetTokens} />
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
