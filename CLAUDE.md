# CLAUDE.md

@AGENTS.md

## Commands

```bash
bun dev           # start dev server on :3000
bun run build     # production build
bun run lint      # ESLint
bun db:push       # push schema to Neon (no migration files)
bun db:generate   # generate migration files
bun db:studio     # open Drizzle Studio
```

No test suite is configured.

## Required environment variables

Fill `.env.local`:

```
SISTEL_URL=http://asp12.selfip.net:2932
SISTEL_USER=
SISTEL_PASS=

DATABASE_URL=           # Neon connection string
NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=       # Firebase Console → Auth → Google → Web client
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_FIREBASE_*  # Already filled — Firebase Storage only
```

## Architecture

### Stack
Next.js 15 App Router + Drizzle ORM + Neon PostgreSQL + Sistel API + Firebase Storage. Deploy on Vercel.

### Routing
Pure Next.js App Router. Every page is a file in `app/`. Server Components by default; add `"use client"` only when needed (forms, cart, interactivity). Use `next/link` and `next/navigation` — never React Router.

### Pages
| Route | Description |
|---|---|
| `/` | Landing — featured products from Sistel |
| `/shop` | Product catalog with filters (URL search params) |
| `/shop/[sku]` | Product detail |
| `/carrito` | Cart (client component) |
| `/checkout` | Checkout (auth protected) |
| `/pedidos/[id]` | Order confirmation |
| `/mi-cuenta` | Customer profile + order history |
| `/login` | Login (credentials + Google) |
| `/admin/productos` | Product image management |
| `/admin/clientes` | Client list from Sistel + web account linking |
| `/admin/pedidos` | Order history |
| `/admin/pedidos/[id]` | Order detail |

### API Routes
| Route | Purpose |
|---|---|
| `/api/auth/[...nextauth]` | NextAuth handler |
| `/api/products` | Proxy to Sistel /vistas/articulos + merge images |
| `/api/orders` | POST — create order in DB + send POST /deal to Sistel |
| `/api/me/cuenta` | GET — Sistel account balance for current user |

### Data sources
- **Sistel API** (`lib/sistel.ts`) — products, clients, account balances. Server-side only. JWT auto-refreshes in memory with `POST /auth/login`.
- **Neon PostgreSQL** (`lib/db/`) — users, orders, order_items, product_images, discount_config. Drizzle ORM.
- **Firebase Storage** — product images keyed by SKU. Upload via admin panel.

### Database schema (`lib/db/schema.ts`)
| Table | Purpose |
|---|---|
| `users` | Auth — email, password_hash, role (CLIENT/ADMIN), tax_id (CUIT), sistel_id |
| `orders` | Orders — user_id, status, total_amount, payment_method |
| `order_items` | Line items — order_id, sku, product_name, quantity, unit_price, final_price |
| `product_images` | Firebase URL per SKU (sku is PK) |

### Auth (`lib/auth.ts`)
NextAuth v5 (JWT strategy). Two providers:
- **Credentials** — email + bcrypt password from `users` table
- **Google** — only works if user email already exists in DB (admin invites clients)

Session contains `id` and `role`. Middleware (`middleware.ts`) enforces:
- `/admin/*` → ADMIN role required
- `/checkout`, `/mi-cuenta`, `/pedidos/*` → auth required

### Sistel client (`lib/sistel.ts`)
Server-only. `POST /auth/login` gets Bearer JWT (cached in memory, refreshes 30s before expiry).
- `sistelGet(alias, params)` → `GET /vistas/:alias`
- `sistelPost(path, body)` → any POST (used for `/deal`)

### Cart
Client-side only (`features/cart/context/CartContext.tsx`). localStorage, no backend sync. `CartItem`: `{ sku, name, price, quantity, imageUrl? }`.

### Feature modules
Business logic in `features/<domain>/components/`. No `api/` dirs — all data fetching happens in Server Components or API routes.

Features kept: `auth`, `cart`, `product`, `user`, `order`, `admin`.

Cross-cutting code in `shared/`:
- `config/firebase.ts` — Firebase Storage only (Auth removed)
- `services/storage.ts` — Firebase upload helpers
- `utils/formatters.ts`, `priceUtils.ts`, `numberUtils.ts`

### Styling
Tailwind CSS. Global styles in `app/globals.css`. Font: Lato via `next/font/google`. UI in Spanish.

### Payment model
B2B, no payment gateway. Client selects payment method at checkout. Order submitted to Sistel via `POST /deal`.
