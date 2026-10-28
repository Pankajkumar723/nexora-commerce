# Nexora Commerce — AI-Powered Full-Stack E-Commerce Platform

Nexora Commerce is an enterprise-grade, multi-category online commerce platform engineered with a high-performance monorepo architecture, server-authoritative payment lifecycle, relational data persistence, and catalog-grounded AI shopping assistance.

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

## 2. Tech Stack & Non-Negotiable Rules

| Layer | Technologies | Key Capabilities |
| :--- | :--- | :--- |
| **Monorepo Engine** | pnpm Workspaces + Turborepo | Shared package caching, zero dependency duplication, atomic builds |
| **Storefront** | React 18, Vite, Tailwind CSS, TanStack Query, Lucide Icons | Responsive catalog, dynamic filters, product gallery, interactive AI drawer, slide-out cart |
| **Admin Console** | React 18, Vite, Tailwind CSS, TanStack Query, Lucide Icons | Real-time sales KPIs, order state machine transitions, stock adjustment, coupon manager |
| **Backend API** | NestJS 10 (TypeScript), Express adapter, Swagger OpenAPI 3.0 | Modular architecture, global validation pipes, standardized error filters, role guards |
| **Database & ORM** | PostgreSQL 16 + Prisma ORM | Relational models, `Decimal` money fields, indexed lookups, transactional state transitions |
| **Authentication** | Better Auth session persistence + NestJS AuthGuard & RolesGuard | Secure cookie/header sessions, customer profile & address management, ADMIN role checks |
| **Payments** | Razorpay Standard Checkout | Server-side HMAC SHA-256 signature verification, idempotent webhook processing, auto stock capture |
| **AI Shopping Assistant** | Grounded Recommendation Engine + Deterministic Fallback | Prompt sanitization, natural query budget parsing, strict catalog grounding, in-chat add-to-cart |
| **Testing** | Jest + Supertest | 167 unit and integration tests across 26 test suites |

### Critical Architectural Rules
1. **Server-Authoritative Pricing**: Frontend totals are purely advisory. Line prices, discounts, delivery fees, and order totals are computed strictly on the backend using `Prisma.Decimal`.
2. **Zero Floating-Point Money**: All financial fields in database schema and services utilize precise Decimal arithmetic.
3. **Strict HMAC Signature Verification**: Razorpay payment captures and webhooks reject any payload failing cryptographic SHA-256 HMAC verification.
4. **Idempotency**: Webhook events check for prior processing via database transactions to prevent duplicate fulfillment or stock decrements.
5. **Catalog-Grounded AI**: The AI shopping assistant is grounded in live database inventory, sanitizes user input against prompt injection, and includes mandatory AI disclosures.

---

## 3. Design System & Tokens

Nexora Commerce implements a warm, high-trust canvas palette:
- **Navy** (`#173D72`): Headings, navigation, high-contrast typography
- **Royal Blue** (`#2F6FED`): Primary CTAs, active filters, interactive links
- **Teal / Emerald** (`#12B8A6`): Success indicators, badges, AI recommendations
- **Canvas** (`#F7F9FC`): Clean light application background
- **Card / Surface** (`#FFFFFF`): Elevated cards, modals, checkout forms
- **Text Primary** (`#1F2937`): High-contrast readable typography
- **Text Muted** (`#5B6575`): Secondary metadata, subtitles, timestamps
- **Border Subtle** (`#D7DFEA`): Dividers, inputs, subtle cards

---

## 4. REST API Endpoint Catalog

All API endpoints are prefixed with `/api/v1`. Interactive Swagger API docs are accessible at [http://localhost:4000/api/docs](http://localhost:4000/api/docs).

### Catalog & Categories
- `GET /api/v1/categories` — List all active categories with product counts.
- `GET /api/v1/products` — Filterable & paginated catalog (query params: `page`, `limit`, `search`, `category`, `minPrice`, `maxPrice`, `sort`).
- `GET /api/v1/products/:slug` — Product detail by slug including variants, images, and reviews.

### Authentication & Users
- `POST /api/v1/auth/register` — Register a customer or merchant account.
- `POST /api/v1/auth/login` — Authenticate and obtain active session token.
- `GET /api/v1/users/profile` — Get current authenticated user profile.
- `PUT /api/v1/users/profile` — Update customer name, email, or phone.
- `GET /api/v1/users/addresses` — List saved customer shipping addresses.
- `POST /api/v1/users/addresses` — Add a new shipping address.

### Wishlist & Cart
- `GET /api/v1/wishlist` — Retrieve customer wishlist items.
- `POST /api/v1/wishlist` — Add product to wishlist.
- `DELETE /api/v1/wishlist/:productId` — Remove product from wishlist.
- `GET /api/v1/cart` — Get active customer cart with calculated item subtotals.
- `POST /api/v1/cart/items` — Add variant to cart.
- `PUT /api/v1/cart/items/:id` — Update item quantity.
- `DELETE /api/v1/cart/items/:id` — Remove item from cart.
- `DELETE /api/v1/cart` — Clear cart.

### Coupons & Checkout
- `POST /api/v1/coupons/validate` — Validate coupon code against cart subtotal (`NEXORA10`, `FLAT500`).
- `POST /api/v1/orders` — Create authoritative order from cart items, compute server-side tax/shipping/discount.
- `GET /api/v1/orders` — List customer order history.
- `GET /api/v1/orders/:id` — Retrieve specific order with timeline.

### Payments
- `POST /api/v1/payments/razorpay/create-order` — Generate Razorpay Order ID for checkout.
- `POST /api/v1/payments/razorpay/verify` — Verify HMAC SHA-256 signature and mark order `CONFIRMED`.
- `POST /api/v1/payments/razorpay/webhook` — Idempotent webhook receiver for payment capture and refund events.

### Admin Console (Protected by `RolesGuard` -> `ADMIN`)
- `GET /api/v1/admin/dashboard` — Executive KPI metrics (Gross Revenue, Total Orders, Active Customers, Low Stock Alerts).
- `GET /api/v1/admin/orders` — Filterable merchant order management list.
- `PUT /api/v1/admin/orders/:id/status` — State machine transition (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` or `CANCELLED`).
- `GET /api/v1/admin/inventory` — Live inventory monitoring with low stock badges.
- `PUT /api/v1/admin/inventory/:variantId` — Authoritative stock adjustments.
- `GET /api/v1/admin/coupons` — Coupon promotion manager.
- `POST /api/v1/admin/coupons` — Create promotional coupon.
- `GET /api/v1/admin/customers` — Customer registry with lifetime spend analytics.

### AI Shopping Assistant
- `POST /api/v1/ai/recommendations` — Catalog-grounded natural language product suggestions with prompt sanitization, budget parsing, and fallback.

---

## 5. Local Setup & Quick Start

### Prerequisites
- **Node.js**: `v20.0.0+`
- **pnpm**: `v10+` or `v12+` (`corepack enable pnpm`)
- **Docker** (optional, for local PostgreSQL): Docker Desktop or Docker engine

### Step-by-Step Installation

```bash
# 1. Clone repository and navigate to root
cd "Nexora Commerce"

# 2. Install dependencies across all monorepo workspaces
pnpm install

# 3. Setup environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/storefront/.env.example apps/storefront/.env
cp apps/admin/.env.example apps/admin/.env

# 4. Spin up PostgreSQL database
docker compose -f infra/docker/docker-compose.yml up -d

# 5. Run Prisma migrations and seed database
pnpm --filter @nexora/api prisma:generate
pnpm --filter @nexora/api prisma:migrate
pnpm --filter @nexora/api prisma:seed

# 6. Start all applications concurrently
pnpm dev
```

### Accessing Local Applications
- **Storefront App**: [http://localhost:3000](http://localhost:3000)
- **Admin Console**: [http://localhost:3001](http://localhost:3001)
- **NestJS REST API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## 6. Seed Data & Demo Accounts

When running `pnpm --filter @nexora/api prisma:seed`, the database is populated with realistic commerce records:

### Demo Accounts
- **Admin**: `admin@nexora.com` (Role: `ADMIN`)
- **Customer**: `customer@nexora.com` (Role: `CUSTOMER`)

### Demo Coupons
- `NEXORA10`: 10% discount on orders above ₹2,000 (Max discount ₹1,500).
- `FLAT500`: Flat ₹500 discount on orders above ₹4,000.

### Featured Categories & Products
- **Audio & Acoustics**: Nexora ANC Pro Wireless Headphones, Studio Buds ANC, Studio Monitor Speakers.
- **Smart Wearables**: Apex Titanium Smartwatch, FitPulse Pro Band, Tempo Ultra GPS Watch.
- **Desk & Ergonomics**: Nexora Master Mechanical Keyboard, Aeroflow Ergonomic Chair, Carbon Desk Mat.
- **Travel & EDC**: Voyager Waterproof Commuter Backpack, Modular Tech Organizer.
- **Apparel & Performance**: All-Weather Merino Tech Hoodie.

---

## 7. Verification & Test Suite Summary

Nexora Commerce features automated Jest test coverage across every backend controller, service, guard, and filter.

```bash
# Run complete test suite across all packages
pnpm test

# Run API unit tests specifically
pnpm --filter @nexora/api test

# Run full monorepo build
pnpm build

# Run linting across all packages
pnpm lint
```

### Unit Test Suites (26 Suites, 167 Tests Passing)
- `AiService` & `AiController`: Prompt injection sanitization, budget parsing, category extraction, fallback recommendations.
- `AdminService` & `AdminController`: KPI metrics calculation, stock adjustments, order status transitions.
- `OrdersService` & `OrdersController`: Authoritative calculations, Decimal pricing, stock deduction, status transitions.
- `PaymentsService` & `PaymentsController`: Razorpay order creation, HMAC SHA-256 signature verification, webhook idempotency.
- `CouponsService` & `CouponsController`: Coupon discount validation, minimum spend checks, usage limit enforcement.
- `CartService` & `CartController`: Cart session binding, item quantity updates, subtotal aggregation.
- `WishlistService` & `WishlistController`: Add, list, remove items.
- `UsersService` & `UsersController`: Profile updates, customer shipping addresses.
- `AuthService` & `AuthController`: Password hashing, session creation, credentials verification.
- `CatalogService` & `CatalogController`: Multi-category browsing, pagination metadata, search filters.
- `HealthService` & `HealthController`: PostgreSQL connection probes, system uptime diagnostics.
- `AuthGuard`, `RolesGuard`, `HttpExceptionFilter`, `PrismaService`: Security filters and connection error handling.

---

## 8. Production Deployment Runbook

Detailed production deployment instructions are documented in [infra/deployment-notes.md](infra/deployment-notes.md).

### Summary:
- **Database**: Managed PostgreSQL on Neon, Supabase, or AWS RDS with pooled connection string.
- **API (NestJS)**: Deploy containerized Docker image on Render, Railway, or Fly.io with `NODE_ENV=production`.
- **Storefront & Admin**: Deploy static Vite SPAs on Vercel or Cloudflare Pages with environment variables configured (`VITE_API_URL`).
- **Payments**: Switch `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to live production keys.
- **AI Engine**: Set `AI_PROVIDER_API_KEY` to Google Gemini API Key.

---

## 9. Phased Delivery Roadmap Status

- [x] **Phase A — Foundation**: Monorepo scaffolding, Turborepo pipelines, Docker Compose, CI workflows, and architecture documentation.
- [x] **Phase B — Data & API**: Prisma relational schema, PostgreSQL seed data, health checks, catalog module, and unit tests.
- [x] **Phase C — Storefront Catalog UI**: Responsive catalog, dynamic filter sidebar, product gallery, variant selector, and cart drawer.
- [x] **Phase D — Auth & Customer**: Better Auth tables, user profiles, address management, wishlist, and cart backend with unit tests.
- [x] **Phase E — Coupons & Payments**: Coupon validation engine, authoritative order calculations, Razorpay HMAC checkout, and webhook verification.
- [x] **Phase F — Admin Console**: Merchant console with sales KPIs, order state machine fulfillment, inventory adjustments, and coupon management.
- [x] **Phase G — AI Shopping Assistant**: Catalog-grounded AI assistant, prompt injection guardrails, budget parsing, and interactive chat drawer with in-chat add-to-cart.
- [x] **Phase H — Security, Tests & Production Readiness**: Turbo monorepo verification, 167 passing unit tests, comprehensive documentation, and production runbooks.
