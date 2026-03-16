"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAuctionDetail } from "@/lib/api/auctions.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTE_CONSTANTS } from "@/constants/app.constants";

type AuctionDetailPageProps = {
    params: Promise<{ id: string }>;
};

function formatCurrency(value: string | number) {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return String(value);

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(numericValue);
}

export default function AuctionDetailPage({ params }: AuctionDetailPageProps) {
    const { id } = use(params);

    const auctionsDetailQuery = useQuery({
        queryKey: QUERY_KEYS.auctions.detail(id),
        queryFn: () => getAuctionDetail(id),
    });

    const auction = auctionsDetailQuery.data?.product;

    return (
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
            <Link
                href={ROUTE_CONSTANTS.AUCTIONS_PREFIX}
                className="text-sm text-muted-foreground hover:text-foreground"
            >
                ← Quay lại danh sách auctions
            </Link>

            {auctionsDetailQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải chi tiết auction...</p>
            ) : auctionsDetailQuery.isError || !auction ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải chi tiết auction.
                </p>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle className="text-2xl">{auction.title}</CardTitle>
                            <Badge variant="outline">{auction.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <p>{auction.description}</p>
                        <div className="grid gap-2 md:grid-cols-2">
                            <p>
                                Giá khởi điểm:{" "}
                                <span className="font-semibold">{formatCurrency(auction.startPrice)}</span>
                            </p>
                            <p>
                                Giá hiện tại:{" "}
                                <span className="font-semibold">{formatCurrency(auction.currentPrice)}</span>
                            </p>
                            <p>
                                Bước giá: <span className="font-semibold">{formatCurrency(auction.bidIncrement)}</span>
                            </p>
                            <p>Kết thúc: {new Date(auction.endTime).toLocaleString("vi-VN")}</p>
                        </div>

                        <div className="grid gap-2 rounded-lg border border-border/70 p-3 md:grid-cols-2">
                            <p>
                                Seller: <span className="font-medium">{auction.seller?.fullName ?? "N/A"}</span>
                            </p>
                            <p>
                                Category: <span className="font-medium">{auction.category?.name ?? "N/A"}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}
