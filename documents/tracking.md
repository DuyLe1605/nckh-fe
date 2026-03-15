# FE Tracking — Auction Platform (Next.js App Router)

> Scope: chỉ theo dõi frontend trong `FE/`.
> Trạng thái: `[ ]` chưa làm, `[~]` đang làm, `[x]` xong, `[-]` block/hoãn.

## Sprint 1 — Foundation (Frontend)

### A. Project bootstrap

- [x] Khởi tạo Next.js App Router + TypeScript trong `FE/`
- [x] Chuẩn hóa package manager dùng `pnpm`
- [x] Cài Tailwind CSS
- [x] Cài và cấu hình shadcn/ui

### B. Route structure

- [x] Tạo `(public)` routes
- [x] Tạo `(protected)` routes
- [x] Tạo vùng role-based placeholders: `(bidder)`, `(seller)`, `(admin)`

### C. Runtime skeleton

- [x] Tạo `middleware.ts` skeleton cho role gating
- [x] Tạo socket hook `useAuctionSocket`
- [x] Tạo constants cho app-level values
- [x] Thiết lập `.env.local` + `.env.example`
- [x] Thiết lập Axios base client + interceptors chuẩn
- [x] Thiết lập TanStack Query provider + query key conventions
- [x] Thiết lập Zustand stores nền tảng cho UI/client state
- [x] Thiết lập dark mode bằng next-themes + theme toggle
- [x] Cài react-hook-form + zod cho form validation pipeline

## Sprint 2 — Auth UX + Route Guard

- [~] Form login/register
- [~] Luồng token/cookie handling an toàn
- [ ] Middleware role guard hoàn chỉnh
- [ ] Client-side fallback guard + redirect UX
- [ ] Trang profile/session state cơ bản
- [~] Auth API integration bằng Axios + TanStack Query mutations
- [~] Auth/session UI state bằng Zustand (không lưu dữ liệu nhạy cảm)

## Sprint 3 — Public Auction Browsing

- [ ] Trang home/list auctions (SSR)
- [ ] Trang chi tiết auction (SSR + client islands)
- [ ] Search/filter/sort UI
- [ ] Skeleton/loading/error states chuẩn
- [ ] Query cache strategy cho list/detail (staleTime, invalidation)
- [ ] Filter/sort local state bằng Zustand selectors

## Sprint 4 — Live Bidding Experience

- [ ] Live bid panel realtime
- [ ] Đồng bộ current price + bid history theo event
- [ ] UX xử lý outbid/conflict
- [ ] Reconnect + fallback refresh strategy
- [ ] Reconcile socket events với TanStack Query cache nhất quán

## Sprint 5 — Bidder/Seller Workflows

- [ ] Bidder dashboard (winning/outbid/watchlist)
- [ ] Seller create/edit product forms
- [ ] Countdown theo `effective_end_time`
- [ ] Hiển thị anti-sniping extension

## Sprint 6 — Admin Console

- [ ] Admin users management UI
- [ ] Reports/disputes moderation UI
- [ ] Basic review actions + audit surfaces

## Sprint 7 — Quality & Delivery

### Quality

- [ ] Unit tests cho hooks/util quan trọng
- [ ] Integration/E2E smoke cho auth + protected routes
- [ ] Tests cho Axios interceptors + TanStack Query invalidation + Zustand stores

### Performance & security

- [ ] Rà soát caching/revalidate strategy theo route
- [ ] Chuẩn hóa error boundaries
- [ ] Tối ưu bundle + image/font usage

### Delivery

- [ ] Dockerfile frontend
- [ ] CI checks: lint + typecheck + build
- [ ] Deployment checklist theo env

## Kanban hiện tại (FE)

### In Progress

- [~] Hoàn thiện Sprint 2 auth flow (cookie strategy, role redirects, session profile page)
- [~] Chuẩn hóa rule middleware static matcher và route-group conventions (file `FE/documents/instructions.md`)

### Next up

- [ ] Chốt API contract auth với BE (token/refresh/role payload)
- [ ] Bổ sung profile/session page và logout flow

### Done

- [x] Hoàn thành frontend scaffolding Sprint 1
- [x] Cấu hình thành công Tailwind + shadcn/ui + pnpm
- [x] Khởi động Sprint 2 với modern auth UI + dark mode + data layer foundation
