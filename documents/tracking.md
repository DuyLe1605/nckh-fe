# FE Tracking — Auction Platform (Next.js App Router)

> Scope: chỉ theo dõi frontend trong `FE/`.
> Trạng thái: `[ ]` chưa làm, `[~]` đang làm, `[x]` xong, `[-]` block/hoãn.
> Ưu tiên: P0 = Critical, P1 = High, P2 = Medium, P3 = Low.

---

## Epic 1 — Foundation & Infrastructure

| Task ID | Task | Status | Priority | Notes |
|---------|------|--------|----------|-------|
| F-001 | Next.js App Router + TypeScript | ✅ Done | — | `pnpm build` pass |
| F-002 | Tailwind CSS + shadcn/ui | ✅ Done | — | Component library |
| F-003 | Route structure: (public) + (protected) | ✅ Done | — | Role zones created |
| F-004 | Middleware RBAC (route guard) | ✅ Done | — | Static matcher |
| F-005 | Axios instance + interceptors | ✅ Done | — | Auto-refresh, error map |
| F-006 | TanStack Query provider + query keys | ✅ Done | — | Centralized keys |
| F-007 | Zustand stores (auth-ui, auctions-ui) | ✅ Done | — | Domain-split stores |
| F-008 | Dark mode (next-themes) | ✅ Done | — | Toggle working |
| F-009 | react-hook-form + zod | ✅ Done | — | Validation pipeline |
| F-010 | useAuctionSocket hook | ✅ Done | — | Socket.IO client |
| F-011 | Constants centralized | ✅ Done | — | app.constants.ts |

## Epic 2 — Auth UX & Route Guard

| Task ID | Task | Status | Priority | Notes |
|---------|------|--------|----------|-------|
| A-001 | Login form + API integration | ✅ Done | — | Token handling works |
| A-002 | Register form (BIDDER/SELLER role select) | ✅ Done | — | Role picker UI |
| A-003 | Refresh token flow (multi-tab safe) | ✅ Done | — | Race condition mitigated |
| A-004 | Logout / Logout all devices | ✅ Done | — | API call + cookie clear |
| A-005 | Profile/session state (Zustand) | ✅ Done | — | Non-sensitive only |
| A-006 | Middleware role guard | ✅ Done | — | Admin/Seller/Bidder zones |
| A-007 | ⚡ Auth store: thêm `currentUserId` | ✅ Done | — | Zustand store đã có currentUserId |
| A-008 | ⚡ Auth type: thêm `id` for user | ✅ Done | — | AuthUser type có `id?` |
| A-009 | SUPER_ADMIN role support (FE constants) | ✅ Done | — | AuthRole type đã có SUPER_ADMIN |

## Epic 3 — Public Auction Browsing

| Task ID | Task | Status | Priority | Notes |
|---------|------|--------|----------|-------|
| PB-001 | Auctions list page (/auctions) | ✅ Done | — | Filter/sort/pagination |
| PB-002 | Auction detail page (/auctions/:id) | ✅ Done | — | Product info + LiveBidPanel |
| PB-003 | ⚡ Fix: truyền currentUserId → LiveBidPanel | ✅ Done | — | useAuthUiStore → prop |
| PB-004 | ⚡ Fix: effectiveEndTime prop đúng | ✅ Done | — | effectiveEndTime ?? endTime |
| PB-005 | Skeleton/loading/error states | ✅ Done | — | Skeleton UI exists |
| PB-006 | Trang chủ (/) hero + featured auctions | 🔄 Basic | P2 | Cần redesign |

## Epic 4 — Live Bidding Experience

| Task ID | Task | Status | Priority | Notes |
|---------|------|--------|----------|-------|
| LB-001 | LiveBidPanel component | ✅ Done | — | Price, form, history, outbid |
| LB-002 | Bid form (amount input + submit) | ✅ Done | — | Mutation working |
| LB-003 | Real-time price update (WS) | ✅ Done | — | onBidUpdate handler |
| LB-004 | Countdown timer | ✅ Done | — | useCountdown hook |
| LB-005 | ⚡ Countdown reads effectiveEndTime đúng | ✅ Done | — | WS event updates liveEndTime |
| LB-006 | Outbid notification banner | ✅ Done | — | prevWinnerBidderId check |
| LB-007 | Reconnect + fallback polling | [ ] Todo | P1 | Socket disconnect handler |
| LB-008 | Bid history query (no auth required) | ✅ Done | — | OptionalAccessTokenGuard on BE |

## Epic 5 — Bidder Workflows

| Task ID | Task | Status | Priority | Notes |
|---------|------|--------|----------|-------|
| BD-001 | Bidder dashboard (winning/outbid tabs) | ✅ Done | — | Real API via GET /bids/me |
| BD-002 | Wallet page (balance + deposit) | ✅ Done | — | Real API via GET /wallets/me + POST deposit |
| BD-003 | Order history (buyer view) | [ ] Todo | P1 | After order API ready |
| BD-004 | Watchlist | [ ] Todo | P2 | Save favorite auctions |

## Epic 6 — Seller Workflows

| Task ID | Task | Status | Priority | Notes |
|---------|------|--------|----------|-------|
| SL-001 | Seller create product form | 🔄 Mock ~40% | P1 | Form UI exists, no API |
| SL-002 | Seller edit product form | 🔄 Mock ~30% | P1 | Needs API integration |
| SL-003 | Seller "my products" list | 🔄 Mock ~20% | P1 | Needs sellerId filter API |
| SL-004 | Seller orders management | ✅ Done | — | Real API via GET /orders + PATCH status |
| SL-005 | Seller revenue overview | [ ] Todo | P2 | After order system |

## Epic 7 — Admin Console

| Task ID | Task | Status | Priority | Notes |
|---------|------|--------|----------|-------|
| AC-001 | Admin users management UI | [ ] Todo | P1 | Table + search + actions |
| AC-002 | Reports/disputes moderation UI | [ ] Todo | P2 | Review + resolve |
| AC-003 | Admin analytics dashboard | [ ] Todo | P2 | Charts + stats |
| AC-004 | Category management UI | [ ] Todo | P2 | Tree CRUD |
| AC-005 | Admin layout + sidebar | 🔄 Skeleton | P1 | Basic layout exists |

## Epic 8 — Quality & Performance

| Task ID | Task | Status | Priority | Notes |
|---------|------|--------|----------|-------|
| QP-001 | Unit tests (hooks, utils) | [ ] Todo | P2 | Critical hooks first |
| QP-002 | E2E tests (auth + bid flow) | [ ] Todo | P2 | Playwright/Cypress |
| QP-003 | Error boundaries | [ ] Todo | P2 | Graceful error UI |
| QP-004 | Bundle optimization | [ ] Todo | P3 | Code splitting |
| QP-005 | Dockerfile frontend | [ ] Todo | P2 | Production config |

---

## Kanban hiện tại (FE)

### 🔥 Đang làm (In Progress)

- (trống — Phase 3 hoàn thành)

### 📋 Tiếp theo (Next up)

- [ ] **BD-003** Order history (buyer view)
- [ ] **SL-001** Seller create product kết nối API thật
- [ ] **SL-003** Seller "my products" list kết nối API
- [ ] **AC-001** Admin users management UI

### ✅ Hoàn thành gần đây

- [x] Sprint 1 scaffolding hoàn chỉnh
- [x] Auth UI + dark mode + data layer foundation
- [x] Auctions list/detail pages with real API
- [x] LiveBidPanel full (price, countdown, history, outbid, WS)
- [x] Header role badge + status badges
- [x] Middleware RBAC route guard
- [x] Auth store: currentUserId + AuthUser.id
- [x] Bid history query (public, no auth required)
- [x] SUPER_ADMIN role type support
- [x] effectiveEndTime WS update working
- [x] Bidder Dashboard real API (Phase 3)
- [x] Wallet page real API + deposit (Phase 3)
- [x] Seller Orders real API + status actions (Phase 3)
- [x] FE API clients: wallets.api.ts, orders.api.ts, getMyBids()
