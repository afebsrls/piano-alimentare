-- ═══════════════════════════════════════════════════════════════════
-- S15 — Arrivi dal sito (misura delle conversioni sito → app)
-- I link del sito verso l'app portano ?da=<pagina>. All'apertura l'app
-- registra SOLO il nome della pagina e il giorno: nessun utente, nessun IP,
-- nessun cookie. Serve a sapere quali pagine portano persone nell'app.
-- Nessuno legge la tabella se non l'admin via funzione. Rieseguibile.
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.arrivi (
  id          bigint generated always as identity primary key,
  pagina      text not null check (length(pagina) between 1 and 120 and pagina ~ '^[a-z0-9/_-]+$'),
  giorno      date not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists idx_arrivi_giorno on public.arrivi (giorno);
alter table public.arrivi enable row level security;

drop policy if exists arrivi_insert on public.arrivi;
create policy arrivi_insert on public.arrivi for insert to anon, authenticated with check (giorno = current_date);
grant insert (pagina) on public.arrivi to anon, authenticated;
grant usage on sequence public.arrivi_id_seq to anon, authenticated;

drop function if exists public.admin_arrivi();
create or replace function public.admin_arrivi()
returns table (pagina text, oggi bigint, ultimi_7 bigint, ultimi_30 bigint, totale bigint)
language sql stable security definer set search_path = public as $$
  select a.pagina,
         count(*) filter (where a.giorno = current_date),
         count(*) filter (where a.giorno > current_date - 7),
         count(*) filter (where a.giorno > current_date - 30),
         count(*)
  from public.arrivi a
  where public.is_admin()
  group by a.pagina
  order by 4 desc, 5 desc
$$;
grant execute on function public.admin_arrivi() to authenticated;

notify pgrst, 'reload schema';
select 'arrivi pronta' as voce, count(*)::text as righe from public.arrivi;
