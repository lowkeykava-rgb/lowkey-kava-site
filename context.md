# Cursor Project Context / Rules

Project: **Invite‑only ordering site** for half‑gallon and gallon Kava/Kratom, plus simple subscriptions (email reminders + admin‑confirmed). Target budget: **$0–$50/mo (prefer $0)**.

## Primary Goals (MVP)
1. **Invite‑only access**: Users can only sign up with a valid invite code.
2. **Auth & Profiles**: Email-based sign up/login; minimal profile (email, name, phone optional).
3. **Menu & Ordering**: Users can choose half-gallon/gallon items (Kratom Tea, Kava) with flavors/strains; submit order.
4. **Payment choices (manual)**: After order submission, show instructions for **Cash App ($cashtag)** and **Zelle (email/phone)**. No card processing in MVP.
5. **Email notifications**: Send an email to owner with order details; send confirmation to user.
6. **Subscriptions (simple)**: User opts weekly or monthly plan; store in DB; run a scheduled job to email invoice/reminder and create a pending order automatically. Admin marks paid/fulfilled.
7. **Admin panel (basic)**: View orders, mark status (paid/fulfilled/cancelled), create/invalidate invite codes, toggle products, and manage subscriptions.

> **Compliance note (non-legal)**: Show age gate (21+), disclaimers, and availability/legality notice. Do **not** claim medical benefits. Add Terms/Privacy pages and a content disclaimer.

## Non‑Goals (for MVP)
- No online card processing (Stripe) to keep costs near $0.
- No delivery routing/labels or tax automation. (Handled manually.)
- No PII-heavy profiles beyond what’s required for contact & delivery.

## Low‑Cost Stack (preferred)
- **Framework**: Next.js 14/15 App Router (React, TypeScript).
- **DB & Auth**: **Supabase** (free tier) — Postgres, Auth (email OTP/magic link), Row Level Security.
- **Hosting**: **Vercel** (free tier) for the web app.
- **Email**: **Resend** (free tier) or provider‑agnostic SMTP via Supabase/Next.js.
- **Cron/Jobs**: Supabase **Edge Functions** or Vercel Cron for subscription reminders & nightly tasks.
- **Styling/UI**: Tailwind CSS + shadcn/ui (Button, Card, Table, Form), lucide-react icons.
- **State**: Server Actions + minimal client state; zod for validation.

## Environment Variables
```
NEXT_PUBLIC_SITE_NAME=Lowkey Kava Orders
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
NEXT_PUBLIC_CONTACT_PHONE=555-555-5555
NEXT_PUBLIC_CASHAPP_TAG=$yourtag
NEXT_PUBLIC_ZELLE_CONTACT=email@example.com
NEXT_PUBLIC_AGE_MIN=21

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email (Resend or SMTP)
EMAIL_PROVIDER=resend
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=orders@example.com
ADMIN_NOTIFY_EMAIL=you@example.com

# App
NODE_ENV=development
APP_URL=http://localhost:3000
```

## Data Model (Supabase / Postgres)
```sql
-- users: managed by Supabase Auth. Extend with a public profile table.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  phone text,
  created_at timestamp with time zone default now()
);

create table public.invites (
  code text primary key,
  issued_to_email text,
  max_uses int default 1,
  uses int default 0,
  expires_at timestamp with time zone,
  active boolean default true,
  created_at timestamp with time zone default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  size text check (size in ('half_gallon','gallon')) not null,
  description text,
  price_cents int not null,
  active boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

create type payment_method as enum ('cashapp','zelle');
create type order_status as enum ('pending','awaiting_payment','paid','fulfilled','cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null, -- array of {product_id, name, size, qty, price_cents}
  notes text,
  total_cents int not null,
  payment payment_method not null,
  status order_status default 'pending',
  confirmation_code text generated always as (
    encode(sha256((id::text || created_at::text)::bytea), 'hex')
  ) stored,
  created_at timestamp with time zone default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  interval text check (interval in ('weekly','monthly')) not null,
  price_cents int not null,
  items jsonb not null, -- default bundle composition
  active boolean default true,
  created_at timestamp with time zone default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  next_run_date date not null,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- RLS (sketch)
-- Enable RLS on all tables and:
-- profiles: user can select/update own row; admin can manage.
-- orders: user can select/insert own; admin can manage.
-- invites/products/plans: read‑only to all authenticated; write only admin.
```

## Pages & Routes (Next.js App Router)
```
/ (landing: age gate 21+, login/signup)
/invite (enter invite code -> proceed to signup)
/signup (email OTP/magic link)
/login
/menu (list products; add to cart)
/checkout (collect payment method: cashapp/zelle; show instructions & order summary; submit)
/order/[id] (order status, instructions, confirmation code)
/subscriptions (browse plans; create/cancel subscription)
/account (profile)
/admin (protected by role=admin)
  /admin/orders
  /admin/invites
  /admin/products
  /admin/plans
  /admin/subscriptions
/policies/terms
/policies/privacy
/disclaimer
```

### Components (key)
- `AgeGate`, `AuthGuard`, `InviteForm`, `ProductCard`, `CartSheet`, `CheckoutForm`, `PaymentInstructions`, `OrderStatusBadge`, `AdminTable`.

## Flows
### Invite‑only Signup
1. Unauthed user enters invite code at **/invite**.
2. Validate code: active, not expired, remaining uses.
3. If valid → proceed to **/signup** (Supabase email OTP). On first login, create `profiles` row; increment `invites.uses` and if max reached → deactivate.

### Ordering & Payment (manual)
1. From **/menu**, add items → **/checkout**.
2. Choose payment method: `cashapp` or `zelle`.
3. On submit: create `orders` row (status `awaiting_payment`), email **ADMIN_NOTIFY_EMAIL** with details + confirmation code.
4. Show **PaymentInstructions**:
   - Cash App: Display `$cashtag` + QR + exact total.
   - Zelle: Display contact email/phone + exact total.
   - Ask user to include confirmation code in memo.
5. Admin confirms payment in **/admin/orders** → set status `paid` then `fulfilled` when delivered.

### Subscriptions (simple)
- User selects plan (weekly/monthly). Creates `subscriptions` with `next_run_date`.
- **Cron (daily)** checks due subs: create an `orders` row (`awaiting_payment`) and send invoice/reminder email with payment instructions.
- Admin handles as normal.

## Emails (Resend/SMTP)
- `order_admin_notification(subject: "New Order #{shortCode}")`
- `order_user_confirmation(subject: "We got your order — {shortCode}")`
- `subscription_invoice(subject: "{PlanName} is ready — pay to schedule delivery")`

## Admin Role
- Add a `auth.users` custom claim or a `public.admins(user_id uuid primary key)` table.
- Server actions / middleware to restrict `/admin/*`.

## Seed Data (products & plans)
- Products: {Kava Half‑Gallon, Kava Gallon, Kratom Tea Half‑Gallon, Kratom Tea Gallon} with prices.
- Plans: "Weekly Kava Half" (interval=weekly, 1× half‑gallon), "Monthly Mixed" etc.

## UI/UX Notes
- Simple, mobile‑first. Neutral palette. Clear instructions on payment.
- Cart should show total and a note: "Prices include prep & local delivery window TBD via text."
- Always show 21+ and disclaimers.

## Security & Privacy
- Turn on RLS. Validate all inputs with zod. Never trust client totals; compute on server.
- Do not store payment details; store only method and memo/last 4 of confirmation if provided.
- Log audit events in Supabase (optional: table `audit_logs`).

## Cost Plan (est.)
- Vercel (Free), Supabase (Free), Resend (Free tier) → **$0** to start. If email volume grows, budget ≤ $15.

## Implementation Tasks (Cursor: generate code accordingly)
1. **Bootstrap Next.js + Tailwind + shadcn**; configure Supabase client (server & client helpers) and auth.
2. Implement DB schema (SQL above) via Supabase migrations.
3. Build **/invite** (validate code) → **/signup** flow; create `profiles` row post‑auth.
4. Build `products` listing (**/menu**) with server components; add to cart (client), show cart sheet.
5. Build **/checkout** with zod schema → server action to create `orders` and send emails.
6. Create **PaymentInstructions** UI including QR for Cash App (generate client‑side SVG QR from `cash.me/$cashtag?amount=XX.XX&note=CODE`).
7. Build **/order/[id]** page with live status.
8. Build **/subscriptions** CRUD and daily cron function (Edge Function) to generate orders & emails.
9. Build **/admin** tables & actions: invites, products, plans, orders, subscriptions.
10. Add age gate modal and disclaimers.

## Coding Standards for Cursor
- Use **TypeScript** and **Server Actions** where possible.
- Create `/lib` for helpers: `db`, `email`, `auth`, `pricing`, `qr`.
- Use `zod` for all form schemas; `react-hook-form` + `zodResolver`.
- Keep components small; prefer server components for data fetch; use `use client` only when needed.
- Write minimal tests for lib functions (price calc, invite validation).

## Example Types (TS)
```ts
export type Product = { id: string; name: string; size: 'half_gallon'|'gallon'; description?: string; price_cents: number; active: boolean };
export type CartItem = { product_id: string; name: string; size: Product['size']; qty: number; price_cents: number };
export type Order = { id: string; user_id: string; items: CartItem[]; total_cents: number; payment: 'cashapp'|'zelle'; status: 'pending'|'awaiting_payment'|'paid'|'fulfilled'|'cancelled' };
```

## Legal/Content Disclaimers (render in footer)
- "21+ only. Not medical advice. Check local laws."
- Simple Terms & Privacy links; no health claims.

## Future Upgrades (when budget allows)
- Stripe (cards, subscriptions), taxes, delivery slots, SMS updates (Twilio), address validation, inventory, receipts.

---
**Instruction for Cursor**: When the user asks for code, scaffold the Next.js/Supabase project per the above, prefer free tiers, keep it as small and reliable as possible, and do not introduce paid dependencies by default.
