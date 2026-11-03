-- ═══════════════════════════════════════════════════════════════════
-- S14 — Lista d'attesa (nutrizionisti e richieste info dal sito)
-- Il sito statico inserisce con la chiave anon; nessuno legge se non
-- l'admin via funzione. Rieseguibile.
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.lista_attesa (
  id          bigint generated always as identity primary key,
  tipo        text not null default 'nutrizionista' check (tipo in ('nutrizionista','famiglia','altro')),
  nome        text not null check (length(nome) between 2 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 200),
  citta       text check (citta is null or length(citta) <= 120),
  note        text check (note is null or length(note) <= 1000),
  origine     text check (origine is null or length(origine) <= 200),
  stato       text not null default 'nuova' check (stato in ('nuova','contattata','attivata','scartata')),
  created_at  timestamptz not null default now()
);
create unique index if not exists idx_lista_attesa_email_tipo on public.lista_attesa (lower(email), tipo);
alter table public.lista_attesa enable row level security;

-- Chiunque (anche non loggato) può iscriversi; nessuno può leggere/modificare.
drop policy if exists lista_attesa_insert on public.lista_attesa;
create policy lista_attesa_insert on public.lista_attesa for insert to anon, authenticated with check (stato = 'nuova');
grant insert on public.lista_attesa to anon, authenticated;
grant usage on sequence public.lista_attesa_id_seq to anon, authenticated;

drop function if exists public.admin_lista_attesa();
create or replace function public.admin_lista_attesa()
returns setof public.lista_attesa language sql stable security definer set search_path = public as $$
  select * from public.lista_attesa where public.is_admin() order by created_at desc
$$;
grant execute on function public.admin_lista_attesa() to authenticated;

drop function if exists public.admin_lista_attesa_stato(bigint, text);
create or replace function public.admin_lista_attesa_stato(p_id bigint, p_stato text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  update public.lista_attesa set stato = p_stato where id = p_id;
end $$;
grant execute on function public.admin_lista_attesa_stato(bigint, text) to authenticated;

notify pgrst, 'reload schema';
select 'lista_attesa pronta' as voce, count(*)::text as iscritti from public.lista_attesa;
