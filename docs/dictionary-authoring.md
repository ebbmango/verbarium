# Dictionary authoring rules

Dictionary pages are MDX files under `apps/web/app/content/dictionary/`, one
per headword, named by it: `血.mdx` is the page for 血, at `/dictionary/血`.
They follow the [lesson authoring rules](lesson-authoring.md): no raw HTML
tags, no `className` or `style`, Chinese typed as plain characters. On top of
those, a page writes what it says about its headword with components the build
reads to make the dictionary's index, search and flashcards, so it checks them.
Lesson components such as `<Commentary>` and `<CharacterForms>` work here too.

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

The page has no header: its file name is its headword. Readings and senses go
inside their `<Entry>`, not inside a `<Sense>`; prose may come before, between
and after entries.

## The components

| Component | What it is for |
| --- | --- |
| `<Entry>…</Entry>` | One treatment of the headword: the readings and senses that belong together. A headword standing for genuinely different words, such as 行, has one entry per word. A page has at least one. |
| `<Reading pinyin="xuè" />` | One modern Mandarin pronunciation, in lower-case pinyin with its tone mark. Pronunciations sharing the same senses are readings of one entry, as 血's are. An entry has at least one. |
| `<Sense gloss="blood">…</Sense>` | One meaning. The gloss is the short English the index, search and flashcards show; the paragraphs inside explain the sense, with any usage note (a period, region or register it belongs to). An entry has at least one. |
| `<Quote id="L001J-Q01" />` | A quotation by its Quote ID. Inside a `<Sense>`, it is an example of that sense. |

## What the build checks

A page that breaks a rule fails to compile, naming its file. The tests compile
every committed page, so a broken page also stops the deploy. It fails when:

- the file name is not the headword in Chinese characters, or is a look-alike
  such as the radical `⾎` copied from a PDF instead of `血`;
- the page has no `<Entry>`, or an entry has no `<Reading>` or no `<Sense>`;
- a `<Reading>` or `<Sense>` is outside an `<Entry>` or inside a `<Sense>`, or
  an `<Entry>` is inside another;
- a `pinyin` is not one lower-case pinyin syllable with its tone mark where
  pinyin puts it: `xuè`, not `xue4`, `xue`, `Xuè` or `xùe`. A neutral-tone
  reading (了 `le`) is not supported yet;
- a `<Sense>` has no `gloss`;
- a `<Quote>` writes its Quote ID in braces, or names one that no quotation
  file carries.
