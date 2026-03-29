"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    listOrders,
    updateOrderStatus,
    type OrderItem,
    type OrderStatus,
} from "@/lib/api/orders.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PENDING_PAYMENT: {
        label: "Chờ thanh toán",
        className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    PAYMENT_SECURED: {
        label: "Đã thanh toán",
        className: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    SHIPPED: {
        label: "Đang giao",
        className: "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    },
    COMPLETED: {
        label: "Hoàn thành",
        className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",
    },
    DISPUTED: {
        label: "Tranh chấp",
        className: "border-destructive/40 bg-destructive/10 text-destructive",
    },
};

function OrderStatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, className: "" };
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}

type Notification = { type: "success" | "error"; text: string };

export default function SellerOrdersPage() {
    const queryClient = useQueryClient();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

    const ordersQuery = useQuery({
        queryKey: QUERY_KEYS.orders.list(
            statusFilter ? { status: statusFilter } : undefined,
        ),
        queryFn: () =>
            listOrders(statusFilter ? { status: statusFilter as OrderStatus } : {}),
        staleTime: 15_000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            updateOrderStatus(id, status),
        onSuccess: (data) => {
            setNotification({ type: "success", text: `✅ ${data.message}` });
            void queryClient.invalidateQueries({ queryKey: ["orders"] });
            setTimeout(() => setNotification(null), 4000);
        },
        onError: (error: { message?: string }) => {
            setNotification({ type: "error", text: `❌ ${error?.message ?? "Cập nhật thất bại"}` });
            setTimeout(() => setNotification(null), 4000);
        },
    });

    const orders: OrderItem[] = ordersQuery.data?.orders ?? [];
    const pagination = ordersQuery.data?.pagination;

    const paymentSecuredCount = orders.filter((o) => o.status === "PAYMENT_SECURED").length;
    const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
    const disputedCount = orders.filter((o) => o.status === "DISPUTED").length;

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Quản lý đơn hàng</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Theo dõi đơn hàng sau đấu giá: thanh toán escrow → vận chuyển → hoàn tất.
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Tổng đơn</CardDescription>
                        <CardTitle>
                            {ordersQuery.isLoading ? <Skeleton className="h-8 w-12" /> : pagination?.total ?? 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Chờ giao hàng</CardDescription>
                        <CardTitle className="text-blue-600 dark:text-blue-400">
                            {ordersQuery.isLoading ? <Skeleton className="h-8 w-12" /> : paymentSecuredCount}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Đang giao</CardDescription>
                        <CardTitle className="text-indigo-600 dark:text-indigo-400">
                            {ordersQuery.isLoading ? <Skeleton className="h-8 w-12" /> : shippedCount}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Tranh chấp</CardDescription>
                        <CardTitle className="text-destructive">
                            {ordersQuery.isLoading ? <Skeleton className="h-8 w-12" /> : disputedCount}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* ─── Filter ─ */}
            <div className="flex flex-wrap gap-2">
                {[
                    { value: "", label: "Tất cả" },
                    { value: "PAYMENT_SECURED", label: "Đã thanh toán" },
                    { value: "SHIPPED", label: "Đang giao" },
                    { value: "COMPLETED", label: "Hoàn thành" },
                    { value: "DISPUTED", label: "Tranh chấp" },
                ].map((item) => (
                    <Button
                        key={item.value}
                        variant={statusFilter === item.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(item.value as OrderStatus | "")}
                        className="text-xs"
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            {/* ─── Orders List ─ */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Danh sách đơn hàng</CardTitle>
                    <CardDescription>
                        {pagination ? `${pagination.total} đơn hàng` : "Đang tải..."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {ordersQuery.isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {statusFilter
                                ? "Không có đơn hàng nào với trạng thái này."
                                : "Chưa có đơn hàng nào."}
                        </p>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-lg border border-border/70 bg-background/70 p-4 text-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">{order.product?.title ?? "N/A"}</p>
                                    <OrderStatusBadge status={order.status} />
                                </div>
                                <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-4">
                                    <p>
                                        Buyer:{" "}
                                        <span className="font-medium text-foreground">
                                            {order.buyer?.fullName ?? "N/A"}
                                        </span>
                                    </p>
                                    <p>
                                        Giá:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(order.finalPrice)}
                                        </span>
                                    </p>
                                    <p>
                                        Phí nền tảng:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(order.platformFee)}
                                        </span>
                                    </p>
                                    <p>
                                        Ngày tạo:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </p>
                                </div>

                                {/* ─── Actions ─ */}
                                <div className="mt-3 flex gap-2">
                                    {order.status === "PAYMENT_SECURED" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                updateStatusMutation.mutate({
                                                    id: order.id,
                                                    status: "SHIPPED",
                                                })
                                            }
                                            disabled={updateStatusMutation.isPending}
                                            className="text-xs"
                                        >
                                            📦 Đánh dấu đã giao
                                        </Button>
                                    )}
                                    {order.status === "PAYMENT_SECURED" && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                updateStatusMutation.mutate({
                                                    id: order.id,
                                                    status: "DISPUTED",
                                                })
                                            }
                                            disabled={updateStatusMutation.isPending}
                                            className="text-xs"
                                        >
                                            ⚠️ Báo tranh chấp
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {ordersQuery.isError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.
                </p>
            )}
        </section>
    );
}
