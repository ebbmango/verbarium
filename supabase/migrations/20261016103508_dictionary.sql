-- The dictionary's master copy: headwords, their readings and senses, and which
-- readings each sense is read with. Edited in the Supabase dashboard; the
-- export script writes it into the repository for the build.

create table public.headword (
  headword text primary key,
  -- A typo guard, not a linguistic limit: the model may hold other languages.
  check (char_length(headword) between 1 and 32),
  check (headword !~ '\s')
);

-- One pronunciation of a headword, in pinyin with tone numbers: xue4, ma5 for
-- the neutral tone, v for ü (lv4), syllables separated by one space (jun1 zi3).
-- The build turns it into tone marks for display.
create table public.reading (
  id uuid primary key default gen_random_uuid(),
  headword text not null references public.headword on delete restrict,
  pinyin text not null check (pinyin ~ '^[a-z]+[1-5]( [a-z]+[1-5])*$'),
  unique (headword, pinyin)
);

-- One meaning of a headword. Its id is what flashcard history points at; its
-- key is how a dictionary page names it (<Sense key="at-once">), so a key can
-- be renamed without losing history. Senses are retired, never deleted.
create table public.sense (
  id uuid primary key default gen_random_uuid(),
  headword text not null references public.headword on delete restrict,
  key text not null check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  gloss text not null check (char_length(gloss) >= 1 and gloss = btrim(gloss)),
  -- The lesson that teaches this sense; null when no lesson does yet.
  lesson smallint check (lesson between 1 and 177),
  -- Null while the sense is active.
  retired_at timestamptz,
  unique (headword, key)
);

-- Which readings each sense is read with. Rows name their sense and reading by
-- headword, key and pinyin, so they are readable in the dashboard and a sense
-- can only meet a reading of its own headword; fixing a key or a pinyin carries
-- through. Context says where the reading is used, as in "alone" or "in
-- compounds" for a literary and a colloquial reading.
create table public.sense_reading (
  headword text not null,
  sense_key text not null,
  pinyin text not null,
  context text check (char_length(context) >= 1 and context = btrim(context)),
  primary key (headword, sense_key, pinyin),
  foreign key (headword, sense_key) references public.sense (headword, key)
    on update cascade on delete restrict,
  foreign key (headword, pinyin) references public.reading (headword, pinyin)
    on update cascade on delete restrict
);

-- Anyone may read the dictionary, signed in or not; no API role may change it.
-- It is edited in the Supabase dashboard, which works as the database owner.
alter table public.headword enable row level security;
alter table public.reading enable row level security;
alter table public.sense enable row level security;
alter table public.sense_reading enable row level security;

grant select on public.headword, public.reading, public.sense, public.sense_reading
  to anon, authenticated;

create policy "Anyone reads headwords" on public.headword
  for select to anon, authenticated using (true);
create policy "Anyone reads readings" on public.reading
  for select to anon, authenticated using (true);
create policy "Anyone reads senses" on public.sense
  for select to anon, authenticated using (true);
create policy "Anyone reads which readings a sense has" on public.sense_reading
  for select to anon, authenticated using (true);
