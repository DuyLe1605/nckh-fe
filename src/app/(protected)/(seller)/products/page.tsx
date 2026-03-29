"use client";

import { useState } from "react";
import Link from "next/link";
import {
    type ProductItem,
    type ProductStatus,
} from "@/lib/api/products.api";
import { useMyProductsQuery, useDeleteProductMutation } from "@/lib/query/hooks/use-products";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Pencil, Trash2, Eye } from "lucide-react";

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
    DRAFT: {
        label: "Nháp",
        className: "border-zinc-500/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
    },
    SCHEDULED: {
        label: "Đã lên lịch",
        className: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
    ACTIVE: {
        label: "Đang hoạt động",
        className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",
    },
    ENDED: {
        label: "Đã kết thúc",
        className: "border-zinc-500/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
    },
    SOLD: {
        label: "Đã bán",
        className: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    UNSOLD: {
        label: "Không bán được",
        className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
};

function ProductStatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, className: "" };
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}

type Notification = { type: "success" | "error"; text: React.ReactNode };

const STATUS_FILTERS: { value: ProductStatus | ""; label: string }[] = [
    { value: "", label: "Tất cả" },
    { value: "DRAFT", label: "Nháp" },
    { value: "SCHEDULED", label: "Đã lên lịch" },
    { value: "ACTIVE", label: "Đang hoạt động" },
    { value: "ENDED", label: "Đã kết thúc" },
    { value: "SOLD", label: "Đã bán" },
    { value: "UNSOLD", label: "Không bán được" },
];

export default function SellerProductsPage() {
    const currentUserId = useAuthUiStore((s) => s.currentUserId);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("");

    const productsQuery = useMyProductsQuery(currentUserId ?? "", statusFilter ? { status: statusFilter } : {});

    const deleteMutation = useDeleteProductMutation();

    const products: ProductItem[] = productsQuery.data?.products ?? [];
    const pagination = productsQuery.data?.pagination;

    return (
        <section className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Sản phẩm của tôi</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Quản lý danh sách sản phẩm đấu giá của bạn.
                    </p>
                </div>
                <Link href="/products/create">
                    <Button size="sm">+ Tạo sản phẩm mới</Button>
                </Link>
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

            {/* ─── Filter ─ */}
            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((item) => (
                    <Button
                        key={item.value}
                        variant={statusFilter === item.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(item.value as ProductStatus | "")}
                        className="text-xs"
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            {/* ─── Products List ─ */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
                    <CardDescription>
                        {pagination ? `${pagination.total} sản phẩm` : "Đang tải..."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {productsQuery.isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-28 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {statusFilter
                                ? "Không có sản phẩm nào với trạng thái này."
                                : "Bạn chưa có sản phẩm nào. Hãy tạo sản phẩm đầu tiên!"}
                        </p>
                    ) : (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className="rounded-lg border border-border/70 bg-background/70 p-4 text-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{product.title}</p>
                                        {product.category && (
                                            <Badge variant="outline" className="text-xs">
                                                {product.category.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <ProductStatusBadge status={product.status} />
                                </div>
                                <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-4">
                                    <p>
                                        Giá khởi điểm:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(product.startPrice)}
                                        </span>
                                    </p>
                                    <p>
                                        Giá hiện tại:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(product.currentPrice)}
                                        </span>
                                    </p>
                                    <p>
                                        Kết thúc:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(product.endTime)}
                                        </span>
                                    </p>
                                    <p>
                                        Tạo lúc:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(product.createdAt)}
                                        </span>
                                    </p>
                                </div>

                                {/* ─── Actions ─ */}
                                <div className="mt-3 flex gap-2">
                                    {product.status !== "ACTIVE" && product.status !== "SOLD" && (
                                        <Link href={`/products/edit/${product.id}`}>
                                            <Button size="sm" variant="outline" className="text-xs">
                                                <Pencil className="mr-1.5 inline-block h-3.5 w-3.5" /> Chỉnh sửa
                                            </Button>
                                        </Link>
                                    )}
                                    {product.status !== "ACTIVE" && product.status !== "SOLD" && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                if (window.confirm(`Xóa sản phẩm "${product.title}"?`)) {
                                                    deleteMutation.mutate(product.id, {
                                                        onSuccess: (data) => {
                                                            setNotification({ type: "success", text: <><CheckCircle className="mr-1 inline-block h-4 w-4" /> {data.message}</> });
                                                            setTimeout(() => setNotification(null), 4000);
                                                        },
                                                        onError: (error: any) => {
                                                            setNotification({ type: "error", text: <><XCircle className="mr-1 inline-block h-4 w-4" /> {error?.message ?? "Xóa thất bại"}</> });
                                                            setTimeout(() => setNotification(null), 4000);
                                                        }
                                                    });
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                            className="text-xs"
                                        >
                                            <Trash2 className="mr-1.5 inline-block h-3.5 w-3.5" /> Xóa
                                        </Button>
                                    )}
                                    <Link href={`/auctions/${product.id}`}>
                                        <Button size="sm" variant="ghost" className="text-xs">
                                            <Eye className="mr-1.5 inline-block h-3.5 w-3.5" /> Xem chi tiết
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* ─── Pagination ─ */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <p className="text-xs text-muted-foreground">
                        Trang {pagination.page} / {pagination.totalPages} ({pagination.total} sản phẩm)
                    </p>
                </div>
            )}

            {productsQuery.isError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.
                </p>
            )}
        </section>
    );
}
