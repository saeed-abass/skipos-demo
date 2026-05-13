-- Enable Row Level Security on all tables
alter table companies enable row level security;
alter table users enable row level security;
alter table customers enable row level security;
alter table jobs enable row level security;
alter table waste_transfer_notes enable row level security;
alter table skips enable row level security;

-- Helper function: returns the company_id for the authenticated Supabase user
-- This matches the users.id to auth.uid() so we can derive company context
create or replace function get_user_company_id()
returns text
language sql
stable
security definer
as $$
  select company_id from users where id = auth.uid()::text
$$;

-- ──────────────────────────────────────────────
-- companies
-- ──────────────────────────────────────────────

create policy "Users can view their own company"
  on companies for select
  using (id = get_user_company_id());

create policy "Admins can update their own company"
  on companies for update
  using (
    id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- ──────────────────────────────────────────────
-- users
-- ──────────────────────────────────────────────

create policy "Users can view colleagues in the same company"
  on users for select
  using (company_id = get_user_company_id());

create policy "Admins can insert users into their company"
  on users for insert
  with check (
    company_id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role = 'admin'
    )
  );

create policy "Admins can update users in their company"
  on users for update
  using (
    company_id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role = 'admin'
    )
  );

create policy "Admins can delete users from their company"
  on users for delete
  using (
    company_id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- ──────────────────────────────────────────────
-- customers
-- ──────────────────────────────────────────────

create policy "Company members can view their customers"
  on customers for select
  using (company_id = get_user_company_id());

create policy "Company members can insert customers"
  on customers for insert
  with check (company_id = get_user_company_id());

create policy "Company members can update their customers"
  on customers for update
  using (company_id = get_user_company_id());

create policy "Admins can delete customers"
  on customers for delete
  using (
    company_id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- ──────────────────────────────────────────────
-- jobs
-- ──────────────────────────────────────────────

create policy "Company members can view their jobs"
  on jobs for select
  using (company_id = get_user_company_id());

create policy "Office/admin can create jobs"
  on jobs for insert
  with check (
    company_id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role in ('admin', 'office')
    )
  );

create policy "Company members can update jobs"
  on jobs for update
  using (company_id = get_user_company_id());

create policy "Admins can delete jobs"
  on jobs for delete
  using (
    company_id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- ──────────────────────────────────────────────
-- waste_transfer_notes
-- ──────────────────────────────────────────────

create policy "Company members can view their WTNs"
  on waste_transfer_notes for select
  using (company_id = get_user_company_id());

create policy "Company members can create WTNs"
  on waste_transfer_notes for insert
  with check (company_id = get_user_company_id());

create policy "Company members can update WTNs"
  on waste_transfer_notes for update
  using (company_id = get_user_company_id());

create policy "Admins can delete WTNs"
  on waste_transfer_notes for delete
  using (
    company_id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- ──────────────────────────────────────────────
-- skips
-- ──────────────────────────────────────────────

create policy "Company members can view their skip inventory"
  on skips for select
  using (company_id = get_user_company_id());

create policy "Company members can add skips"
  on skips for insert
  with check (company_id = get_user_company_id());

create policy "Company members can update skips"
  on skips for update
  using (company_id = get_user_company_id());

create policy "Admins can delete skips"
  on skips for delete
  using (
    company_id = get_user_company_id()
    and exists (
      select 1 from users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- ──────────────────────────────────────────────
-- WTN auto-number sequence
-- Generates: WTN-2024-00001 format
-- ──────────────────────────────────────────────

create sequence if not exists wtn_number_seq start 1;

create or replace function generate_wtn_number()
returns text
language plpgsql
as $$
declare
  seq_val int;
  year_part text;
begin
  seq_val := nextval('wtn_number_seq');
  year_part := to_char(now(), 'YYYY');
  return 'WTN-' || year_part || '-' || lpad(seq_val::text, 5, '0');
end;
$$;
