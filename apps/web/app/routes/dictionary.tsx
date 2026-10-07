import { useState } from "react";
import { Link } from "react-router";

import { HanMarkedText, PageHeading } from "~/components/lesson";
import { dictionaryPages, dictionaryPath, glossesOf, matchesSearch } from "~/content/dictionary";

import type { Route } from "./+types/dictionary";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dictionary · Verbarium" },
    { name: "description", content: "Every character Verbarium's lessons write, with its readings and senses." },
  ];
}

const firstReading = (page: (typeof dictionaryPages)[number]) => page.entries[0].readings[0];

// In pinyin order, as a dictionary is.
const pagesInOrder = [...dictionaryPages].sort(
  (left, right) => firstReading(left).localeCompare(firstReading(right), "en") || left.headword.localeCompare(right.headword),
);

/** The dictionary index: every page, each linking to its address, and a search through them. */
export default function DictionaryIndex() {
  const [search, setSearch] = useState("");
  const found = pagesInOrder.filter((page) => matchesSearch(page, search));

  return (
    <main className="lesson-shell">
      <section className="lesson landing">
        <PageHeading
          eyebrow="Dictionary"
          title="Characters"
          subtitle={dictionaryPages.length === 1 ? "One character so far." : `${dictionaryPages.length} characters so far.`}
        />
        <form className="dictionary-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <label>
            Search by character, pinyin or meaning
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </form>
        <ul className="lesson-index dictionary-index">
          {found.map((page) => (
            <li key={page.headword}>
              <Link to={dictionaryPath(page.headword)}>
                <span className="dictionary-index-headword" lang="zh-Hant">
                  {page.headword}
                </span>
                <span className="dictionary-index-readings">
                  {page.entries.flatMap((entry) => entry.readings).join(" · ")}
                </span>
                <span className="lesson-subtitle">
                  <HanMarkedText text={glossesOf(page)} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {found.length === 0 && <p>No character matches “{search.trim()}”.</p>}
      </section>
    </main>
  );
}
