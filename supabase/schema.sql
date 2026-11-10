-- NorteInvest: tabelas de captação. Rode no Supabase: SQL Editor > New query > Run.
-- O servidor grava com a SERVICE ROLE KEY (somente no backend). RLS ativo e SEM policies
-- públicas: o navegador (chave anon) não consegue ler nem escrever nestas tabelas.

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists subscribers_email_key on public.subscribers (lower(email));

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  feature_interest text not null default 'Geral',
  created_at timestamptz not null default now()
);
create unique index if not exists waitlist_email_interest_key on public.waitlist (lower(email), feature_interest);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default 'duvidas',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;
alter table public.waitlist enable row level security;
alter table public.contact_messages enable row level security;
