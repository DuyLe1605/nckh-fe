"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { bidderAuctionsMock } from "@/lib/mock/sprint5-workflows.mock";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
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

export default function BidderDashboardPage() {
    const [nowMs, setNowMs] = useState(Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNowMs(Date.now());
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const winning = useMemo(() => bidderAuctionsMock.filter((item) => item.state === "WINNING"), []);
    const outbid = useMemo(() => bidderAuctionsMock.filter((item) => item.state === "OUTBID"), []);
    const watchlist = useMemo(
        () => bidderAuctionsMock.filter((item) => item.state === "WATCHING" || item.state === "OUTBID"),
        [],
    );

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Bidder Dashboard</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Theo dõi trạng thái winning/outbid/watchlist theo thời gian thực, có countdown theo
                    <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">effective_end_time</code>
                    và hiển thị anti-sniping extension.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Winning</CardDescription>
                        <CardTitle>{winning.length} phiên</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Tổng giá trị bid đang dẫn đầu:{" "}
                        {formatCurrency(winning.reduce((sum, item) => sum + item.myBid, 0))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Outbid</CardDescription>
                        <CardTitle>{outbid.length} phiên</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Cần theo dõi để rebid trước khi countdown về 00:00:00.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Watchlist</CardDescription>
                        <CardTitle>{watchlist.length} phiên</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Có cảnh báo anti-sniping cho các phiên gần kết thúc.
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách theo dõi phiên đấu giá</CardTitle>
                    <CardDescription>
                        Dữ liệu mẫu Sprint 5: đa trạng thái (winning / outbid / watching), đa danh mục.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {bidderAuctionsMock.map((item) => {
                        const gap = item.currentPrice - item.myBid;

                        return (
                            <div
                                key={item.id}
                                className="rounded-lg border border-border/70 bg-background/70 p-4 text-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">{item.title}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{item.category}</Badge>
                                        <StatusBadge status={item.state} />
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-4">
                                    <p>
                                        Bid của bạn:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(item.myBid)}
                                        </span>
                                    </p>
                                    <p>
                                        Giá hiện tại:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(item.currentPrice)}
                                        </span>
                                    </p>
                                    <p>
                                        Countdown:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatCountdown(item.effectiveEndTime, nowMs)}
                                        </span>
                                    </p>
                                    <p>
                                        Anti-sniping: +{item.antiSnipingExtend}s × {item.antiSnipingExtensions}
                                    </p>
                                </div>

                                {item.state === "OUTBID" ? (
                                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                        Bạn đang bị outbid {formatCurrency(Math.max(0, gap))}. Cân nhắc rebid trước khi
                                        hết giờ.
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </section>
    );
}
