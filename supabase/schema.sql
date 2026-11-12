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

-- ---------------------------------------------------------------------------
-- Carteira de Investimentos & Metas em Tempo Real (Supabase Realtime)
-- Permite que o frontend escute e sincronize alterações de ativos e metas
-- ---------------------------------------------------------------------------

create table if not exists public.portfolio_positions (
  id text primary key,
  ticker text not null,
  name text not null,
  category text not null default 'acao',
  quantity numeric not null default 0,
  average_price numeric not null default 0,
  user_id text default 'anonymous',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portfolio_positions_ticker on public.portfolio_positions (ticker);
create index if not exists idx_portfolio_positions_user on public.portfolio_positions (user_id);

create table if not exists public.portfolio_goals (
  id text primary key default 'default_goal',
  goal_amount numeric not null default 2500,
  manual_deposits numeric not null default 0,
  month_key text not null,
  user_id text default 'anonymous',
  updated_at timestamptz not null default now()
);

-- SEGURANÇA: RLS ativada e SEM políticas públicas. Com a chave anon (navegador) ninguém lê nem escreve.
-- Só o servidor (SERVICE_ROLE) acessa. Para sincronizar carteira por usuário no futuro, use Supabase Auth
-- e políticas do tipo: using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id).
alter table public.portfolio_positions enable row level security;
alter table public.portfolio_goals enable row level security;

-- Remove políticas abertas de versões anteriores deste arquivo (seguro rodar de novo)
drop policy if exists "Permitir leitura pública das posições da carteira" on public.portfolio_positions;
drop policy if exists "Permitir escrita pública das posições da carteira" on public.portfolio_positions;
drop policy if exists "Permitir leitura pública das metas da carteira" on public.portfolio_goals;
drop policy if exists "Permitir escrita pública das metas da carteira" on public.portfolio_goals;

-- ---------------------------------------------------------------------------
-- Notificações de Resumo de Rebalanceamento via E-mail
-- ---------------------------------------------------------------------------

create table if not exists public.rebalance_notifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  total_current_value numeric not null default 0,
  contribution_amount numeric not null default 0,
  total_projected_value numeric not null default 0,
  rebalance_summary jsonb not null default '{}'::jsonb,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create index if not exists idx_rebalance_notifications_email on public.rebalance_notifications (lower(email));
create index if not exists idx_rebalance_notifications_created on public.rebalance_notifications (created_at desc);

alter table public.rebalance_notifications enable row level security;

-- SEGURANÇA: contém e-mails. Sem políticas públicas; o servidor insere com SERVICE_ROLE.
drop policy if exists "Permitir inserção de notificações de rebalanceamento" on public.rebalance_notifications;
drop policy if exists "Permitir leitura de notificações de rebalanceamento" on public.rebalance_notifications;

-- Habilitar publicação no canal Realtime do Supabase
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portfolio_positions'
  ) then
    alter publication supabase_realtime add table public.portfolio_positions;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portfolio_goals'
  ) then
    alter publication supabase_realtime add table public.portfolio_goals;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rebalance_notifications'
  ) then
    alter publication supabase_realtime add table public.rebalance_notifications;
  end if;
end;
$$;
