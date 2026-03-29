"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    listUsers,
    updateUserStatus,
    type AdminUserItem,
    type UserRole,
    type UserStatus,
} from "@/lib/api/admin.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(value: string | number) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(num);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
    SUPER_ADMIN: {
        label: "Super Admin",
        className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
    },
    ADMIN: {
        label: "Admin",
        className: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
    SELLER: {
        label: "Seller",
        className: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    BIDDER: {
        label: "Bidder",
        className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",
    },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    ACTIVE: {
        label: "Hoạt động",
        className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",
    },
    UNVERIFIED: {
        label: "Chưa xác minh",
        className: "border-zinc-500/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
    },
    SUSPENDED: {
        label: "Tạm dừng",
        className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    BANNED: {
        label: "Cấm",
        className: "border-destructive/40 bg-destructive/10 text-destructive",
    },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_CONFIG[role] ?? { label: role, className: "" };
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}

function UserStatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, className: "" };
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}

type Notification = { type: "success" | "error"; text: string };

const ROLE_FILTERS: { value: UserRole | ""; label: string }[] = [
    { value: "", label: "Tất cả vai trò" },
    { value: "BIDDER", label: "Người mua (Bidder)" },
    { value: "SELLER", label: "Người bán (Seller)" },
    { value: "ADMIN", label: "Quản trị viên (Admin)" },
];

const STATUS_FILTERS: { value: UserStatus | ""; label: string }[] = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "UNVERIFIED", label: "Chưa xác minh" },
    { value: "SUSPENDED", label: "Tạm dừng" },
    { value: "BANNED", label: "Cấm" },
];

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
    const [page, setPage] = useState(1);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const buildParams = useCallback(() => {
        const params: Record<string, string | number | undefined> = { page };
        if (debouncedSearch) params.search = debouncedSearch;
        if (roleFilter) params.role = roleFilter;
        if (statusFilter) params.status = statusFilter;
        return params;
    }, [page, debouncedSearch, roleFilter, statusFilter]);

    const usersQuery = useQuery({
        queryKey: QUERY_KEYS.admin.users(buildParams()),
        queryFn: () =>
            listUsers({
                page,
                search: debouncedSearch || undefined,
                role: roleFilter || undefined,
                status: statusFilter || undefined,
            }),
        staleTime: 10_000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
            updateUserStatus(id, status),
        onSuccess: (data) => {
            setNotification({ type: "success", text: `✅ ${data.message}` });
            void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            setTimeout(() => setNotification(null), 4000);
        },
        onError: (error: { message?: string }) => {
            setNotification({ type: "error", text: `❌ ${error?.message ?? "Cập nhật thất bại"}` });
            setTimeout(() => setNotification(null), 4000);
        },
    });

    const users: AdminUserItem[] = usersQuery.data?.users ?? [];
    const pagination = usersQuery.data?.pagination;

    const handleStatusChange = (userId: string, userName: string, newStatus: UserStatus) => {
        const action =
            newStatus === "BANNED"
                ? "CẤM"
                : newStatus === "SUSPENDED"
                  ? "TẠM DỪNG"
                  : newStatus === "ACTIVE"
                    ? "KÍCH HOẠT"
                    : newStatus;

        if (window.confirm(`Bạn có chắc muốn ${action} tài khoản "${userName}"?`)) {
            updateStatusMutation.mutate({ id: userId, status: newStatus });
        }
    };

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Xem, tìm kiếm và quản lý trạng thái tài khoản người dùng trên nền tảng.
                </p>
            </header>

            {/* ─── Notification ─ */}
            {notification && (
                <div
                    className={
                        "rounded-lg border px-4 py-3 text-sm " +
                        (notification.type === "success"
                            ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                            : "border-destructive/40 bg-destructive/10 text-destructive")
                    }
                >
                    {notification.text}
                </div>
            )}

            {/* ─── Stats ─ */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Tổng người dùng</CardDescription>
                        <CardTitle>
                            {usersQuery.isLoading ? <Skeleton className="h-8 w-12" /> : pagination?.total ?? 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Đang lọc</CardDescription>
                        <CardTitle>
                            {usersQuery.isLoading ? <Skeleton className="h-8 w-12" /> : users.length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Trang</CardDescription>
                        <CardTitle>
                            {pagination ? `${pagination.page}/${pagination.totalPages}` : "—"}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* ─── Search + Filters ─ */}
            <div className="flex flex-wrap items-center gap-3">
                <Input
                    placeholder="Tìm theo email hoặc tên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <div className="flex flex-wrap gap-2">
                    {ROLE_FILTERS.map((item) => (
                        <Button
                            key={item.value}
                            variant={roleFilter === item.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                setRoleFilter(item.value as UserRole | "");
                                setPage(1);
                            }}
                            className="text-xs"
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((item) => (
                        <Button
                            key={item.value}
                            variant={statusFilter === item.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                setStatusFilter(item.value as UserStatus | "");
                                setPage(1);
                            }}
                            className="text-xs"
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* ─── Users List ─ */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Danh sách người dùng</CardTitle>
                    <CardDescription>
                        {pagination ? `${pagination.total} người dùng` : "Đang tải..."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {usersQuery.isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Không tìm thấy người dùng nào phù hợp.
                        </p>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.id}
                                className="rounded-lg border border-border/70 bg-background/70 p-4 text-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{user.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RoleBadge role={user.role} />
                                        <UserStatusBadge status={user.status} />
                                    </div>
                                </div>
                                <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
                                    <p>
                                        Số dư khả dụng:{" "}
                                        <span className="font-medium text-foreground">
                                            {user.wallet ? formatCurrency(user.wallet.availableBalance) : "N/A"}
                                        </span>
                                    </p>
                                    <p>
                                        Số dư phong tỏa:{" "}
                                        <span className="font-medium text-foreground">
                                            {user.wallet ? formatCurrency(user.wallet.heldBalance) : "N/A"}
                                        </span>
                                    </p>
                                    <p>
                                        Ngày tạo:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(user.createdAt)}
                                        </span>
                                    </p>
                                </div>

                                {/* ─── Actions ─ */}
                                <div className="mt-3 flex gap-2">
                                    {user.status === "ACTIVE" && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleStatusChange(user.id, user.fullName, "SUSPENDED")
                                                }
                                                disabled={updateStatusMutation.isPending}
                                                className="text-xs"
                                            >
                                                ⏸️ Tạm dừng
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    handleStatusChange(user.id, user.fullName, "BANNED")
                                                }
                                                disabled={updateStatusMutation.isPending}
                                                className="text-xs"
                                            >
                                                🚫 Cấm
                                            </Button>
                                        </>
                                    )}
                                    {(user.status === "SUSPENDED" || user.status === "BANNED") && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleStatusChange(user.id, user.fullName, "ACTIVE")
                                            }
                                            disabled={updateStatusMutation.isPending}
                                            className="text-xs"
                                        >
                                            ✅ Kích hoạt lại
                                        </Button>
                                    )}
                                    {user.status === "UNVERIFIED" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleStatusChange(user.id, user.fullName, "ACTIVE")
                                            }
                                            disabled={updateStatusMutation.isPending}
                                            className="text-xs"
                                        >
                                            ✅ Xác minh & Kích hoạt
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* ─── Pagination ─ */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ← Trang trước
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Trang sau →
                    </Button>
                </div>
            )}

            {usersQuery.isError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải danh sách người dùng. Vui lòng thử lại sau.
                </p>
            )}
        </section>
    );
}
