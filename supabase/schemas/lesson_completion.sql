create table public.lesson_completion (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lesson smallint not null check (lesson between 1 and 177),
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson)
);

alter table public.lesson_completion enable row level security;

grant select, insert on public.lesson_completion to authenticated;

create policy "Readers see their own lesson completions"
  on public.lesson_completion for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Readers record their own lesson completions"
  on public.lesson_completion for insert to authenticated
  with check ((select auth.uid()) = user_id);
