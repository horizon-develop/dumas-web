# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun dev          # start dev server on :3000
bun run build    # production build
bun run lint     # ESLint
```

No test suite is configured.

## Required environment variables

Create `.env.local` with:

```
NEXT_PUBLIC_BACKEND_URL=       # REST API base URL
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Architecture

### Next.js as a shell, React Router owns all routing

Next.js handles the deployment/build layer only. The entire app is mounted through a single catch-all route `app/[[...rest]]/page.tsx` which dynamically imports `features/App.tsx` with SSR disabled (`ssr: false`). All navigation is React Router — never use `next/navigation` or Next.js `Link`.

### Feature modules

All business logic lives in `features/<domain>/` with consistent internal structure:
- `api/` — Axios calls to the backend
- `components/` — UI components for that domain
- `types/` — TypeScript types/interfaces
- `hooks/`, `context/`, `providers/`, `utils/` — as needed per feature

Features: `auth`, `cart`, `order`, `payment`, `product`, `admin`, `user`, `brand`, `category`, `coupon`, `address`.

Cross-cutting code (Navbar, Footer, shared hooks, formatters, the Axios client, Firebase config) lives in `shared/`.

### Auth model

Session is JWT-based with HttpOnly cookies (set by the backend). The user object is mirrored to `localStorage` as JSON under the key `"user"` for synchronous reads. On app mount, `verifySession()` calls `GET /api/auth/me` to validate the session and refresh localStorage.

Token refresh happens automatically in the Axios interceptor (`shared/utils/axios.ts`): on 401, it calls `POST /api/auth/refresh`, replays the queue, and on failure dispatches the custom event `auth-logout` which shows the login modal.

Auth communication between components uses custom window events:
- `auth-login` — user signed in (detail = user object)
- `auth-logout` — session ended
- `auth-change` — generic re-render trigger
- `auth-open-login` — open the login sidebar

Firebase is used only for **Google OAuth** (`signInWithPopup`) and **Firebase Storage** — not as the primary auth backend. The Google ID token is exchanged with the backend via `POST /api/auth/google`.

### Route guards

Three wrappers inside `features/App.tsx`:
- `RequireAuth` — redirects unauthenticated users to the login modal
- `ClientRoute` — redirects `ADMINISTRADOR` role to `/admin/dashboard`
- `ProtectedRoute` — allows only specified roles (used for admin routes)

### State management

- **Redux** — product list and filter state (`features/product/providers/ProductFiltersProvider`)
- **React Context** — cart (`features/cart/context/CartContext`), MercadoPago payment (`features/payment/api/MercadoPagoContext`)
- **localStorage** — user session (not Redux)

### Payment

MercadoPago is the payment provider. Checkout creates a preference; `/payment/success|pending|failure` are the redirect targets after the MercadoPago flow.

### Styling

Tailwind CSS. Global styles in `app/globals.css`. Font is Lato (via `next/font/google`), set in `app/layout.tsx`. The app UI is in Spanish.
