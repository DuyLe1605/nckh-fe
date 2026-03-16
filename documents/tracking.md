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
- [x] Middleware role guard hoàn chỉnh
- [x] Client-side fallback guard + redirect UX
- [x] Trang profile/session state cơ bản
- [x] Auth API integration bằng Axios + TanStack Query mutations
- [~] Auth/session UI state bằng Zustand (không lưu dữ liệu nhạy cảm)
- [x] Logout all devices flow (gọi `POST /auth/logout-all`)

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

- [x] Bidder dashboard (winning/outbid/watchlist)
- [x] Seller create/edit product forms
- [x] Countdown theo `effective_end_time`
- [x] Hiển thị anti-sniping extension

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

- [~] Hoàn thiện Sprint 2 auth flow (token contract ổn định khi BE thay đổi payload)
- [~] Chuẩn hóa rule middleware static matcher và route-group conventions (file `FE/documents/instructions.md`)
- [~] Kết nối API thật cho Sprint 5 seller create/update sau khi BE chốt payload cuối
- [~] Harden refresh flow đa tab để tránh false logout khi rotation race

### Next up

- [ ] Bổ sung error UX chi tiết cho refresh expired vs revoked
- [ ] Bổ sung test cho logout-all và multi-tab sync
- [ ] Hook bidder dashboard/watchlist với dữ liệu realtime từ API + socket events
- [ ] Bổ sung optimistic UX cho seller create/edit product form
- [ ] Chuyển bidder/seller dashboard từ mock data sang API thật + query invalidation

### Done

- [x] Hoàn thành frontend scaffolding Sprint 1
- [x] Cấu hình thành công Tailwind + shadcn/ui + pnpm
- [x] Khởi động Sprint 2 với modern auth UI + dark mode + data layer foundation
- [x] Sửa contract auth: register chọn role `BIDDER/SELLER`, login lấy role từ backend response
- [x] Triển khai Sprint 5 UI workflows + dữ liệu mẫu đa dạng cho bidder/seller
- [x] Header protected hiển thị role động bằng role badge
- [x] Custom status badge cho role/order/auction state surfaces
