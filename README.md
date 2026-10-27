# Nexora Commerce — AI-Powered Full-Stack E-Commerce Platform

Nexora Commerce is an enterprise-ready, multi-category online commerce platform engineered with a clean monorepo architecture, server-authoritative payment lifecycle, relational data persistence, and catalog-grounded AI shopping assistance.

---

## 1. Monorepo Architecture

```
nexora-commerce/
├── apps/
│   ├── storefront/          # Customer-facing React storefront (Port 3000)
│   ├── admin/               # Role-protected Merchant Admin Console (Port 3001)
│   └── api/                 # Modular NestJS REST API with Prisma ORM (Port 4000)
├── packages/
│   ├── shared/              # Shared enums, constants, and formatting utilities
│   ├── config-tailwind/     # Centralized Tailwind design token preset
│   ├── config-eslint/       # Shared linting configuration
│   └── ui/                  # UI design tokens and shared primitives
├── infra/
│   ├── docker/              # Local PostgreSQL container definition
│   └── deployment-notes.md  # Vercel & Render production runbooks
├── .github/workflows/       # GitHub Actions CI pipeline
├── turbo.json               # Turborepo build caching and pipelines
└── pnpm-workspace.yaml      # Monorepo workspace boundaries
```

---

## 2. Tech Stack

- **Monorepo Engine**: pnpm Workspaces + Turborepo
- **Storefront & Admin**: React, Tailwind CSS, TanStack Query, Lucide Icons, Vite
- **Backend REST API**: NestJS (TypeScript), Express adapter, Swagger OpenAPI 3.0
- **Database & ORM**: PostgreSQL 16 + Prisma ORM
- **Authentication**: Better Auth session-based identity with server-side role enforcement
- **Payment Gateway**: Razorpay Standard Checkout (HMAC SHA-256 signature verification + idempotent webhooks)
- **AI Shopping Assistant**: LLM service with catalog grounding, input limits, and deterministic offline fallback
- **Testing**: Jest for backend unit/spec tests, Supertest for API integration

---

## 3. Design System & Tokens

Nexora Commerce implements a warm, high-trust canvas palette:
- **Navy** (`#173D72`): Headings, navigation, high-contrast typography
- **Royal Blue** (`#2F6FED`): Primary CTAs, active filters, interactive links
- **Teal** (`#12B8A6`): Success indicators, badges, AI recommendations
- **Canvas** (`#F7F9FC`): Clean light application background
- **Card/Surface** (`#FFFFFF`): Elevated cards, modals, checkout forms
- **Text** (`#1F2937`): Primary readable copy
- **Muted** (`#5B6575`): Secondary metadata, subtitles, timestamps
- **Border** (`#D7DFEA`): Structural dividers, form inputs

---

## 4. Local Setup Prerequisites

- **Node.js**: `v20+`
- **pnpm**: `v10+` or `v12+` (`corepack enable pnpm`)
- **PostgreSQL**: Local service or Docker container (`infra/docker/docker-compose.yml`)

---

## 5. Quick Start Instructions

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Files
Copy the example environment files:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/storefront/.env.example apps/storefront/.env
cp apps/admin/.env.example apps/admin/.env
```

### 3. Spin up PostgreSQL
Using Docker:
```bash
docker compose -f infra/docker/docker-compose.yml up -d
```
Or use any external/local PostgreSQL connection string in `apps/api/.env`.

### 4. Database Migration & Seed
```bash
pnpm --filter @nexora/api prisma:generate
pnpm --filter @nexora/api prisma:migrate
pnpm --filter @nexora/api prisma:seed
```

### 5. Launch Development Services
```bash
pnpm dev
```
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Console**: [http://localhost:3001](http://localhost:3001)
- **REST API & Swagger Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 6. Testing & Quality Verification

```bash
# Run all unit and module spec tests across the monorepo
pnpm test

# Run API module unit tests specifically
pnpm --filter @nexora/api test

# Build all monorepo apps and packages
pnpm build
```

---

## 7. Phased Delivery Roadmap
- [x] **Phase A — Foundation**: Monorepo scaffolding, Turborepo pipelines, Docker Compose, CI workflows, and documentation.
- [ ] **Phase B — Data & API**: Prisma relational models, database seed, health endpoint, catalog API, DTO validation, and module spec tests.
- [ ] **Phase C — Storefront**: Catalog browsing, product cards, image gallery, search/filter, and TanStack Query state.
- [ ] **Phase D — Auth & Customer**: Better Auth sessions, customer profile, addresses, wishlist, and server-validated cart.
- [ ] **Phase E — Orders & Payments**: Authoritative order calculation, Razorpay test checkout, signature verification, and idempotent webhooks.
- [ ] **Phase F — Admin Console**: Metric KPIs, product/category management, inventory controls, orders status transitions, and coupons.
- [ ] **Phase G — AI Shopping Assistant**: Grounded catalog recommendation engine, guardrails, and graceful offline fallback.
- [ ] **Phase H — Security, Tests & Deployment**: End-to-end verification, production runbooks, and final delivery audit.
