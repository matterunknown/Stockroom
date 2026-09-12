# Stockroom

**Commission-free wholesale order links for artisan makers.**

> Not a marketplace. Your buyers. Your link. Zero commission.

Stockroom gives makers a shareable line-sheet URL (`/w/your-brand`). Buyers
build an order, meet minimums, and pay by card via Stripe Checkout. You keep
100% of the sale — Stockroom takes a $0 platform commission on both plans.
You only pay Stripe processing fees (~2.9% + $0.30) directly to Stripe.

- **Free — $0/mo:** 1 storefront link, up to 10 SKUs
- **Pro — $29/mo:** unlimited links & SKUs, per-buyer pricing, custom branding
  (logo + colors)

Merchant of record for this MVP is the platform: wholesale orders are charged
through platform Stripe Checkout and Pro subscriptions are charged through
Stripe Billing. There is **no Stripe Connect** in v1, **no tax engine**, and
prices are **USD only**.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM
  - **Postgres everywhere** — local dev and production both use Postgres
  - **Production:** Neon Postgres on Vercel (see [Postgres notes](#postgres-in-production))
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

Edit `.env`:

- `DATABASE_URL` — Postgres connection string (e.g. a local Postgres or a Neon dev branch)
- `SESSION_SECRET` — any long random string
- `APP_URL` — `http://localhost:3000` for local dev
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — from your Stripe test dashboard
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen` (see below)
- `STRIPE_PRO_PRICE_ID` — a recurring $29/mo Stripe Price for the Pro plan

Then create the database, seed the demo brand, and run the app:

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

Production runs on **Neon Postgres** (via Vercel). The Prisma datasource is
already `provider = "postgresql"` and reads `DATABASE_URL`, so no schema
edits are required — just point `DATABASE_URL` at your Neon connection
string.

Initialize the production database against Neon (from your local machine,
with `DATABASE_URL` set to the Neon connection string):

```bash
# Push the current schema to Neon (fine for early / prototype deploys)
npx prisma db push

# Seed the demo brand (demo@stockroom.local / cedar-and-sage storefront)
npx prisma db seed
```

For a proper migration history, use `npx prisma migrate deploy` instead of
`db push` once you have committed migrations under `prisma/migrations/`.

`npm run build` runs `prisma generate` automatically so the client picks up
the schema at deploy time.

Deploying to Vercel: add every variable from `.env.example` under Project
Settings → Environment Variables, point `DATABASE_URL` at your Neon Postgres
connection string, and set your production `APP_URL` and Stripe webhook
endpoint (`https://<your-domain>/api/stripe/webhook`).

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
