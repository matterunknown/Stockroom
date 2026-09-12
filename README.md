# Stockroom

**Commission-free wholesale order links for artisan makers.**

> Not a marketplace. Your buyers. Your link. Zero commission.

Stockroom gives makers a shareable line-sheet URL (`/w/your-brand`). Buyers
build an order, meet minimums, and pay by card via Stripe Checkout. Stockroom
takes a **$0 platform commission** on both plans — you only pay Stripe
processing fees (~2.9% + $0.30) that Stripe deducts from each charge.

- **Free — $0/mo:** 1 storefront link, up to 10 SKUs
- **Pro — $29/mo:** unlimited links & SKUs, per-buyer pricing, custom branding
  (logo + colors)

**Stockroom is the Merchant of Record.** Wholesale orders are charged through
the platform Stripe account and Pro subscriptions are charged through Stripe
Billing on that same account. For the soft launch, platform Stripe holds the
funds and Stockroom settles with makers out-of-band (maker payout / Connect
settlement will ship post-launch). There is **no Stripe Connect** in v1, **no
tax engine**, and prices are **USD only**.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM on **PostgreSQL** (local dev and production)
- Stripe Checkout (wholesale payments) + Stripe Billing (Pro subscription)
- Auth: email + password (bcrypt hashes), opaque session cookie
- Vercel-ready

## Getting started

```bash
git clone https://github.com/matterunknown/Stockroom.git
cd Stockroom
npm install
cp .env.example .env
```

Point `DATABASE_URL` at a Postgres instance — the quickest options are a local
Postgres server (e.g. `postgres://postgres:postgres@localhost:5432/stockroom`)
or a free hosted Postgres like Neon or Supabase. Then edit the rest of `.env`:

- `DATABASE_URL` — Postgres connection string, e.g.
  `postgresql://user:pass@host:5432/stockroom?schema=public`
- `SESSION_SECRET` — any long random string
- `APP_URL` — `http://localhost:3000` for local dev
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — from your Stripe test dashboard
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen` (see below)
- `STRIPE_PRO_PRICE_ID` — a recurring $29/mo Stripe Price for the Pro plan

Then create the database schema, seed the demo brand, and run the app:

```bash
npx prisma db push
npm run seed
npm run dev
```

Visit <http://localhost:3000>.

### Demo login

The seed script creates one demo maker:

- Email: `demo@stockroom.local`
- Password: `demo1234`
- Storefront: <http://localhost:3000/w/cedar-and-sage>

### Stripe webhook (local)

In another terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_…` secret it prints into `STRIPE_WEBHOOK_SECRET` and restart
`npm run dev`. The webhook handles `checkout.session.completed` (marks the
matching wholesale order as `paid`) and `customer.subscription.*` (flips the
brand's plan between `free` and `pro`).

## What&apos;s in the MVP

- Landing page + pricing page with hero copy
- Signup / login / logout (bcrypt, cookie sessions)
- Maker dashboard
  - Catalog CRUD (name, wholesale price, MOQ, unit, stock, visibility)
  - Orders view with statuses `new → paid → fulfilled` (paid flip is
    automatic via Stripe webhook; fulfilled is a manual click)
  - Plan status + Pro upgrade (Stripe Billing Checkout)
  - Branding (Pro-gated: logo + primary/accent colors)
  - Per-buyer pricing (Pro-gated: override the unit price for specific
    buyer emails; applied automatically at checkout)
- Public storefront `/w/[slug]`
  - Line sheet layout, MOQ-aware cart, no buyer account required
  - Stripe Checkout for payment
- Free-plan gates
  - `>10 SKUs` blocked → upgrade CTA to Stripe Billing
  - Additional storefront links blocked (Free is single-brand per user)
- `/api/stripe/webhook` for `checkout.session.completed`,
  `customer.subscription.created|updated|deleted`

## Out of scope for v1

Marketplace, Stripe Connect, multi-currency, tax engines, buyer accounts,
Shopify sync, freelancer invoicing.

## Postgres in production

The Prisma datasource is already `postgresql`, so production only needs a
Postgres `DATABASE_URL` (e.g.
`postgresql://user:pass@host:5432/stockroom?schema=public&sslmode=require`)
and the schema pushed / migrated:

```bash
npx prisma migrate deploy
# or, for a fresh schema push during early prototyping:
npx prisma db push
```

`npm run build` runs `prisma generate` automatically so the Postgres client is
regenerated at deploy time.

Deploying to Vercel: add every variable from `.env.example` under Project
Settings → Environment Variables, point `DATABASE_URL` at your production
Postgres, and set your production `APP_URL` and Stripe webhook endpoint
(`https://<your-domain>/api/stripe/webhook`).

## Scripts

```bash
npm run dev            # Next.js dev server
npm run build          # prisma generate + next build (required for CI)
npm run start          # production server
npm run seed           # seed the demo maker + storefront
npx prisma studio      # inspect the DB
```

## Repo

<https://github.com/matterunknown/Stockroom>
