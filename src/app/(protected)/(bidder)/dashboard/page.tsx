"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMyBids, type MyBidItem } from "@/lib/api/bids.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { Badge } from "@/components/ui/badge";
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

function formatCountdown(targetIso: string, nowMs: number) {
    const diff = new Date(targetIso).getTime() - nowMs;
    if (diff <= 0) return "Đã kết thúc";

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string }> = {
        WINNING: { label: "🏆 Dẫn đầu", className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300" },
        OUTBID: { label: "⚠️ Bị vượt", className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
        RETRACTED: { label: "↩ Rút lại", className: "border-muted-foreground/40 bg-muted text-muted-foreground" },
    };
    const info = map[status] ?? { label: status, className: "" };
    return <Badge variant="outline" className={info.className}>{info.label}</Badge>;
}

export default function BidderDashboardPage() {
    const [nowMs, setNowMs] = useState(Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const myBidsQuery = useQuery({
        queryKey: QUERY_KEYS.bids.myBids(),
        queryFn: () => getMyBids({ pageSize: 50 }),
        staleTime: 30_000,
        refetchInterval: 30_000,
    });

    const bids: MyBidItem[] = myBidsQuery.data?.bids ?? [];

    // Active bids = bids on ACTIVE products
    const activeBids = bids.filter((b) => b.product?.status === "ACTIVE");
    const winning = activeBids.filter((b) => b.status === "WINNING");
    const outbid = activeBids.filter((b) => b.status === "OUTBID");
    const wonBids = bids.filter((b) => b.product?.status === "SOLD" && b.status === "WINNING");

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Trang tổng quan (Dashboard)</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Theo dõi trạng thái thẻ giá dẫn đầu / bị vượt (outbid) theo thời gian thực với đếm ngược{" "}
                    <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">effectiveEndTime</code>.
                </p>
            </header>

            {/* ─── Stats ─ */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Đang dẫn đầu</CardDescription>
                        <CardTitle className="text-green-600 dark:text-green-400">
                            {myBidsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : winning.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        {winning.length > 0
                            ? `Tổng: ${formatCurrency(winning.reduce((s, b) => s + Number(b.bidAmount), 0))}`
                            : "Chưa có phiên nào"}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Bị outbid</CardDescription>
                        <CardTitle className="text-amber-600 dark:text-amber-400">
                            {myBidsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : outbid.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        {outbid.length > 0
                            ? "Cần rebid trước khi hết giờ"
                            : "Không có phiên nào bị outbid"}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Đã thắng</CardDescription>
                        <CardTitle className="text-blue-600 dark:text-blue-400">
                            {myBidsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : wonBids.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        {wonBids.length > 0
                            ? `Tổng: ${formatCurrency(wonBids.reduce((s, b) => s + Number(b.bidAmount), 0))}`
                            : "Chưa thắng phiên nào"}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Tổng bids</CardDescription>
                        <CardTitle>
                            {myBidsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : bids.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Tất cả bids đã đặt
                    </CardContent>
                </Card>
            </div>

            {/* ─── Active Bids List ─ */}
            <Card>
                <CardHeader>
                    <CardTitle>Phiên đấu giá đang tham gia</CardTitle>
                    <CardDescription>
                        Các phiên đang ACTIVE mà bạn đã đặt bid.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {myBidsQuery.isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : activeBids.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Bạn chưa tham gia phiên đấu giá nào đang hoạt động.{" "}
                            <Link href="/auctions" className="underline underline-offset-2 hover:text-foreground">
                                Khám phá các phiên đấu giá
                            </Link>
                        </p>
                    ) : (
                        activeBids.map((bid) => {
                            const gap = Number(bid.product?.currentPrice ?? 0) - Number(bid.bidAmount);
                            return (
                                <Link
                                    key={bid.id}
                                    href={`/auctions/${bid.productId}`}
                                    className="block rounded-lg border border-border/70 bg-background/70 p-4 text-sm transition hover:border-primary/40 hover:bg-primary/5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-medium">{bid.product?.title ?? "N/A"}</p>
                                        <div className="flex items-center gap-2">
                                            {bid.product?.category?.name && (
                                                <Badge variant="outline">{bid.product.category.name}</Badge>
                                            )}
                                            <StatusBadge status={bid.status} />
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-4">
                                        <p>
                                            Bid của bạn:{" "}
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(bid.bidAmount)}
                                            </span>
                                        </p>
                                        <p>
                                            Giá hiện tại:{" "}
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(bid.product?.currentPrice ?? 0)}
                                            </span>
                                        </p>
                                        <p>
                                            Đếm ngược:{" "}
                                            <span className="font-medium text-foreground">
                                                {formatCountdown(bid.product?.effectiveEndTime ?? "", nowMs)}
                                            </span>
                                        </p>
                                        <p>
                                            Anti-sniping: +{bid.product?.antiSnipingExtend ?? 0}s
                                        </p>
                                    </div>
                                    {bid.status === "OUTBID" && gap > 0 && (
                                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                            Bạn đang bị vượt giá {formatCurrency(gap)}. Cân nhắc trả giá lại trước khi hết giờ.
                                        </p>
                                    )}
                                </Link>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {/* ─── Won Auctions ─ */}
            {wonBids.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Đã chiến thắng 🎉</CardTitle>
                        <CardDescription>
                            Các phiên bạn đã thắng — kiểm tra đơn hàng trong mục Đơn hàng của tôi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {wonBids.map((bid) => (
                            <div
                                key={bid.id}
                                className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">{bid.product?.title ?? "N/A"}</p>
                                    <Badge className="border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300">
                                        🏆 Đã thắng
                                    </Badge>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Giá thắng: <span className="font-medium text-foreground">{formatCurrency(bid.bidAmount)}</span>
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {myBidsQuery.isError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải dữ liệu bids. Vui lòng thử lại sau.
                </p>
            )}
        </section>
    );
}
