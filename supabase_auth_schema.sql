-- Auth schema for Dashboard MktNaMoral
-- Execute in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text,
  role text not null default 'admin',
  is_active boolean not null default true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_app_users_email on public.app_users (email);
create index if not exists idx_app_users_is_active on public.app_users (is_active);

create or replace function public.set_updated_at_app_users()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_app_users on public.app_users;
create trigger trg_set_updated_at_app_users
before update on public.app_users
for each row
execute function public.set_updated_at_app_users();

-- Optional admin bootstrap:
-- Replace values before running in production.
insert into public.app_users (email, password_hash, full_name, role, is_active)
values (
  'marketingnamoral@gmail.com',
  crypt('N@Mor@l2025#', gen_salt('bf', 10)),
  'Administrador',
  'admin',
  true
)
on conflict (email) do nothing;
