# Tuna Bay Resort Website

Full-stack resort website for **Tuna Bay Resort** (Taurama, Port Moresby, Papua New Guinea). Built as a React + Vite frontend with an Express API backend. Includes booking, rooms, facilities, menu, gallery, testimonials, admin/staff dashboards, and scaffolded payment + email integrations.

## Overview

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, React Router 7
- **Backend**: Express 5 (TypeScript, run via `nodemon`/`ts-node` in dev), JWT auth, rate limiting, Helmet, CORS
- **Data**: in-memory mock database seeded on server start (dev). Dependencies for Neon/Postgres and SQLite are present but the active runtime uses the mock store in `server/index.ts`.
- **Payments**: Stripe scaffold with automatic mock fallback when keys are not configured
- **Email**: Nodemailer/SMTP scaffold with console fallback when SMTP is not configured

## Quick Start

```bash
npm install
cp .env.example .env   # optional — mock defaults work without it

# Terminal 1: API server (default :5000)
npm run server

# Terminal 2: Vite dev server (default :8443, proxies /api → :5000)
npm run dev
```

- App: `http://localhost:8443/`
- API: `http://localhost:5000/`
- API health: `GET /api/health`

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Vite dev server (HMR) |
| `npm run server` | `nodemon server/index.ts` | Express API with reload |
| `npm run build` | `vite build` | Production frontend build → `dist/` |
| `npm run preview` | `vite preview` | Preview production build |
| `npm run format` | `oxfmt` | Format code |

## Environment Configuration

Copy `.env.example` to `.env`. The app runs without any secrets using mock payment/email providers.

```env
# Server
PORT=5000
JWT_SECRET=dev-secret-change-me
ALLOWED_ORIGINS=http://localhost:8443,http://localhost:3004

# Payment gateway (Stripe) — leave unset for mock provider
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLIC_KEY=

# Email (SMTP) — leave unset to log emails to server console
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=hello@tunabayresort.com
```

### Provider behavior

| Integration | Configured when | Fallback |
|---|---|---|
| **Payments** | `STRIPE_SECRET_KEY` starts with `sk_` | Mock: returns `status: paid`, `transactionId: MOCK-*`, no redirect |
| **Email** | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` set | Console: logs `To/Subject/Body` to server stdout |
| **Database** | n/a (mock in-memory) | Seed data created on server start; resets on restart |

## Features

### Public site
- **Home** — hero, about teaser, offerings, facilities preview, guest reviews marquee, booking modal, location/contact
- **About** — resort story
- **Rooms & Rates** — room cards from `/api/rooms` + **Room Availability** calendar showing booked (pending/confirmed, non-cancelled) dates
- **Facilities** — facility cards from `/api/facilities`
- **Menu** — tabbed menu (food/drinks/venue hire) from `/api/menu`
- **Gallery** — images from `/api/gallery`
- **Booking** — reservation form with validation, availability check, confirmation screen, and payment action
- **Location** — address, contact, map, enquiry form
- **Search** — client-side search across rooms/facilities/menu/gallery
- **Sitemap / 404**

### Booking flow
1. Guest submits booking (`POST /api/booking`) with name, phone, email, type, dates, party/room details.
2. Server validates required fields, generates `reference` (`TB-XXXXXX`), stores booking as `pending`, returns full booking object.
3. If `email` is provided, a **confirmation email** is sent (SMTP or console fallback).
4. Confirmation screen shows reference and, for room bookings with an estimated total, a **Pay** button.
5. `POST /api/payments/create-session` creates a Stripe Checkout session (redirects) or a mock paid result.
6. Admin/staff can confirm/cancel via `PUT /api/bookings/:id`; status changes trigger **status emails**.

### Payments (scaffold)
- **Module**: `server/payments.ts`
- **Provider detection**: `STRIPE_SECRET_KEY` present → Stripe; otherwise mock.
- **Stripe**: creates Checkout Session (`mode: payment`, card), returns `checkoutUrl`; webhook signature verification via `STRIPE_WEBHOOK_SECRET`.
- **Mock**: returns `{ provider:'mock', status:'paid', transactionId:'MOCK-*' }` — safe for local/dev without keys.
- **Endpoints**:
  - `POST /api/payments/create-session` — create checkout/mock payment
  - `POST /api/payments/webhook` — Stripe webhook (raw body + signature)
  - `GET /api/payments/config` — returns `{ provider, publishableKey }` for client use

> **Production note**: set real Stripe keys, configure the webhook endpoint, and switch currency/amount rules to match your pricing. The current mock uses the estimated room total in PGK (K).

### Email notifications (scaffold)
- **Module**: `server/emails.ts`
- **Transport**: Nodemailer SMTP when configured; console logging otherwise.
- **Templates**: booking confirmation, booking status (confirmed/cancelled), reminder.
- **Triggers**:
  - Booking created → confirmation email to guest (if email provided)
  - Booking status updated to confirmed/cancelled → status email
  - `POST /api/emails/reminder` → manual/scheduled reminder hook (integrate with a cron/job runner in production)

### Availability
- **Endpoint**: `GET /api/availability?room=<name|slug>&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD`
- **Logic**: returns `available: false` if any non-cancelled booking for the same room overlaps the requested range.
- **UI**: `src/components/CalendarView.tsx` renders a month view; `Rooms.tsx` shows booked room-booking dates.

### Guest reviews (post-stay gated)
- **Public form**: `src/components/ReviewForm.tsx` — name, rating, text, optional `bookingReference`.
- **Server rule** (`POST /api/testimonials`): if `bookingReference` is provided, it must exist and the booking’s checkout (or date) must be in the past; reviews are stored with `approved: false`.
- **Admin**: `/admin/testimonials` lists all reviews, approves, and deletes.
- **Public display**: Home fetches approved testimonials (`GET /api/testimonials`).

### Admin & staff
- **Auth**: `POST /api/auth/login` returns JWT; admin/staff login pages store token.
- **Seed users** (dev/mock): `admin@tunabay.com` (admin), `staff@tunabay.com` (staff). **Passwords are bcrypt-hashed server-side only.** Set `ADMIN_SEED_PASSWORD`/`STAFF_SEED_PASSWORD` in server env (production generates a random password if unset — set env and reseed). Manage via Admin/`/api/users`.
- **Admin dashboard** (`/admin/*`): overview, bookings (table + calendar), rooms, facilities, menu, gallery, testimonials, users, settings.
- **Staff dashboard** (`/staff`): bookings summary and status actions.

> **Security note**: set a strong `JWT_SECRET` and seed passwords in server env before any non-local deployment. All admin mutation routes are JWT-protected in `server/index.ts`; keep secrets in server env (`.env`/Vercel project settings), never in browser/Vite `VITE_*`.

## API Reference (current mock server)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | status + timestamp |
| POST | `/api/auth/login` | email/password → JWT + user |
| POST | `/api/booking` | create booking, returns `{success,id,reference,booking}`; sends confirmation email |
| GET | `/api/bookings` | list bookings |
| PUT | `/api/bookings/:id` | update status; sends status email on confirm/cancel |
| DELETE | `/api/bookings/:id` | delete booking |
| GET | `/api/rooms` | list rooms |
| GET | `/api/facilities` | list facilities |
| GET | `/api/menu` | list menu items |
| GET | `/api/availability` | `room,checkin,checkout` → `{available,conflicts}` |
| GET | `/api/testimonials` | approved only; `?all=true` for all |
| POST | `/api/testimonials` | create (pending); optional `bookingReference` post-stay gate |
| PUT | `/api/testimonials/:id` | update/approve |
| DELETE | `/api/testimonials/:id` | delete |
| GET/POST/DELETE | `/api/gallery*` | gallery management |
| GET/POST | `/api/settings` | key/value settings |
| POST | `/api/payments/create-session` | Stripe/mock payment session |
| POST | `/api/payments/webhook` | Stripe webhook (signature verified) |
| GET | `/api/payments/config` | provider + publishable key |
| POST | `/api/emails/reminder` | send reminder email |

## Project Structure

```text
.
├── .env.example                  # Environment template (payments, SMTP, server)
├── index.html                    # Vite HTML shell
├── package.json                  # Scripts and dependencies
├── vite.config.ts                # Vite 8 + React + Tailwind v4 + Figma Make plugins; /api proxy
├── vercel.json                   # Vercel build/output/SPA rewrites
├── server/
│   ├── index.ts                  # Express API, mock data store, routes, auth, rate limits
│   ├── payments.ts               # Stripe checkout + webhook verify; mock fallback
│   ├── emails.ts                 # Nodemailer SMTP + templates; console fallback
│   └── db.ts                     # Legacy/mock DB helper (not the active server path)
├── src/
│   ├── main.tsx                  # React entry + router
│   ├── index.css                 # Tailwind v4 import + global styles
│   ├── lib/bookings.ts           # Booking types, client API helpers, local fallback
│   ├── components/
│   │   ├── Layout.tsx            # Header/Footer/Eyebrow
│   │   ├── BookingForm.tsx       # Booking + confirmation + payment action
│   │   ├── EnquiryForm.tsx       # General enquiry
│   │   ├── ReviewForm.tsx        # Guest review (optional booking ref gate)
│   │   ├── CalendarView.tsx      # Month calendar for bookings
│   │   ├── FloatingChat.tsx      # Chat placeholder
│   │   └── ErrorBoundary.tsx     # Error boundary
│   ├── pages/                    # Public pages + staff
│   ├── pages/admin/              # Admin pages
│   └── layouts/AdminLayout.tsx   # Admin shell/sidebar
└── .figma/                       # Figma Make config/site metadata
```

## Development Notes

- Vite proxies `/api` to `http://localhost:5000` (see `vite.config.ts`). Run the API server alongside Vite.
- The mock server stores data in memory; **restarts reset bookings/reviews/settings**.
- `Booking` payloads from the client use `bookingType`/camelCase in places; the server normalizes/stores `booking_type` and returns objects compatible with `src/lib/bookings.ts`.
- `CalendarView` currently renders the current month and highlights days with bookings in that month.

## Deployment Checklist

- [ ] Set `JWT_SECRET` to a strong secret; rotate/remove seed users.
- [ ] Add auth middleware to all admin mutation routes.
- [ ] Configure production DB (Neon/Postgres/SQLite) and replace/mock-proof persistence.
- [ ] Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLIC_KEY`; verify webhook URL and currency/amounts.
- [ ] Set SMTP credentials (`SMTP_*`) and a verified `SMTP_FROM` address.
- [ ] Configure `ALLOWED_ORIGINS` for production domains.
- [ ] Review rate limits, logging, and error handling.
- [ ] Run `npm run build` and verify `vercel.json`/hosting rewrites.

## Known Limitations

- Mock in-memory data (no persistence across restarts).
- Admin API auth is partial in the current mock server.
- Stripe currency is passed as `PGK` in the scaffold; confirm Stripe account support and amount conversion before live use.
- Email reminders are exposed as an API hook but not scheduled automatically.
- `server/db.ts` exists alongside the active mock implementation; consolidate before production.
