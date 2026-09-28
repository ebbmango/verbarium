create table public.provenance (
  id uuid primary key default gen_random_uuid(),
  title text,
  author text,
  publication_year integer
);

create table public.passage (
  id uuid primary key default gen_random_uuid(),
  provenance_id uuid not null references public.provenance(id)
);

create table public.attestation (
  id uuid primary key default gen_random_uuid(),
  passage_id uuid not null references public.passage(id),
  provenance_id uuid not null references public.provenance(id),
  tokens jsonb not null,
  witness_url text
);

create table public.translation (
  id uuid primary key default gen_random_uuid(),
  passage_id uuid not null references public.passage(id),
  provenance_id uuid references public.provenance(id),
  tokens jsonb not null,
  witness_url text
);

create table public.alignment (
  attestation_id uuid not null references public.attestation(id),
  translation_id uuid not null references public.translation(id),
  mappings jsonb not null,
  breaks jsonb not null,
  primary key (attestation_id, translation_id)
);

alter table public.provenance enable row level security;
alter table public.passage enable row level security;
alter table public.attestation enable row level security;
alter table public.translation enable row level security;
alter table public.alignment enable row level security;
