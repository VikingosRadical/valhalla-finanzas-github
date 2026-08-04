-- VALHALLA Supabase schema
-- Objetivo: preparar la primera arquitectura para usuarios, finanzas y clientes/pagos.
-- Este script está pensado para copiar y ejecutar en el SQL Editor de Supabase.

-- Extensiones necesarias
create extension if not exists pgcrypto;

-- Helper para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tabla profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin', 'client', 'trainer', 'nutritionist')) default 'client',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Helper para obtener el rol del usuario autenticado sin recursión en RLS
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public, pg_temp
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

-- Tabla accounts
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  account_type text,
  currency text not null default 'CLP',
  initial_balance numeric not null default 0,
  operational boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

-- Tabla financial_movements
create table if not exists public.financial_movements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  movement_type text not null check (movement_type in ('income', 'expense')),
  scope text not null check (scope in ('personal', 'vikingos')),
  category text not null,
  description text not null,
  amount numeric not null check (amount > 0),
  movement_date date not null,
  client_id uuid,
  payment_id uuid,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_financial_movements_updated_at
before update on public.financial_movements
for each row execute function public.set_updated_at();

-- Tabla recurring_transactions
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  transaction_type text not null check (transaction_type in ('income', 'expense')),
  scope text not null check (scope in ('personal', 'vikingos')),
  category text not null,
  amount numeric not null default 0,
  frequency text not null,
  day_of_month integer,
  weekday integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_recurring_transactions_updated_at
before update on public.recurring_transactions
for each row execute function public.set_updated_at();

-- Tabla financial_goals
create table if not exists public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  target_amount numeric not null default 0,
  current_amount numeric not null default 0,
  priority integer not null default 1,
  target_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_financial_goals_updated_at
before update on public.financial_goals
for each row execute function public.set_updated_at();

-- Tabla debts
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  total_installments integer not null default 0,
  paid_installments integer not null default 0,
  installment_amount numeric not null default 0,
  payment_day integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_debts_updated_at
before update on public.debts
for each row execute function public.set_updated_at();

-- Tabla clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  birth_date date,
  weight numeric,
  height numeric,
  emergency_contact text,
  emergency_phone text,
  photo_url text,
  last_assessment date,
  next_assessment date,
  phone text,
  service text,
  schedule_notes text,
  objective text,
  injuries text,
  observations text,
  start_date date,
  renewal_date date,
  monthly_value numeric default 0,
  payment_status text check (payment_status in ('paid', 'pending', 'overdue', 'uncertain')) default 'pending',
  client_status text check (client_status in ('active', 'paused', 'uncertain', 'inactive')) default 'active',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

-- Tabla client_payments
create table if not exists public.client_payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  amount numeric not null check (amount > 0),
  payment_date date not null,
  period_start date,
  period_end date,
  payment_method text,
  status text not null check (status in ('expected', 'paid', 'late', 'cancelled')) default 'expected',
  financial_movement_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_client_payments_updated_at
before update on public.client_payments
for each row execute function public.set_updated_at();

-- Tabla client_assessments
create table if not exists public.client_assessments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  assessment_date date not null,
  weight numeric,
  fat_percentage numeric,
  muscle_mass numeric,
  waist numeric,
  hip numeric,
  chest numeric,
  arm numeric,
  thigh numeric,
  calf numeric,
  photo_urls text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_client_assessments_updated_at
before update on public.client_assessments
for each row execute function public.set_updated_at();

-- Tabla client_renewals
create table if not exists public.client_renewals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  expected_date date not null,
  renewal_date date,
  expected_amount numeric,
  status text not null check (status in ('upcoming', 'due', 'paid', 'overdue', 'cancelled')) default 'upcoming',
  payment_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_client_renewals_updated_at
before update on public.client_renewals
for each row execute function public.set_updated_at();

-- Índices recomendados para crecimiento sostenido
create index if not exists idx_profiles_role_active on public.profiles (role, active);
create index if not exists idx_accounts_owner_active on public.accounts (owner_id, active, operational);
create index if not exists idx_financial_movements_owner_date on public.financial_movements (owner_id, movement_date desc, movement_type, scope);
create index if not exists idx_financial_movements_account on public.financial_movements (account_id);
create index if not exists idx_financial_movements_client on public.financial_movements (client_id);
create index if not exists idx_financial_movements_payment on public.financial_movements (payment_id);
create index if not exists idx_recurring_owner_active on public.recurring_transactions (owner_id, active, transaction_type);
create index if not exists idx_financial_goals_owner_active on public.financial_goals (owner_id, active, target_date);
create index if not exists idx_debts_owner_active on public.debts (owner_id, active);
create index if not exists idx_clients_owner_status on public.clients (owner_id, active, payment_status, client_status);
create index if not exists idx_clients_auth_user on public.clients (auth_user_id);
create index if not exists idx_clients_renewal on public.clients (renewal_date);
create index if not exists idx_client_payments_owner_date on public.client_payments (owner_id, payment_date desc, status);
create index if not exists idx_client_payments_client on public.client_payments (client_id);
create index if not exists idx_client_assessments_client_date on public.client_assessments (client_id, assessment_date desc);
create index if not exists idx_client_renewals_client_date on public.client_renewals (client_id, expected_date desc, status);

-- Habilitar RLS
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.financial_movements enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.financial_goals enable row level security;
alter table public.debts enable row level security;
alter table public.clients enable row level security;
alter table public.client_payments enable row level security;
alter table public.client_assessments enable row level security;
alter table public.client_renewals enable row level security;

-- Políticas base
-- Admin: puede gestionar sus propios registros.
drop policy if exists profiles_admin_policy on public.profiles;
create policy profiles_admin_policy on public.profiles
for all
using (public.current_user_role() = 'admin' and id = auth.uid())
with check (public.current_user_role() = 'admin' and id = auth.uid());

drop policy if exists accounts_admin_policy on public.accounts;
create policy accounts_admin_policy on public.accounts
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

drop policy if exists financial_movements_admin_policy on public.financial_movements;
create policy financial_movements_admin_policy on public.financial_movements
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

drop policy if exists recurring_transactions_admin_policy on public.recurring_transactions;
create policy recurring_transactions_admin_policy on public.recurring_transactions
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

drop policy if exists financial_goals_admin_policy on public.financial_goals;
create policy financial_goals_admin_policy on public.financial_goals
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

drop policy if exists debts_admin_policy on public.debts;
create policy debts_admin_policy on public.debts
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

drop policy if exists clients_admin_policy on public.clients;
create policy clients_admin_policy on public.clients
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

drop policy if exists client_payments_admin_policy on public.client_payments;
create policy client_payments_admin_policy on public.client_payments
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

drop policy if exists client_assessments_admin_policy on public.client_assessments;
create policy client_assessments_admin_policy on public.client_assessments
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

drop policy if exists client_renewals_admin_policy on public.client_renewals;
create policy client_renewals_admin_policy on public.client_renewals
for all
using (public.current_user_role() = 'admin' and owner_id = auth.uid())
with check (public.current_user_role() = 'admin' and owner_id = auth.uid());

-- Cliente autenticado: solo puede leer su propio profile
create policy profiles_client_read_policy on public.profiles
for select
using (id = auth.uid());

-- Cliente autenticado: solo puede leer su ficha de cliente
create policy clients_client_read_policy on public.clients
for select
using (auth_user_id = auth.uid());

-- Cliente autenticado: solo puede leer sus evaluaciones
create policy client_assessments_client_read_policy on public.client_assessments
for select
using (client_id in (select id from public.clients where auth_user_id = auth.uid()));

-- Cliente autenticado: solo puede leer sus renovaciones
create policy client_renewals_client_read_policy on public.client_renewals
for select
using (client_id in (select id from public.clients where auth_user_id = auth.uid()));

-- Los clientes no pueden insertar, editar ni eliminar evaluaciones, renovaciones, pagos ni información financiera.
-- No se crean políticas de escritura para esas tablas; quedarán bloqueadas por defecto.

-- Trigger para crear profile básico al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, active)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'client', true)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger trg_handle_new_user
after insert on auth.users
for each row execute function public.handle_new_user();

-- Relaciones adicionales para preservar historial financiero y permitir escalabilidad
-- Se usan restricciones de referencia seguras para no perder trazabilidad en pagos o movimientos.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'financial_movements_client_id_fkey'
  ) then
    alter table public.financial_movements
      add constraint financial_movements_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete set null on update cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'financial_movements_payment_id_fkey'
  ) then
    alter table public.financial_movements
      add constraint financial_movements_payment_id_fkey
      foreign key (payment_id) references public.client_payments(id) on delete set null on update cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'client_payments_financial_movement_id_fkey'
  ) then
    alter table public.client_payments
      add constraint client_payments_financial_movement_id_fkey
      foreign key (financial_movement_id) references public.financial_movements(id) on delete set null on update cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'client_renewals_payment_id_fkey'
  ) then
    alter table public.client_renewals
      add constraint client_renewals_payment_id_fkey
      foreign key (payment_id) references public.client_payments(id) on delete set null on update cascade;
  end if;
end $$;
