-- Kernel de autenticación del estudio VMI.
-- Rol de staff vive en public.profiles y app_metadata, nunca en user_metadata.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to postgres, service_role;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  full_name text not null,
  email text not null,
  role text not null default 'investigator',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z][a-z0-9._-]*$'),
  constraint profiles_role_allowed check (
    role = any (array['admin'::text, 'investigator'::text, 'coordinator'::text, 'staff'::text])
  ),
  constraint profiles_username_unique unique (username)
);

comment on table public.profiles is
  'Staff del estudio de ventilación mecánica invasiva. El rol autorizable vive aquí, no en user_metadata.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
  v_role text;
  v_name text;
begin
  v_username := nullif(lower(trim(new.raw_app_meta_data->>'username')), '');
  if v_username is null then
    v_username := lower(split_part(new.email, '@', 1));
  end if;

  v_role := coalesce(nullif(new.raw_app_meta_data->>'role', ''), 'staff');
  if v_role not in ('admin', 'investigator', 'coordinator', 'staff') then
    v_role := 'staff';
  end if;

  v_name := nullif(trim(new.raw_user_meta_data->>'full_name'), '');
  if v_name is null then
    v_name := v_username;
  end if;

  insert into public.profiles (id, username, full_name, email, role)
  values (new.id, v_username, v_name, new.email, v_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

create or replace function private.email_for_username(p_username text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.email
  from public.profiles as p
  join auth.users as u on u.id = p.id
  where p.username = lower(trim(p_username))
    and p.is_active
    and u.deleted_at is null
  limit 1;
$$;

create or replace function public.email_for_username(p_username text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select private.email_for_username(p_username);
$$;

comment on function public.email_for_username(text) is
  'Resuelve el email de Auth a partir del usuario. El login no usa profiles.email.';

revoke all on function public.email_for_username(text) from public;
grant execute on function public.email_for_username(text) to anon, authenticated;

revoke all on function private.email_for_username(text) from public;
revoke all on function private.handle_new_user() from public;
revoke all on function private.set_updated_at() from public;

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
