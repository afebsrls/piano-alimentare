-- ═══════════════════════════════════════════════════════════════════
-- S12 — Plancia admin + ricette pubbliche
-- Da eseguire nel SQL Editor di Supabase (rieseguibile: le funzioni
-- vengono ricreate da zero, così un vecchio tipo di ritorno non blocca).
--
-- Principio: nessuna RLS viene allargata. Tutto ciò che vede l'admin
-- passa da funzioni `security definer` che controllano is_admin().
-- Il catalogo pubblico è esposto da una funzione a parte
-- (catalogo_pubblico), così `select * from ricette_utente` — che
-- alimenta il pool del generatore di ogni famiglia — NON cambia.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Chi è admin ─────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- Nessuna policy: nessuno legge/scrive la tabella direttamente.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid())
$$;
grant execute on function public.is_admin() to authenticated;

-- Primo admin (idempotente). Deve aver fatto login almeno una volta.
insert into public.admin_users (user_id)
select id from auth.users where lower(email) = 'supplyboxroma@gmail.com'
on conflict do nothing;

-- ─── 2. Ricette: scope 'pubblica' + tracciamento validazione ────────
alter table public.ricette_utente drop constraint if exists ricette_utente_scope_check;
alter table public.ricette_utente
  add constraint ricette_utente_scope_check check (scope in ('privata','famiglia','pubblica'));
alter table public.ricette_utente
  add column if not exists validata_at   timestamptz,
  add column if not exists validata_da   uuid references auth.users(id),
  add column if not exists pubblicata_at timestamptz,
  add column if not exists origine_id    uuid;   -- se copiata da un'altra ricetta

create index if not exists idx_ricette_utente_pubbliche
  on public.ricette_utente (pubblicata_at desc) where scope = 'pubblica';

-- ─── 3. Statistiche ────────────────────────────────────────────────
drop function if exists public.admin_stats();
create or replace function public.admin_stats()
returns json language plpgsql stable security definer set search_path = public as $$
declare r json;
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  with attivita as (
    select famiglia_id, max(updated_at) as t from public.famiglia_dati group by famiglia_id
    union all select famiglia_id, max(updated_at) from public.famiglia_spesa group by famiglia_id
    union all select p.famiglia_id, max(m.updated_at) from public.misure m join public.profili p on p.id = m.profilo_id group by p.famiglia_id
    union all select p.famiglia_id, max(d.updated_at) from public.profilo_dati d join public.profili p on p.id = d.profilo_id group by p.famiglia_id
  ), fam_att as (
    select famiglia_id, max(t) as ultima from attivita where famiglia_id is not null group by famiglia_id
  )
  select json_build_object(
    'utenti',           (select count(*) from public.profili where user_id is not null),
    'profili_gestiti',  (select count(*) from public.profili where user_id is null),
    'famiglie',         (select count(*) from public.famiglie),
    'famiglie_attive_7g',  (select count(*) from fam_att where ultima > now() - interval '7 days'),
    'famiglie_attive_30g', (select count(*) from fam_att where ultima > now() - interval '30 days'),
    'nuovi_utenti_30g', (select count(*) from public.profili where user_id is not null and created_at > now() - interval '30 days'),
    'ricette_utente',   (select count(*) from public.ricette_utente),
    'ricette_da_validare', (select count(*) from public.ricette_utente where validata_at is null and scope <> 'pubblica'),
    'ricette_pubbliche',(select count(*) from public.ricette_utente where scope = 'pubblica'),
    'misure_totali',    (select count(*) from public.misure)
  ) into r;
  return r;
end $$;
grant execute on function public.admin_stats() to authenticated;

-- ─── 4. Elenco utenti/famiglie ──────────────────────────────────────
drop function if exists public.admin_utenti();
create or replace function public.admin_utenti()
returns table (
  profilo_id uuid, user_id uuid, email text, nome text, sesso text,
  famiglia_id uuid, famiglia_nome text, capo_famiglia boolean,
  membri int, iscritto_il timestamptz, ultima_attivita timestamptz,
  n_ricette int, n_misure int, ultimo_login timestamptz
) language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  return query
  with attivita as (
    select famiglia_id, max(updated_at) as t from public.famiglia_dati group by famiglia_id
    union all select famiglia_id, max(updated_at) from public.famiglia_spesa group by famiglia_id
    union all select p.famiglia_id, max(m.updated_at) from public.misure m join public.profili p on p.id = m.profilo_id group by p.famiglia_id
    union all select p.famiglia_id, max(d.updated_at) from public.profilo_dati d join public.profili p on p.id = d.profilo_id group by p.famiglia_id
  ), fam_att as (
    select famiglia_id, max(t) as ultima from attivita where famiglia_id is not null group by famiglia_id
  )
  select p.id, p.user_id, u.email::text, p.nome, p.sesso,
         p.famiglia_id, f.nome, (f.created_by = p.user_id),
         (select count(*)::int from public.profili x where x.famiglia_id = p.famiglia_id),
         p.created_at,
         greatest(fa.ultima, p.updated_at, (select max(m.updated_at) from public.misure m where m.profilo_id = p.id)),
         (select count(*)::int from public.ricette_utente r where r.autore_id = p.user_id),
         (select count(*)::int from public.misure m where m.profilo_id = p.id),
         u.last_sign_in_at
  from public.profili p
  left join auth.users u on u.id = p.user_id
  left join public.famiglie f on f.id = p.famiglia_id
  left join fam_att fa on fa.famiglia_id = p.famiglia_id
  where p.user_id is not null
  order by 11 desc nulls last;
end $$;
grant execute on function public.admin_utenti() to authenticated;

-- ─── 5. Elenco ricette utente (tutte le famiglie) ───────────────────
drop function if exists public.admin_ricette();
create or replace function public.admin_ricette()
returns table (
  id uuid, titolo text, descrizione text, categoria text, prep int,
  ingredienti jsonb, quantita jsonb, kcal numeric, p numeric, c numeric, g numeric,
  stagioni jsonb, tags jsonb, scope text, esclusa boolean,
  autore_id uuid, autore_email text, autore_nome text, famiglia_nome text,
  like_count int, dislike_count int, validata_at timestamptz, pubblicata_at timestamptz,
  origine_id uuid, created_at timestamptz, updated_at timestamptz
) language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  return query
  select r.id, r.titolo, r.descrizione, r.categoria, r.prep,
         r.ingredienti, r.quantita, r.kcal, r.p, r.c, r.g,
         r.stagioni, r.tags, r.scope, r.esclusa,
         r.autore_id, u.email::text, pr.nome, f.nome,
         r.like_count, r.dislike_count, r.validata_at, r.pubblicata_at,
         r.origine_id, r.created_at, r.updated_at
  from public.ricette_utente r
  left join auth.users u on u.id = r.autore_id
  left join public.profili pr on pr.user_id = r.autore_id
  left join public.famiglie f on f.id = r.famiglia_id
  order by r.updated_at desc;
end $$;
grant execute on function public.admin_ricette() to authenticated;

-- ─── 6. Azioni admin su una ricetta ─────────────────────────────────
-- azione: 'valida' | 'pubblica' | 'ritira' (torna a famiglia) | 'annulla_validazione'
drop function if exists public.admin_ricetta_azione(uuid, text);
create or replace function public.admin_ricetta_azione(p_id uuid, p_azione text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  if p_azione = 'valida' then
    update public.ricette_utente set validata_at = now(), validata_da = auth.uid() where id = p_id;
  elsif p_azione = 'annulla_validazione' then
    update public.ricette_utente set validata_at = null, validata_da = null where id = p_id;
  elsif p_azione = 'pubblica' then
    update public.ricette_utente
      set scope = 'pubblica', pubblicata_at = now(),
          validata_at = coalesce(validata_at, now()), validata_da = coalesce(validata_da, auth.uid())
      where id = p_id;
  elsif p_azione = 'ritira' then
    update public.ricette_utente set scope = 'famiglia', pubblicata_at = null where id = p_id;
  else
    raise exception 'Azione sconosciuta: %', p_azione;
  end if;
end $$;
grant execute on function public.admin_ricetta_azione(uuid, text) to authenticated;

-- Copia una ricetta di un utente nel ricettario dell'admin (privata),
-- così può correggerla con l'editor normale e poi pubblicarla.
drop function if exists public.admin_copia_ricetta(uuid);
create or replace function public.admin_copia_ricetta(p_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_new uuid; v_fam uuid;
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  select famiglia_id into v_fam from public.profili where user_id = auth.uid();
  insert into public.ricette_utente
    (autore_id, famiglia_id, titolo, descrizione, categoria, prep, ingredienti, quantita,
     kcal, p, c, g, stagioni, tags, scope, esclusa, origine_id)
  select auth.uid(), v_fam, titolo, descrizione, categoria, prep, ingredienti, quantita,
         kcal, p, c, g, stagioni, tags, 'privata', true, id
  from public.ricette_utente where id = p_id
  returning id into v_new;
  if v_new is null then raise exception 'Ricetta non trovata'; end if;
  return v_new;
end $$;
grant execute on function public.admin_copia_ricetta(uuid) to authenticated;

-- ─── 7. Catalogo pubblico (per tutti gli utenti loggati) ────────────
-- Esposto come funzione e NON come policy: così il pool del generatore
-- (select * from ricette_utente) resta quello di famiglia.
drop function if exists public.catalogo_pubblico();
create or replace function public.catalogo_pubblico()
returns table (
  id uuid, titolo text, descrizione text, categoria text, prep int,
  ingredienti jsonb, quantita jsonb, kcal numeric, p numeric, c numeric, g numeric,
  stagioni jsonb, tags jsonb, autore_nome text, like_count int, dislike_count int,
  pubblicata_at timestamptz
) language sql stable security definer set search_path = public as $$
  select r.id, r.titolo, r.descrizione, r.categoria, r.prep,
         r.ingredienti, r.quantita, r.kcal, r.p, r.c, r.g,
         r.stagioni, r.tags, pr.nome, r.like_count, r.dislike_count, r.pubblicata_at
  from public.ricette_utente r
  left join public.profili pr on pr.user_id = r.autore_id
  where r.scope = 'pubblica' and auth.uid() is not null
  order by r.pubblicata_at desc
$$;
grant execute on function public.catalogo_pubblico() to authenticated;

-- Le ricette pubbliche di ALTRE famiglie non devono entrare nel pool:
-- la policy ricette_select esistente non include scope='pubblica', quindi
-- non cambia nulla. Verifica:
-- select policyname, qual from pg_policies where tablename='ricette_utente';

notify pgrst, 'reload schema';

-- Controllo finale
select 'admin registrati' as voce, count(*)::text as valore from public.admin_users
union all
select 'funzioni admin', count(*)::text from pg_proc where proname like 'admin_%';
