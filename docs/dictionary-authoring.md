# Dictionary authoring rules

Dictionary pages are MDX files under `apps/web/app/content/dictionary/`, one
per headword, named by it: `血.mdx` is the page for 血, at `/dictionary/血`.
They follow the [lesson authoring rules](lesson-authoring.md): no raw HTML
tags, no `className` or `style`, Chinese typed as plain characters. On top of
those, a page writes what it says about its headword with components the build
reads to make the dictionary's index, search and flashcards, so it checks them.

## A page

```mdx
<Entry>
  <Reading pinyin="xuè" />
  <Reading pinyin="xiě" />

  <Sense gloss="blood">
    The blood of people and animals.

    <Quote id="L001J-Q03" />
  </Sense>
</Entry>
```

You write no header: the page shows its headword, from the file name, with
every reading of its entries under it, and ends with links to the lessons that
display it with `<CharDisplay>` or `<CharacterFocus>` ("Lesson 1") and to the
dictionary. Readings and senses go inside their `<Entry>`, not inside a
`<Sense>`. Write each reading on its own line, as above: the page sets readings
side by side, separated by commas.

The page has two sections, in this order, whatever order you write it in:

- **The entries**, under a red "Meaning:" tag: the entries, each a numbered list of its senses' glosses. A
  page with several entries repeats each entry's readings above its list. A
  chevron by a sense folds what you wrote inside it: its writing and its
  examples, a lettered list.
- **The etymology**, under a red "Etymology:" tag: everything you write outside the entries, prose and
  quotations alike, in the order you write it. A quotation there shows under
  its source's name, in the margin.

Every Chinese character a lesson writes outside its quotations needs a page:
the characters it teaches and the ones its prose names as their parts. To list
the ones that have none yet, lesson by lesson:

```bash
pnpm missing-dictionary-pages
```

## The components

| Component | What it is for |
| --- | --- |
| `<Entry>…</Entry>` | One treatment of the headword: the readings and senses that belong together. A headword standing for genuinely different words, such as 行, has one entry per word. A page has at least one. |
| `<Reading pinyin="xuè" />` | One modern Mandarin pronunciation, in lower-case pinyin with its tone mark. Pronunciations sharing the same senses are readings of one entry, as 血's are. An entry has at least one. |
| `<Sense gloss="blood">…</Sense>` | One meaning. The gloss is its short English: the sense's line in its entry's numbered list, and what the index, search and flashcards show. The paragraphs inside explain the sense, with any usage note (a period, region or register it belongs to). An entry has at least one. |
| `<Quote id="L001J-Q01" />` | A quotation by its Quote ID. Inside a `<Sense>`, it is one of the sense's examples: a passage that uses the word in that sense, shown plainly as its Chinese, its translation and its source. A dictionary's definition, such as the *Shuowen Jiezi*'s, is not an example: write it outside the entries, in the etymology. |

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
