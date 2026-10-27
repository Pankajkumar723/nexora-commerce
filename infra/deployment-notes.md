# Nexora Commerce — Deployment Notes

This guide documents the production deployment architecture for Nexora Commerce across Vercel, Render, and Managed PostgreSQL.

## 1. Architecture Overview
- **Customer Storefront**: Deployed to Vercel (`apps/storefront`)
- **Admin Console**: Deployed to Vercel (`apps/admin`) with restricted subdomain/access
- **Backend REST API**: Deployed to Render / Fly.io / Railway (`apps/api`)
- **Database**: Managed PostgreSQL (Supabase, Neon, AWS RDS, or Render Postgres)

---

## 2. Storefront & Admin (Vercel)

### Project 1: Storefront
- **Root Directory**: `apps/storefront`
- **Framework Preset**: Vite / TanStack Start
- **Build Command**: `pnpm --filter @nexora/storefront build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Environment Variables**:
  - `VITE_API_URL`: `https://api.nexora-commerce.com`
  - `VITE_RAZORPAY_KEY_ID`: `rzp_live_xxxxxxxx` (Public Key ID only)

### Project 2: Admin Dashboard
- **Root Directory**: `apps/admin`
- **Framework Preset**: Vite / TanStack Start
- **Build Command**: `pnpm --filter @nexora/admin build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Environment Variables**:
  - `VITE_API_URL`: `https://api.nexora-commerce.com`

---

## 3. NestJS API Service (Render / Railway)

- **Environment**: Node.js
- **Root Directory**: `apps/api`
- **Build Command**: `pnpm install && pnpm prisma:generate && pnpm build`
- **Start Command**: `pnpm start:prod`
- **Health Check Endpoint**: `/api/v1/health`
- **Required Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `4000` (or injected by host `$PORT`)
  - `DATABASE_URL`: `postgresql://user:password@host:5432/nexora?sslmode=require`
  - `BETTER_AUTH_SECRET`: Random 32+ character hex string
  - `BETTER_AUTH_URL`: `https://api.nexora-commerce.com`
  - `STORE_URL`: `https://nexora-commerce.com`
  - `ADMIN_URL`: `https://admin.nexora-commerce.com`
  - `RAZORPAY_KEY_ID`: `rzp_live_xxxxxxxx`
  - `RAZORPAY_KEY_SECRET`: Live Secret Key (Server-only)
  - `RAZORPAY_WEBHOOK_SECRET`: Live Webhook Secret
  - `AI_PROVIDER_API_KEY`: Server-only AI Key
  - `AI_MODEL`: Supported LLM model identifier

---

## 4. Database Migrations & Release Phase

Run migrations as a controlled pre-deploy step rather than inside runtime requests:
```bash
# Apply pending Prisma migrations
pnpm --filter @nexora/api prisma migrate deploy

# Seed demo catalog data (initial setup only)
pnpm --filter @nexora/api prisma:seed
```

---

## 5. Security & Verification Checklist
- [x] No `RAZORPAY_KEY_SECRET` or raw API keys in browser bundles
- [x] CORS origin locked to exact production storefront and admin URLs
- [x] Webhook signatures strictly validated using HMAC SHA-256 on raw body
- [x] Server-side role checks on all `/api/v1/admin/*` endpoints
- [x] Database money amounts stored as Prisma `Decimal`
