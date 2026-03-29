"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAuctionDetail } from "@/lib/api/auctions.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveBidPanel } from "@/components/auction/LiveBidPanel";
import { ReportDialog } from "@/components/auction/ReportDialog";
import { ROUTE_CONSTANTS, APP_CONSTANTS } from "@/constants/app.constants";

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
    const currentUserId = useAuthUiStore((s) => s.currentUserId);

    const auctionsDetailQuery = useQuery({
        queryKey: QUERY_KEYS.auctions.detail(id),
        queryFn: () => getAuctionDetail(id),
        staleTime: 60_000,
    });

    const auction = auctionsDetailQuery.data?.product;

    return (
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
            <Link
                href={ROUTE_CONSTANTS.AUCTIONS_PREFIX}
                className="text-sm text-muted-foreground hover:text-foreground"
            >
                ← Quay lại danh sách đấu giá
            </Link>

            {auctionsDetailQuery.isLoading ? (
                /* ─── Skeleton layout ─ */
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <Skeleton className="h-7 w-2/3" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="grid gap-2 md:grid-cols-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-5 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            ) : auctionsDetailQuery.isError || !auction ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải chi tiết auction.
                </p>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* ─── Product Info Card ─ */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <CardTitle className="text-2xl">{auction.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{auction.status}</Badge>
                                    {currentUserId && auction.seller?.id !== currentUserId && (
                                        <ReportDialog
                                            reportedUserId={auction.seller?.id ?? ""}
                                            productId={auction.id}
                                        />
                                    )}
                                </div>
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
                                    Bước giá:{" "}
                                    <span className="font-semibold">{formatCurrency(auction.bidIncrement)}</span>
                                </p>
                                <p>Kết thúc: {new Date(auction.effectiveEndTime ?? auction.endTime).toLocaleString("vi-VN")}</p>
                            </div>

                            <div className="grid gap-2 rounded-lg border border-border/70 p-3 md:grid-cols-2">
                                <p>
                                    Người bán:{" "}
                                    <span className="font-medium">{auction.seller?.fullName ?? "N/A"}</span>
                                </p>
                                <p>
                                    Danh mục:{" "}
                                    <span className="font-medium">{auction.category?.name ?? "N/A"}</span>
                                </p>
                            </div>

                            {/* Image Gallery */}
                            {auction.imageUrls && auction.imageUrls.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <h3 className="font-medium">Hình ảnh sản phẩm</h3>
                                    <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                                        {auction.imageUrls.map((url: string, index: number) => {
                                            const fullUrl = url.startsWith("http")
                                                ? url
                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(APP_CONSTANTS.API_PREFIX, "")}${url}`;
                                            return (
                                                <div key={index} className="flex-none w-48 h-48 sm:w-64 sm:h-64 relative rounded-lg overflow-hidden border snap-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={fullUrl} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ─── Live Bid Panel ─ */}
                    <LiveBidPanel
                        productId={id}
                        initialPrice={Number(auction.currentPrice)}
                        bidIncrement={Number(auction.bidIncrement)}
                        status={auction.status}
                        effectiveEndTime={auction.effectiveEndTime ?? auction.endTime}
                        currentUserId={currentUserId ?? undefined}
                    />
                </div>
            )}
        </main>
    );
}

