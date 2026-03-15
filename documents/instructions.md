# FE Instructions — Next.js App Router + Tailwind + shadcn/ui + TanStack Query + Zustand + Axios

> Scope: áp dụng cho toàn bộ mã nguồn trong `FE/`.
> Mục tiêu: đảm bảo frontend role-based, realtime-ready, dễ maintain theo `plan.md`.

## 1) Stack & nền tảng bắt buộc

- Next.js App Router + TypeScript strict.
- Package manager: **pnpm**.
- UI system: Tailwind CSS + shadcn/ui.
- Data fetching/state stack: **TanStack Query** + **Axios** + **Zustand**.
- Phân tách route theo nhóm `(public)` và `(protected)` + role zones `(bidder)/(seller)/(admin)`.

## 2) Cấu trúc thư mục & boundaries

- Không đặt logic xác thực/ràng buộc role rải rác trong page.
- Middleware xử lý gate ở lớp đầu; page/client chỉ là fallback UX.
- Hook realtime tách riêng (ví dụ `useAuctionSocket`) khỏi UI component.
- Hạn chế gọi backend trực tiếp trong component sâu; ưu tiên utility/service layer.

## 3) App Router rules

- Tuân thủ đúng conventions của App Router (`layout.tsx`, `page.tsx`, route groups).
- Route Group không được tạo xung đột path cùng URL.
- Nếu có nhiều root layouts, cần đảm bảo navigation/UX nhất quán.
- Server vs Client component phải rõ ràng:
    - chỉ dùng `'use client'` khi cần state/effect/browser API.
    - ưu tiên Server Component cho rendering tĩnh/dữ liệu public.

## 4) Middleware & matcher rules (quan trọng)

- `config.matcher` phải là **static analyzable literal**.
- Không dùng biến runtime/phép tính động trong matcher/revalidate config.
- Logic role check trong middleware phải deterministic, dễ audit.
- Không phụ thuộc dữ liệu nhạy cảm phía client để quyết định authorization cứng.

## 5) Caching, rendering và segment config

- Mặc định ưu tiên cache ở `fetch` level.
- Chỉ dùng `dynamic`, `revalidate`, `fetchCache` khi có lý do rõ.
- Giá trị `revalidate` phải literal tĩnh (ví dụ `600`, không `60 * 10`).
- Với trang đấu giá realtime hoặc dữ liệu nhạy thời gian, cần cân nhắc dynamic/no-store đúng chỗ.

## 6) Environment variables

- Chỉ dùng biến public theo chuẩn `NEXT_PUBLIC_*` cho client.
- Tuyệt đối không để secret BE trong FE env.
- Không hardcode backend URL trong component/hook; dùng constants + env.
- Commit `.env.example`; không commit `.env.local` chứa dữ liệu thật.

## 7) State, realtime và UX

- Socket event names đặt trong constants.
- UI live-bid phải xử lý đủ trạng thái:
    - connecting/reconnecting
    - stale data
    - conflict/outbid feedback
- Luôn có fallback polling/refetch khi socket gián đoạn dài.

## 8) Data layer conventions (Axios + TanStack Query)

- Không gọi `fetch/axios` trực tiếp trong UI component phức tạp.
- Tạo Axios instance tập trung (baseURL, timeout, headers, interceptors).
- Query keys chuẩn hóa theo constants/factory (tránh key string rải rác).
- Dùng TanStack Query cho server state:
    - `useQuery` cho read data
    - `useMutation` cho write actions
    - invalidate/refetch có chủ đích theo query key
- Retry/backoff phải có chủ đích, không để retry vô hạn cho endpoint nhạy cảm.
- Chuẩn hóa map lỗi Axios -> error shape dùng chung cho UI/toast.

## 9) Client state conventions (Zustand)

- Zustand chỉ dùng cho **client state** (UI/session tạm thời), không thay thế server state.
- Không lưu dữ liệu nhạy cảm lâu dài trên client store.
- Store cần tách theo domain (`auth-ui`, `auction-ui`, `filters-ui`...), tránh god-store.
- Selector + shallow compare để giảm re-render không cần thiết.
- Nếu dùng `persist`, phải whitelist field rõ ràng và có versioning cho migration.

## 10) UI consistency

- Dùng shadcn/ui component làm baseline.
- Class Tailwind cần nhất quán spacing/typography theo design token hiện có.
- Tránh duplicate component khi có thể tái sử dụng.
- Các value lặp lại (timeout, pagination defaults, debounce ms) đưa vào `src/constants/**`.

## 11) Error handling & security

- Không hiển thị raw error từ backend cho người dùng cuối.
- Chuẩn hóa toast/alert message theo nhóm lỗi (auth, validation, conflict, server).
- Đảm bảo route protected không render nội dung nhạy cảm trước khi auth check hoàn tất.
- Interceptor xử lý `401/403` phải tránh vòng lặp refresh token vô hạn.

## 12) Testing expectations

- Với luồng critical (auth redirect, role gate, bid panel), cần có test tương ứng (unit/integration/E2E theo giai đoạn).
- Khi sửa middleware hoặc route group, phải test lại các đường dẫn chính:
    - public home
    - login/register
    - bidder/seller/admin area
- Với data layer mới, cần thêm test tối thiểu cho:
    - Axios client/interceptor behavior
    - Query cache invalidation sau mutation quan trọng
    - Zustand store actions/selectors chính

## 13) Definition of Done cho FE task

Task chỉ được coi là done khi:

1. `pnpm build` pass.
2. Không phát sinh route/middleware config vi phạm static rule.
3. Không thêm magic numbers/string lặp lại cho nghiệp vụ.
4. Env docs (`.env.example`) cập nhật nếu có biến mới.
5. UX fail-safe cho loading/error/empty state được xử lý tối thiểu.
6. Nếu task có API integration: dùng Axios instance + TanStack Query conventions.
7. Nếu task có client state mới: giải thích rõ vì sao dùng Zustand thay vì local state.

## 14) Quy tắc PR

PR FE cần nêu rõ:

- Route nào bị ảnh hưởng
- Auth/role flow thay đổi thế nào
- Event realtime nào thêm/sửa
- Hành vi render/cache thay đổi ra sao
- Cách kiểm thử nhanh theo user role
- Ảnh hưởng tới query keys/cache/store/actions/interceptors

## 15) Reference (đã đối chiếu)

- Next.js App Router route groups/middleware/proxy and segment config.
- Quy tắc static analyzable cho `matcher` và `revalidate`.

(Ref chính: nextjs.org/docs)
