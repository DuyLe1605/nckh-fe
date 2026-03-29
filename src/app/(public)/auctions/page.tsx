"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listAuctions } from "@/lib/api/auctions.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { useAuctionsUiStore, type AuctionFilterStatus } from "@/stores/auctions-ui.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTE_CONSTANTS } from "@/constants/app.constants";

const statusOptions: Array<{ value: AuctionFilterStatus; label: string }> = [
    { value: "ACTIVE", label: "Đang diễn ra" },
    { value: "ENDED", label: "Đã kết thúc" },
    { value: "SOLD", label: "Đã bán" },
    { value: "UNSOLD", label: "Chưa bán được" },
    { value: "ALL", label: "Tất cả" },
];

function formatCurrency(value: string | number) {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return String(value);

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(numericValue);
}

export default function AuctionsListPage() {
    const { page, pageSize, search, status, setPage, setPageSize, setSearch, setStatus, resetFilters } =
        useAuctionsUiStore();

    const queryParams = useMemo(
        () => ({
            page,
            pageSize,
            search: search.trim() || undefined,
            status: status === "ALL" ? undefined : status,
            sortBy: "createdAt" as const,
            sortOrder: "desc" as const,
        }),
        [page, pageSize, search, status],
    );

    const auctionsQuery = useQuery({
        queryKey: QUERY_KEYS.auctions.list(queryParams),
        queryFn: () => listAuctions(queryParams),
    });

    const auctions = auctionsQuery.data?.products ?? [];
    const pagination = auctionsQuery.data?.pagination;

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
            <section className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">Danh sách các phiên đấu giá</h1>
                <p className="text-sm text-muted-foreground">
                    Bộ lọc và phân trang chuyên sâu qua TanStack Query và Zustand State.
                </p>
            </section>

            <section className="grid gap-3 rounded-xl border border-border/70 bg-background/70 p-4 md:grid-cols-[1fr_auto_auto]">
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm theo tiêu đề/mô tả..."
                />

                <Input
                    type="number"
                    min={1}
                    max={100}
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value || 12))}
                    className="w-full md:w-28"
                    aria-label="Page size"
                />

                <Button variant="outline" onClick={resetFilters}>
                    Reset
                </Button>
            </section>

            <section className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                    <Button
                        key={option.value}
                        size="sm"
                        variant={status === option.value ? "default" : "outline"}
                        onClick={() => setStatus(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </section>

            {auctionsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>
            ) : auctionsQuery.isError ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải danh sách auctions. Vui lòng thử lại.
                </p>
            ) : auctions.length === 0 ? (
                <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                    Không có dữ liệu khớp bộ lọc hiện tại.
                </p>
            ) : (
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {auctions.map((auction) => (
                        <Card key={auction.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="line-clamp-2">{auction.title}</CardTitle>
                                    <StatusBadge status={auction.status} />
                                </div>
                                <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <p>
                                    Giá hiện tại:{" "}
                                    <span className="font-medium">{formatCurrency(auction.currentPrice)}</span>
                                </p>
                                <p>
                                    Bước giá:{" "}
                                    <span className="font-medium">{formatCurrency(auction.bidIncrement)}</span>
                                </p>
                                <p className="text-muted-foreground">
                                    Kết thúc: {new Date(auction.endTime).toLocaleString("vi-VN")}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Link
                                    href={`${ROUTE_CONSTANTS.AUCTIONS_PREFIX}/${auction.id}`}
                                    className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted"
                                >
                                    Xem chi tiết
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </section>
            )}

            <section className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                <p className="text-sm text-muted-foreground">
                    Trang {pagination?.page ?? page} / {pagination?.totalPages ?? 1} • Tổng{" "}
                    {pagination?.total ?? auctions.length}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={(pagination?.page ?? page) <= 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Trước
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination ? pagination.page >= pagination.totalPages : auctions.length < pageSize}
                        onClick={() => setPage(page + 1)}
                    >
                        Sau
                    </Button>
                </div>
            </section>
        </main>
    );
}
