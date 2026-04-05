-- Admin + membership migration for 90DRA
-- Run after the initial migration.sql

-- ============================================
-- Add admin/membership columns to profiles
-- ============================================
alter table profiles
  add column if not exists membership_status text default 'free' check (membership_status in ('free', 'basic', 'premium', 'lifetime')),
  add column if not exists payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'trial', 'expired', 'refunded')),
  add column if not exists payment_date timestamptz,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists payment_amount numeric,
  add column if not exists last_login_at timestamptz,
  add column if not exists notes text;

-- ============================================
-- is_admin() helper (SECURITY DEFINER avoids RLS recursion)
-- ============================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false);
$$;

-- ============================================
-- Admin RLS policies on profiles
-- ============================================
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;
drop policy if exists "Admins can delete profiles" on profiles;

create policy "Admins can view all profiles" on profiles
  for select using (auth.uid() = id or is_admin());

create policy "Admins can update all profiles" on profiles
  for update using (auth.uid() = id or is_admin());

create policy "Admins can delete profiles" on profiles
  for delete using (is_admin());

-- ============================================
-- Last login tracker
-- ============================================
create or replace function public.update_last_login()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.profiles set last_login_at = now() where id = new.user_id;
  return new;
end;
$$;

-- ============================================
-- Ensure existing users have default values
-- ============================================
update profiles
set membership_status = coalesce(membership_status, 'free'),
    payment_status = coalesce(payment_status, 'unpaid')
where membership_status is null or payment_status is null;
