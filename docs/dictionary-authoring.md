# Dictionary authoring rules

Dictionary pages are MDX files under `apps/web/app/content/dictionary/`, one
per headword, named by it: `血.mdx` is the page for 血. They follow the
[lesson authoring rules](lesson-authoring.md): no raw HTML tags, no
`className` or `style`, Chinese typed as plain characters. On top of those, a
page writes what it says about its headword with components the build reads
to make the dictionary's index, search and flashcards, so it checks them.

## A page

```mdx
<Entry>
  <Reading pinyin="xuè" />
  <Reading pinyin="xiě" />

  <Sense gloss="blood">
    The blood of people and animals.

    <Quote id="L001J-Q01" />
  </Sense>
</Entry>
```

The page has no header: its file name is its headword. Prose may come
before, between and after entries.

## The components

| Component | What it is for |
| --- | --- |
| `<Entry>…</Entry>` | One treatment of the headword: the readings and senses that belong together. A headword standing for genuinely different words, such as 行, has one entry per word. A page has at least one. |
| `<Reading pinyin="xuè" />` | One modern Mandarin pronunciation, in lower-case pinyin with its tone mark. Pronunciations sharing the same senses are readings of one entry, as 血's are. An entry has at least one. |
| `<Sense gloss="blood">…</Sense>` | One meaning. The gloss is the short English the index, search and flashcards show; the paragraphs inside explain the meaning, with any usage note (a period, region or register it belongs to). An entry has at least one. |
| `<Quote id="L001J-Q01" />` | A quotation by its Quote ID. Inside a `<Sense>`, it is an example of that sense. |

## What the build checks

The build fails, naming the page's file, when:

- the file name is not the headword in Chinese characters;
- the page has no `<Entry>`, or an entry has no `<Reading>` or no `<Sense>`;
- a `pinyin` is not lower-case pinyin with its tone mark: `xuè`, not
  `xue4`, `xue` or `Xuè`;
- a `<Sense>` has no `gloss`;
- a `<Quote>` names a Quote ID that no quotation file carries.
