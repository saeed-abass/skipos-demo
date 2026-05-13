# SkipOS

UK skip hire operations management SaaS — jobs, drivers, inventory, and Waste Transfer Notes in one platform.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS**
- **Supabase** — PostgreSQL database + authentication
- **Prisma ORM** — type-safe database access

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine for dev)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local` with values from your Supabase project:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `DATABASE_URL` | Supabase → Settings → Database → Transaction pooler URI (port **6543**) — append `?pgbouncer=true` |
| `DIRECT_URL` | Supabase → Settings → Database → Direct connection URI (port **5432**) |

### 4. Push the database schema

```bash
npx prisma db push
```

This syncs the Prisma schema to your Supabase database without running migrations.

### 5. Apply RLS policies

In the Supabase SQL Editor, run the contents of:

```
supabase/migrations/20240101000000_rls_policies.sql
```

This enables Row Level Security so every user can only see their own company's data.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
/app                    Next.js App Router pages
/components             Reusable UI components (to be built)
/lib
  /supabase
    client.ts           Browser Supabase client
    server.ts           Server Component Supabase client
    middleware.ts       Session refresh middleware
  prisma.ts             Prisma client singleton
/prisma
  schema.prisma         Database schema
/supabase
  /migrations           SQL migrations (RLS policies, sequences)
/types
  index.ts              Shared TypeScript interfaces
middleware.ts           Next.js middleware (auth guard)
```

## Database Schema

| Table | Description |
|---|---|
| `companies` | Tenant — each skip hire company is one row |
| `users` | Staff accounts linked to a company |
| `customers` | End customers who book skips |
| `jobs` | Deliveries, collections, exchanges, wait-and-load |
| `waste_transfer_notes` | EA-compliant WTNs with DEFRA submission tracking |
| `skips` | Physical skip inventory with live status |

## RLS Model

All tables are protected by Row Level Security. The `get_user_company_id()` helper function resolves the authenticated Supabase user to their `company_id`, and every policy uses this to filter rows. Users never see data belonging to another company.

Role-based write access:
- **Admin** — full CRUD on all resources
- **Office** — can create/update jobs, customers, WTNs
- **Driver** — read-only + can update job status

## Useful Commands

```bash
npm run db:studio       # Open Prisma Studio (visual DB browser)
npm run db:generate     # Regenerate Prisma client after schema changes
npm run db:migrate      # Create a new migration file
```
