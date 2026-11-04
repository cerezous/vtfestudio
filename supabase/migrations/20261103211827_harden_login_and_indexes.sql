-- El correo del staff solo lo resuelve el servicio, no el navegador.
-- El límite de intentos vive en la base para que no dependa de una sola instancia.

create table if not exists private.login_attempts (
  bucket text primary key,
  attempts integer not null,
  reset_at timestamptz not null
);

revoke all on table private.login_attempts from public, anon, authenticated;

create or replace function private.consume_login_attempt(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempts integer;
  v_reset timestamptz;
  v_bucket text := left(btrim(coalesce(p_bucket, '')), 120);
begin
  if v_bucket = ''
    or p_limit is null
    or p_limit < 1
    or p_limit > 20
    or p_window_seconds is null
    or p_window_seconds < 60
    or p_window_seconds > 3600 then
    return false;
  end if;

  select attempts, reset_at
    into v_attempts, v_reset
  from private.login_attempts
  where bucket = v_bucket
  for update;

  if not found or v_reset <= now() then
    insert into private.login_attempts (bucket, attempts, reset_at)
    values (v_bucket, 1, now() + make_interval(secs => p_window_seconds))
    on conflict (bucket) do update
      set attempts = 1,
          reset_at = excluded.reset_at;
    return true;
  end if;

  if v_attempts >= p_limit then
    return false;
  end if;

  update private.login_attempts
  set attempts = attempts + 1
  where bucket = v_bucket;

  return true;
end;
$$;

revoke all on function private.consume_login_attempt(text, integer, integer) from public;
grant execute on function private.consume_login_attempt(text, integer, integer) to service_role;

create or replace function public.consume_login_attempt(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language sql
volatile
security definer
set search_path = ''
as $$
  select private.consume_login_attempt(p_bucket, p_limit, p_window_seconds);
$$;

revoke all on function public.consume_login_attempt(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_login_attempt(text, integer, integer) to service_role;

create or replace function public.reset_login_attempt(p_bucket text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bucket text := left(btrim(coalesce(p_bucket, '')), 120);
begin
  if v_bucket = '' then
    return;
  end if;

  delete from private.login_attempts
  where bucket = v_bucket;
end;
$$;

revoke all on function public.reset_login_attempt(text) from public, anon, authenticated;
grant execute on function public.reset_login_attempt(text) to service_role;

revoke all on function public.email_for_username(text) from public, anon, authenticated;
grant execute on function public.email_for_username(text) to service_role;

revoke all on function private.delete_apache_score(uuid) from public;
revoke all on function private.delete_clinical_milestone(uuid) from public;
revoke all on function private.delete_vmi_episode(uuid) from public;
revoke all on function private.format_rut(text) from public;
revoke all on function private.upsert_apache_score(uuid, jsonb) from public;
revoke all on function private.upsert_clinical_milestone(uuid, jsonb) from public;
revoke all on function private.upsert_vmi_episode(uuid, jsonb) from public;

create index if not exists patients_created_by_idx
  on public.patients (created_by);

create index if not exists apache_scores_created_by_idx
  on public.apache_scores (created_by);

create index if not exists vmi_episodes_created_by_idx
  on public.vmi_episodes (created_by);
