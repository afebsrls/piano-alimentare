-- ═══════════════════════════════════════════════════════════════════
-- S13 — Nutrizionisti + plancia admin esplorabile
-- Da eseguire nel SQL Editor di Supabase (rieseguibile).
-- Richiede S12 (is_admin).
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Tabelle ──────────────────────────────────────────────────────
create table if not exists public.nutrizionisti (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  nome          text not null,
  studio        text,
  citta         text,
  codice        text not null unique,              -- codice che il paziente inserisce
  stato         text not null default 'attesa' check (stato in ('attesa','attivo','sospeso')),
  created_at    timestamptz not null default now()
);
create table if not exists public.nutrizionista_pazienti (
  nutrizionista_id uuid not null references public.nutrizionisti(user_id) on delete cascade,
  paziente_id      uuid not null references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  primary key (nutrizionista_id, paziente_id)
);
create unique index if not exists idx_paziente_un_solo_nutrizionista on public.nutrizionista_pazienti(paziente_id);

create table if not exists public.messaggi (
  id               bigint generated always as identity primary key,
  nutrizionista_id uuid not null references public.nutrizionisti(user_id) on delete cascade,
  paziente_id      uuid not null references auth.users(id) on delete cascade,
  mittente         uuid not null references auth.users(id),
  testo            text not null check (length(testo) between 1 and 4000),
  letto            boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists idx_messaggi_conv on public.messaggi(nutrizionista_id, paziente_id, created_at);

-- Target imposto dal nutrizionista: l'app lo usa al posto del calcolo
-- automatico quando presente. {kcal,p,c,g,nota,quando}
alter table public.profili add column if not exists target_nutrizionista jsonb;

alter table public.nutrizionisti enable row level security;
alter table public.nutrizionista_pazienti enable row level security;
alter table public.messaggi enable row level security;

-- Il nutrizionista vede la propria riga; il paziente vede quella del suo nutrizionista.
drop policy if exists nutr_select on public.nutrizionisti;
create policy nutr_select on public.nutrizionisti for select using (
  user_id = auth.uid()
  or exists (select 1 from public.nutrizionista_pazienti np where np.nutrizionista_id = nutrizionisti.user_id and np.paziente_id = auth.uid())
);
drop policy if exists np_select on public.nutrizionista_pazienti;
create policy np_select on public.nutrizionista_pazienti for select using (nutrizionista_id = auth.uid() or paziente_id = auth.uid());

-- Messaggi: entrambe le parti leggono; scrive solo una parte della conversazione, come mittente.
drop policy if exists msg_select on public.messaggi;
create policy msg_select on public.messaggi for select using (nutrizionista_id = auth.uid() or paziente_id = auth.uid());
drop policy if exists msg_insert on public.messaggi;
create policy msg_insert on public.messaggi for insert with check (
  mittente = auth.uid()
  and (nutrizionista_id = auth.uid() or paziente_id = auth.uid())
  and exists (select 1 from public.nutrizionista_pazienti np where np.nutrizionista_id = messaggi.nutrizionista_id and np.paziente_id = messaggi.paziente_id)
);
drop policy if exists msg_update on public.messaggi;
create policy msg_update on public.messaggi for update using (nutrizionista_id = auth.uid() or paziente_id = auth.uid());

-- Realtime sui messaggi (ignora l'errore se già aggiunta)
do $$ begin
  alter publication supabase_realtime add table public.messaggi;
exception when duplicate_object then null; end $$;

-- ─── 2. Ruolo ────────────────────────────────────────────────────────
drop function if exists public.is_nutrizionista();
create or replace function public.is_nutrizionista()
returns json language sql stable security definer set search_path = public as $$
  select coalesce((select json_build_object('nome', nome, 'studio', studio, 'codice', codice, 'stato', stato)
                   from public.nutrizionisti where user_id = auth.uid()), 'null'::json)
$$;
grant execute on function public.is_nutrizionista() to authenticated;

-- Registrazione (stato 'attesa' finché l'admin non attiva)
drop function if exists public.nutrizionista_registra(text, text, text);
create or replace function public.nutrizionista_registra(p_nome text, p_studio text, p_citta text)
returns json language plpgsql security definer set search_path = public as $$
declare v_code text; v_row public.nutrizionisti;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  if length(trim(p_nome)) < 2 then raise exception 'Nome mancante'; end if;
  loop
    v_code := 'NUT-' || upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.nutrizionisti where codice = v_code);
  end loop;
  insert into public.nutrizionisti (user_id, nome, studio, citta, codice)
  values (auth.uid(), trim(p_nome), nullif(trim(p_studio), ''), nullif(trim(p_citta), ''), v_code)
  on conflict (user_id) do update set nome = excluded.nome, studio = excluded.studio, citta = excluded.citta
  returning * into v_row;
  return json_build_object('nome', v_row.nome, 'studio', v_row.studio, 'codice', v_row.codice, 'stato', v_row.stato);
end $$;
grant execute on function public.nutrizionista_registra(text, text, text) to authenticated;

-- ─── 3. Paziente: collega / scollega ────────────────────────────────
drop function if exists public.paziente_collega(text);
create or replace function public.paziente_collega(p_codice text)
returns json language plpgsql security definer set search_path = public as $$
declare v_n public.nutrizionisti;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  select * into v_n from public.nutrizionisti where codice = upper(trim(p_codice));
  if not found then raise exception 'Codice non valido'; end if;
  if v_n.stato <> 'attivo' then raise exception 'Il profilo di questo nutrizionista non è ancora attivo'; end if;
  if v_n.user_id = auth.uid() then raise exception 'Non puoi collegarti a te stesso'; end if;
  delete from public.nutrizionista_pazienti where paziente_id = auth.uid();
  insert into public.nutrizionista_pazienti (nutrizionista_id, paziente_id) values (v_n.user_id, auth.uid());
  return json_build_object('nome', v_n.nome, 'studio', v_n.studio);
end $$;
grant execute on function public.paziente_collega(text) to authenticated;

drop function if exists public.paziente_scollega();
create or replace function public.paziente_scollega()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.nutrizionista_pazienti where paziente_id = auth.uid();
  update public.profili set target_nutrizionista = null where user_id = auth.uid();
end $$;
grant execute on function public.paziente_scollega() to authenticated;

drop function if exists public.paziente_mio_nutrizionista();
create or replace function public.paziente_mio_nutrizionista()
returns json language sql stable security definer set search_path = public as $$
  select coalesce((select json_build_object('user_id', n.user_id, 'nome', n.nome, 'studio', n.studio, 'dal', np.created_at)
                   from public.nutrizionista_pazienti np join public.nutrizionisti n on n.user_id = np.nutrizionista_id
                   where np.paziente_id = auth.uid()), 'null'::json)
$$;
grant execute on function public.paziente_mio_nutrizionista() to authenticated;

-- ─── 4. Nutrizionista: pazienti e dettaglio ─────────────────────────
-- Dettaglio completo di un profilo (usato sia dal nutrizionista sul suo
-- paziente, sia dall'admin su chiunque). Restituisce un json.
drop function if exists public.dettaglio_profilo(uuid);
create or replace function public.dettaglio_profilo(p_profilo_id uuid)
returns json language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare v_p public.profili; v_ok boolean; r json;
begin
  select * into v_p from public.profili where id = p_profilo_id;
  if not found then raise exception 'Profilo non trovato'; end if;
  v_ok := public.is_admin()
       or exists (select 1 from public.nutrizionista_pazienti np where np.nutrizionista_id = auth.uid() and np.paziente_id = v_p.user_id);
  if not v_ok then raise exception 'Non autorizzato'; end if;
  select json_build_object(
    'profilo', json_build_object('id', v_p.id, 'user_id', v_p.user_id, 'nome', v_p.nome, 'sesso', v_p.sesso,
       'data_nascita', v_p.data_nascita, 'peso', v_p.peso, 'altezza', v_p.altezza, 'lavoro', v_p.lavoro,
       'allenamenti', v_p.allenamenti, 'obiettivo', v_p.obiettivo, 'dieta_intensita', v_p.dieta_intensita,
       'peso_target', v_p.peso_target, 'target_nutrizionista', v_p.target_nutrizionista,
       'created_at', v_p.created_at, 'updated_at', v_p.updated_at,
       'email', (select u.email from auth.users u where u.id = v_p.user_id),
       'ultimo_login', (select u.last_sign_in_at from auth.users u where u.id = v_p.user_id)),
    'famiglia', (select json_build_object('id', f.id, 'nome', f.nome, 'created_at', f.created_at,
                   'membri', (select json_agg(json_build_object('id', m.id, 'nome', m.nome, 'sesso', m.sesso, 'user_id', m.user_id, 'data_nascita', m.data_nascita) order by m.created_at)
                              from public.profili m where m.famiglia_id = f.id))
                 from public.famiglie f where f.id = v_p.famiglia_id),
    'misure', (select coalesce(json_agg(json_build_object('data', m.data, 'valori', m.valori) order by m.data), '[]'::json)
               from public.misure m where m.profilo_id = v_p.id),
    'dati', (select coalesce(json_object_agg(d.chiave, json_build_object('valore', d.valore, 'updated_at', d.updated_at)), '{}'::json)
             from public.profilo_dati d where d.profilo_id = v_p.id),
    'ricette', (select coalesce(json_agg(json_build_object('id', r.id, 'titolo', r.titolo, 'categoria', r.categoria, 'kcal', r.kcal, 'scope', r.scope, 'created_at', r.created_at) order by r.created_at desc), '[]'::json)
                from public.ricette_utente r where r.autore_id = v_p.user_id),
    'nutrizionista', (select json_build_object('nome', n.nome, 'studio', n.studio, 'dal', np.created_at)
                      from public.nutrizionista_pazienti np join public.nutrizionisti n on n.user_id = np.nutrizionista_id
                      where np.paziente_id = v_p.user_id)
  ) into r;
  return r;
end $$;
grant execute on function public.dettaglio_profilo(uuid) to authenticated;

drop function if exists public.nutrizionista_pazienti();
create or replace function public.nutrizionista_pazienti()
returns table (profilo_id uuid, user_id uuid, nome text, sesso text, email text, dal timestamptz,
               n_misure int, ultima_misura date, ultimo_peso numeric, target_nutrizionista jsonb,
               non_letti int, ultima_attivita timestamptz)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not exists (select 1 from public.nutrizionisti where user_id = auth.uid() and stato = 'attivo') then
    raise exception 'Profilo nutrizionista non attivo';
  end if;
  return query
  select p.id, p.user_id, p.nome, p.sesso, u.email::text, np.created_at,
         (select count(*)::int from public.misure m where m.profilo_id = p.id),
         (select max(m.data) from public.misure m where m.profilo_id = p.id),
         (select replace(m.valori->>'peso', ',', '.')::numeric from public.misure m where m.profilo_id = p.id and (m.valori->>'peso') ~ '^[0-9]+([.,][0-9]+)?$' order by m.data desc limit 1),
         p.target_nutrizionista,
         (select count(*)::int from public.messaggi x where x.nutrizionista_id = auth.uid() and x.paziente_id = p.user_id and x.mittente = p.user_id and not x.letto),
         greatest(p.updated_at, (select max(d.updated_at) from public.profilo_dati d where d.profilo_id = p.id), (select max(m.updated_at) from public.misure m where m.profilo_id = p.id))
  from public.nutrizionista_pazienti np
  join public.profili p on p.user_id = np.paziente_id
  left join auth.users u on u.id = p.user_id
  where np.nutrizionista_id = auth.uid()
  order by 12 desc nulls last;
end $$;
grant execute on function public.nutrizionista_pazienti() to authenticated;

-- Il nutrizionista imposta (o azzera, con null) il target del paziente
drop function if exists public.nutrizionista_imposta_target(uuid, jsonb);
create or replace function public.nutrizionista_imposta_target(p_paziente_id uuid, p_target jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.nutrizionista_pazienti where nutrizionista_id = auth.uid() and paziente_id = p_paziente_id) then
    raise exception 'Non è un tuo paziente';
  end if;
  if p_target is not null and (p_target->>'kcal')::numeric not between 800 and 6000 then
    raise exception 'kcal fuori intervallo';
  end if;
  update public.profili
     set target_nutrizionista = case when p_target is null then null else p_target || jsonb_build_object('quando', now(), 'da', auth.uid()) end
   where user_id = p_paziente_id;
end $$;
grant execute on function public.nutrizionista_imposta_target(uuid, jsonb) to authenticated;

-- ─── 5. Admin: famiglie, nutrizionisti, attivazione ─────────────────
drop function if exists public.admin_famiglie();
create or replace function public.admin_famiglie()
returns table (id uuid, nome text, invite_code text, created_at timestamptz, capo_email text,
               membri int, registrati int, ultima_attivita timestamptz, piano_aggiornato timestamptz, spunte_spesa int)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  return query
  select f.id, f.nome, f.invite_code, f.created_at, (select u.email::text from auth.users u where u.id = f.created_by),
         (select count(*)::int from public.profili p where p.famiglia_id = f.id),
         (select count(*)::int from public.profili p where p.famiglia_id = f.id and p.user_id is not null),
         greatest((select max(updated_at) from public.famiglia_dati d where d.famiglia_id = f.id),
                  (select max(updated_at) from public.famiglia_spesa s where s.famiglia_id = f.id),
                  (select max(m.updated_at) from public.misure m join public.profili p on p.id = m.profilo_id where p.famiglia_id = f.id)),
         (select d.updated_at from public.famiglia_dati d where d.famiglia_id = f.id and d.chiave = 'piano'),
         (select count(*)::int from public.famiglia_spesa s where s.famiglia_id = f.id and s.checked)
  from public.famiglie f
  order by 8 desc nulls last;
end $$;
grant execute on function public.admin_famiglie() to authenticated;

drop function if exists public.admin_famiglia_dettaglio(uuid);
create or replace function public.admin_famiglia_dettaglio(p_id uuid)
returns json language sql stable security definer set search_path = public as $$
  select case when public.is_admin() then json_build_object(
    'famiglia', (select json_build_object('id', f.id, 'nome', f.nome, 'invite_code', f.invite_code, 'created_at', f.created_at) from public.famiglie f where f.id = p_id),
    'membri', (select coalesce(json_agg(json_build_object('id', p.id, 'nome', p.nome, 'sesso', p.sesso, 'user_id', p.user_id, 'data_nascita', p.data_nascita, 'peso', p.peso, 'altezza', p.altezza, 'obiettivo', p.obiettivo,
                 'n_misure', (select count(*) from public.misure m where m.profilo_id = p.id)) order by p.created_at), '[]'::json) from public.profili p where p.famiglia_id = p_id),
    'dati', (select coalesce(json_object_agg(d.chiave, json_build_object('updated_at', d.updated_at, 'dimensione', length(d.valore::text))), '{}'::json) from public.famiglia_dati d where d.famiglia_id = p_id),
    'spesa', (select json_build_object('settimane', count(distinct s.settimana), 'spuntati', count(*) filter (where s.checked), 'ultima', max(s.updated_at)) from public.famiglia_spesa s where s.famiglia_id = p_id),
    'ricette', (select coalesce(json_agg(json_build_object('id', r.id, 'titolo', r.titolo, 'categoria', r.categoria, 'scope', r.scope, 'created_at', r.created_at) order by r.created_at desc), '[]'::json) from public.ricette_utente r where r.famiglia_id = p_id)
  ) else null end
$$;
grant execute on function public.admin_famiglia_dettaglio(uuid) to authenticated;

drop function if exists public.admin_nutrizionisti();
create or replace function public.admin_nutrizionisti()
returns table (user_id uuid, email text, nome text, studio text, citta text, codice text, stato text, created_at timestamptz, n_pazienti int, n_messaggi int)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  return query
  select n.user_id, u.email::text, n.nome, n.studio, n.citta, n.codice, n.stato, n.created_at,
         (select count(*)::int from public.nutrizionista_pazienti np where np.nutrizionista_id = n.user_id),
         (select count(*)::int from public.messaggi m where m.nutrizionista_id = n.user_id)
  from public.nutrizionisti n left join auth.users u on u.id = n.user_id
  order by n.created_at desc;
end $$;
grant execute on function public.admin_nutrizionisti() to authenticated;

drop function if exists public.admin_nutrizionista_stato(uuid, text);
create or replace function public.admin_nutrizionista_stato(p_user_id uuid, p_stato text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo admin'; end if;
  if p_stato not in ('attesa','attivo','sospeso') then raise exception 'Stato non valido'; end if;
  update public.nutrizionisti set stato = p_stato where user_id = p_user_id;
end $$;
grant execute on function public.admin_nutrizionista_stato(uuid, text) to authenticated;

-- Statistiche: aggiunge i nutrizionisti
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
    'misure_totali',    (select count(*) from public.misure),
    'nutrizionisti',    (select count(*) from public.nutrizionisti),
    'nutrizionisti_attesa', (select count(*) from public.nutrizionisti where stato = 'attesa'),
    'pazienti_collegati', (select count(*) from public.nutrizionista_pazienti),
    'messaggi_7g',      (select count(*) from public.messaggi where created_at > now() - interval '7 days')
  ) into r;
  return r;
end $$;
grant execute on function public.admin_stats() to authenticated;

notify pgrst, 'reload schema';

select 'tabelle nutrizionisti' as voce, count(*)::text as valore from information_schema.tables where table_schema='public' and table_name in ('nutrizionisti','nutrizionista_pazienti','messaggi')
union all select 'funzioni nutrizionista', count(*)::text from pg_proc where proname like 'nutrizionista_%' or proname like 'paziente_%'
union all select 'funzioni admin', count(*)::text from pg_proc where proname like 'admin_%';
