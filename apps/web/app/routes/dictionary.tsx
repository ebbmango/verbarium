import { useState } from "react";
import { Link } from "react-router";

import { HanMarkedText } from "~/components/lesson";
import { byReading, dictionaryPages, dictionaryPath, glossesOf, matchesSearch } from "~/content/dictionary";

import type { Route } from "./+types/dictionary";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dictionary · Verbarium" },
    { name: "description", content: "Every character Verbarium's lessons write, with its readings and senses." },
  ];
}

const pagesInOrder = [...dictionaryPages].sort(byReading);

/**
 * The dictionary index: a grid of tiles, one per page, each its character over
 * its first reading and linking to its address (the senses are its hover title),
 * under a search through them that leaves the grid empty when nothing matches.
 */
export default function DictionaryIndex() {
  const [search, setSearch] = useState("");
  const found = pagesInOrder.filter((page) => matchesSearch(page, search));

  return (
    <main className="lesson-shell">
      <section className="lesson landing">
        <h1 className="visually-hidden">Dictionary</h1>
        <div className="dictionary-search" role="search">
          <input
            type="search"
            aria-label="Search by character, pinyin or English"
            placeholder="Search by character, pinyin or English"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <ul className="dictionary-index">
          {found.map((page) => (
            <li key={page.headword}>
              <Link title={glossesOf(page)} to={dictionaryPath(page.headword)}>
                <span className="dictionary-index-headword" lang="zh-Hant">
                  {page.headword}
                </span>
                <span className="dictionary-index-reading">{page.entries[0].readings[0]}</span>
                <span className="visually-hidden">
                  <HanMarkedText text={glossesOf(page)} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
