# FE Tracking — Auction Platform (Next.js App Router)

> Scope: chỉ theo dõi frontend trong `FE/`.
> Trạng thái: `[ ]` chưa làm, `[~]` đang làm, `[x]` xong, `[-]` block/hoãn.
> Ưu tiên: P0 = Critical, P1 = High, P2 = Medium, P3 = Low.
> **RULE**: Luôn sử dụng `pnpm` để cài đặt dependencies và chạy script (`pnpm install`, `pnpm build`, v.v...).

---

## Epic 1 — Foundation & Infrastructure

| Task ID | Task                                    | Status  | Priority | Notes                   |
| ------- | --------------------------------------- | ------- | -------- | ----------------------- |
| F-001   | Next.js App Router + TypeScript         | ✅ Done | —        | `pnpm build` pass       |
| F-002   | Tailwind CSS + shadcn/ui                | ✅ Done | —        | Component library       |
| F-003   | Route structure: (public) + (protected) | ✅ Done | —        | Role zones created      |
| F-004   | Middleware RBAC (route guard)           | ✅ Done | —        | Static matcher          |
| F-005   | Axios instance + interceptors           | ✅ Done | —        | Auto-refresh, error map |
| F-006   | TanStack Query provider + query keys    | ✅ Done | —        | Centralized keys        |
| F-007   | Zustand stores (auth-ui, auctions-ui)   | ✅ Done | —        | Domain-split stores     |
| F-008   | Dark mode (next-themes)                 | ✅ Done | —        | Toggle working          |
| F-009   | react-hook-form + zod                   | ✅ Done | —        | Validation pipeline     |
| F-010   | useAuctionSocket hook                   | ✅ Done | —        | Socket.IO client        |
| F-011   | Constants centralized                   | ✅ Done | —        | app.constants.ts        |

## Epic 2 — Auth UX & Route Guard

| Task ID | Task                                                | Status  | Priority | Notes                                            |
| ------- | --------------------------------------------------- | ------- | -------- | ------------------------------------------------ |
| A-001   | Login form + API integration                        | ✅ Done | —        | Token handling works                             |
| A-002   | Register form (BIDDER/SELLER role select)           | ✅ Done | —        | Role picker UI                                   |
| A-003   | Refresh token flow (multi-tab safe)                 | ✅ Done | —        | Race condition mitigated                         |
| A-004   | Logout / Logout all devices                         | ✅ Done | —        | API call + cookie clear                          |
| A-005   | Profile/session state (Zustand)                     | ✅ Done | —        | Non-sensitive only                               |
| A-006   | Middleware role guard                               | ✅ Done | —        | Admin/Seller/Bidder zones                        |
| A-007   | ⚡ Auth store: thêm `currentUserId`                 | ✅ Done | —        | Zustand store đã có currentUserId                |
| A-008   | ⚡ Auth type: thêm `id` for user                    | ✅ Done | —        | AuthUser type có `id?`                           |
| A-009   | SUPER_ADMIN role support (FE constants)             | ✅ Done | —        | AuthRole type đã có SUPER_ADMIN                  |
| A-010   | Popup OTP 6 số sau đăng ký (cho phép bỏ qua)        | ✅ Done | —        | VerifyAccountDialog mở ngay sau register         |
| A-011   | Toast cảnh báo khi login tài khoản chưa xác thực    | ✅ Done | —        | Dựa trên `user.status` từ auth session           |
| A-012   | Luồng quên mật khẩu 2 bước (email -> OTP reset)     | ✅ Done | —        | Trang `/forgot-password` redesign + UX cải thiện |
| A-013   | Profile page redesign chuẩn production              | ✅ Done | —        | Hero card + security cards + CTA xác thực        |
| A-014   | Chuẩn hóa auth query/mutation vào `lib/query/hooks` | ✅ Done | —        | Loại bỏ mutation inline ở auth components/pages  |

## Epic 3 — Public Auction Browsing

| Task ID | Task                                        | Status   | Priority | Notes                       |
| ------- | ------------------------------------------- | -------- | -------- | --------------------------- |
| PB-001  | Auctions list page (/auctions)              | ✅ Done  | —        | Filter/sort/pagination      |
| PB-002  | Auction detail page (/auctions/:id)         | ✅ Done  | —        | Product info + LiveBidPanel |
| PB-003  | ⚡ Fix: truyền currentUserId → LiveBidPanel | ✅ Done  | —        | useAuthUiStore → prop       |
| PB-004  | ⚡ Fix: effectiveEndTime prop đúng          | ✅ Done  | —        | effectiveEndTime ?? endTime |
| PB-005  | Skeleton/loading/error states               | ✅ Done  | —        | Skeleton UI exists          |
| PB-006  | Trang chủ (/) hero + featured auctions      | 🔄 Basic | P2       | Cần redesign                |
| LP-001  | Animated Landing Page with framer-motion    | 🔄 Basic | P2       | Cần redesign                |

## Epic 4 — Live Bidding Experience

| Task ID | Task                                     | Status  | Priority | Notes                           |
| ------- | ---------------------------------------- | ------- | -------- | ------------------------------- |
| LB-001  | LiveBidPanel component                   | ✅ Done | —        | Price, form, history, outbid    |
| LB-002  | Bid form (amount input + submit)         | ✅ Done | —        | Mutation working                |
| LB-003  | Real-time price update (WS)              | ✅ Done | —        | onBidUpdate handler             |
| LB-004  | Countdown timer                          | ✅ Done | —        | useCountdown hook               |
| LB-005  | ⚡ Countdown reads effectiveEndTime đúng | ✅ Done | —        | WS event updates liveEndTime    |
| LB-006  | Outbid notification banner               | ✅ Done | —        | prevWinnerBidderId check        |
| LB-007  | Reconnect + fallback polling             | ✅ Done | —        | useAuctionSocket fallback logic |
| LB-008  | Bid history query (no auth required)     | ✅ Done | —        | OptionalAccessTokenGuard on BE  |

## Epic 5 — Bidder Workflows

| Task ID | Task                                   | Status   | Priority | Notes                                       |
| ------- | -------------------------------------- | -------- | -------- | ------------------------------------------- |
| BD-001  | Bidder dashboard (winning/outbid tabs) | ✅ Done  | —        | Real API via GET /bids/me                   |
| BD-002  | Wallet page (balance + deposit)        | ✅ Done  | —        | Real API via GET /wallets/me + POST deposit |
| BD-003  | Order history (buyer view)             | ✅ Done  | —        | Real API via GET /orders (/my-orders route) |
| BD-004  | Watchlist                              | [ ] Todo | P2       | Save favorite auctions                      |

## Epic 6 — Seller Workflows

| Task ID | Task                       | Status   | Priority | Notes                                            |
| ------- | -------------------------- | -------- | -------- | ------------------------------------------------ |
| SL-001  | Seller create product form | ✅ Done  | —        | Real API POST /products + category dropdown      |
| SL-002  | Seller edit product form   | ✅ Done  | —        | Real API PUT /products/:id, block ACTIVE         |
| SL-003  | Seller "my products" list  | ✅ Done  | —        | Real API GET /products?sellerId= + filter/delete |
| SL-004  | Seller orders management   | ✅ Done  | —        | Real API via GET /orders + PATCH status          |
| SL-005  | Seller revenue overview    | [ ] Todo | P2       | After order system                               |

## Epic 7 — Admin Console

| Task ID | Task                           | Status  | Priority | Notes                                              |
| ------- | ------------------------------ | ------- | -------- | -------------------------------------------------- |
| AC-001  | Admin users management UI      | ✅ Done | —        | Search + role/status filter + ban/suspend/activate |
| AC-002  | Reports/disputes moderation UI | ✅ Done | —        | Review + resolve                                   |
| AC-003  | Admin analytics dashboard      | ✅ Done | —        | Charts + stats                                     |
| AC-004  | Category management UI         | ✅ Done | —        | Tree CRUD                                          |
| AC-005  | Admin layout + sidebar         | ✅ Done | —        | Navigation + active state                          |

## Epic 8 — Quality & Performance

| Task ID | Task                        | Status   | Priority | Notes                |
| ------- | --------------------------- | -------- | -------- | -------------------- |
| QP-001  | Unit tests (hooks, utils)   | [ ] Todo | P2       | Critical hooks first |
| QP-002  | E2E tests (auth + bid flow) | [ ] Todo | P2       | Playwright/Cypress   |
| QP-003  | Error boundaries            | [ ] Todo | P2       | Graceful error UI    |
| QP-004  | Bundle optimization         | [ ] Todo | P3       | Code splitting       |
| QP-005  | Dockerfile frontend         | [ ] Todo | P2       | Production config    |

---

## Kanban hiện tại (FE)

### 🔥 Đang làm (In Progress)

- (trống — Phase 5 hoàn thành)

### 📋 Tiếp theo (Next up)

- [ ] QP-001: Unit tests cho auth hooks/profile flows

### ✅ Hoàn thành gần đây

- [x] Cập nhật footer public/protected với chữ ký cuối: **Đội Ngũ NCKH DH13C1**
- [x] Auth flow: popup OTP sau đăng ký + cho phép xác thực sau
- [x] Login toast cảnh báo cho user chưa verify
- [x] Forgot Password page redesign (2 bước email/OTP)
- [x] Profile redesign chuyên nghiệp + badge trạng thái + nút xác thực
- [x] Refactor auth mutations sang `FE/src/lib/query/hooks/use-auth.ts`
- [x] Rebrand tên hệ thống thành **Aurelia Auctions**
- [x] LB-007: Fallback polling khi Socket.IO mất kết nối
- [x] Tạo proxy.ts chặn hiển thị theo role
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
- [x] Seller Products CRUD real API (Phase 4): create + edit + list + delete
- [x] products.api.ts, categories.api.ts, admin.api.ts (Phase 4/5)
- [x] Bidder Order History /my-orders real API (Phase 4)
- [x] Admin Users Management UI: search + filter + ban/suspend (Phase 5)
- [x] Admin Layout Sidebar with nav + active state (Phase 5)
- [x] Category dropdown trên seller product forms (Phase 5)
- [x] Admin Categories CRUD Management (Phase 6)
- [x] Admin Analytics Dashboard UI + Recharts (Epic 7)

### 🎯 Nhiệm vụ thêm (Extra Tasks)

- [x] EX-001: Việt hóa toàn bộ giao diện (Localization)
- [x] EX-002: Hoàn thiện Dark Mode (Tailwind v4 `class` strategy & Hydration fix)
- [x] EX-003: Replace raw emoji icons with Lucide icons across Frontend
- [x] EX-004: Centralize all React Query hooks to `FE/src/lib/query/hooks/`
- [x] EX-005: Integrate Shadcn Chart structure for Dashboard Analytics
