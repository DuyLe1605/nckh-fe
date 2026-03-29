"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getBidHistory, placeBid, type BidItem } from "@/lib/api/bids.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
import { useAuctionsUiStore } from "@/stores/auctions-ui.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, Trophy } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LiveBidPanelProps = {
    productId: string;
    initialPrice: number;
    bidIncrement: number;
    status: string;
    effectiveEndTime: string;
    currentUserId?: string;
};

type Notification = { type: "success" | "error" | "warning"; text: React.ReactNode };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: string | number) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(num);
}

function useCountdown(targetIso: string) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        function calc() {
            const diff = new Date(targetIso).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Đã kết thúc"); return; }
            const h = Math.floor(diff / 3_600_000);
            const m = Math.floor((diff % 3_600_000) / 60_000);
            const s = Math.floor((diff % 60_000) / 1_000);
            setTimeLeft(
                h > 0
                    ? `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
                    : `${m}m ${s.toString().padStart(2, "0")}s`,
            );
        }
        calc();
        const id = setInterval(calc, 1_000);
        return () => clearInterval(id);
    }, [targetIso]);

    return timeLeft;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LiveBidPanel({
    productId,
    initialPrice,
    bidIncrement,
    status,
    effectiveEndTime,
    currentUserId,
}: LiveBidPanelProps) {
    const queryClient = useQueryClient();
    const { currentBidPrice, setCurrentBidPrice } = useAuctionsUiStore();

    const livePrice = currentBidPrice ?? initialPrice;
    const minBid = livePrice + bidIncrement;

    const [liveEndTime, setLiveEndTime] = useState(effectiveEndTime);
    const timeLeft = useCountdown(liveEndTime);
    const [bidAmount, setBidAmount] = useState("");
    const [isProxy, setIsProxy] = useState(false);
    const [isOutbid, setIsOutbid] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);
    const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showNotif = (n: Notification) => {
        setNotification(n);
        if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
        notifTimerRef.current = setTimeout(() => setNotification(null), 4_000);
    };

    // ── Bid history query ─────────────────────────────────────────────────────
    const historyQuery = useQuery({
        queryKey: QUERY_KEYS.bids.history(productId),
        queryFn: () => getBidHistory(productId),
        staleTime: 0,
        refetchOnWindowFocus: false,
        retry: false,
    });

    const bids: BidItem[] = historyQuery.data?.bids ?? [];

    // ── Socket: realtime price update ─────────────────────────────────────────
    const handleBidUpdate = useCallback(
        (payload: { productId: string; newPrice?: number; effectiveEndTime?: string; prevWinnerBidderId?: string | null }) => {
            if (payload.newPrice) {
                setCurrentBidPrice(payload.newPrice);
                void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bids.history(productId) });
                void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auctions.detail(productId) });
            }
            if (payload.effectiveEndTime) {
                setLiveEndTime(payload.effectiveEndTime);
            }
            if (currentUserId && payload.prevWinnerBidderId === currentUserId) {
                showNotif({ type: "warning", text: <><AlertTriangle className="mr-1 inline-block h-4 w-4" /> Bạn đã bị outbid! Đặt giá cao hơn để giành lại.</> });
            }
        },
        [productId, setCurrentBidPrice, queryClient, currentUserId],
    );

    const handlePoll = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bids.history(productId) }),
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auctions.detail(productId) })
        ]);
    }, [queryClient, productId]);

    const { status: socketStatus, reconnectAttempts } = useAuctionSocket({ 
        productId, 
        onBidUpdate: handleBidUpdate,
        pollFn: handlePoll,
    });

    // ── Bid mutation ──────────────────────────────────────────────────────────
    const placeBidMutation = useMutation({
        mutationFn: () => placeBid(productId, { 
            bidAmount: isProxy ? minBid : Number(bidAmount),
            ...(isProxy ? { maxAutoBid: Number(bidAmount) } : {})
        }),
        onSuccess: (data) => {
            if (data.instantlyOutbid) {
                 showNotif({ type: "warning", text: <><AlertTriangle className="mr-1 inline-block h-4 w-4" /> {data.message ?? "Bạn đã bị vượt giá ngay lập tức bởi một Auto Bid khác cao hơn!"}</> });
            } else {
                 showNotif({ type: "success", text: <><CheckCircle className="mr-1 inline-block h-4 w-4" /> Đặt giá thành công! Giá mới: {formatCurrency(data.newPrice)}</> });
            }
            setBidAmount("");
            setIsOutbid(false);
        },
        onError: (error: { message?: string }) => {
            showNotif({ type: "error", text: <><XCircle className="mr-1 inline-block h-4 w-4" /> {error?.message ?? "Đặt giá thất bại. Vui lòng thử lại."}</> });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(bidAmount);
        if (Number.isNaN(amount) || amount < minBid) {
            showNotif({ type: "error", text: `Số tiền tối thiểu là ${formatCurrency(minBid)}` });
            return;
        }
        placeBidMutation.mutate();
    };

    if (status !== "ACTIVE") {
        return (
            <Card className="border-dashed opacity-60">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    Phiên đấu giá{" "}
                    {["ENDED", "SOLD", "UNSOLD"].includes(status) ? "đã kết thúc" : "chưa bắt đầu"}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* ─── Notification banner ─ */}
            {notification && (
                <div
                    className={
                        "rounded-lg border px-4 py-3 text-sm " +
                        (notification.type === "success"
                            ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                            : notification.type === "warning"
                              ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                              : "border-destructive/40 bg-destructive/10 text-destructive")
                    }
                >
                    {notification.text}
                </div>
            )}

            {/* ─── Live Price + Timer ─ */}
            <Card className="border-primary/40 bg-primary/5">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                        Đang diễn ra
                    </CardTitle>
                    {socketStatus !== "connected" && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400">
                            {socketStatus === "reconnecting" ? "Đang kết nối lại..." : "Kết nối yếu (Đang tải lại)"}
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Giá hiện tại</p>
                        <p className="text-2xl font-bold tabular-nums text-primary">
                            {formatCurrency(livePrice)}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Bước giá tối thiểu</p>
                        <p className="font-medium">{formatCurrency(bidIncrement)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Thời gian còn lại</p>
                        <Badge variant="outline" className="font-mono tabular-nums">
                            {timeLeft}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Outbid alert ─ */}
            {isOutbid && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertTriangle className="mr-1.5 inline h-4 w-4" /> Bạn đã bị vượt giá. Đặt lại để tiếp tục tham gia.
                </div>
            )}

            {/* ─── Bid Form ─ */}
            {currentUserId ? (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Đặt giá</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <Input
                                    id="bid-amount-input"
                                    type="number"
                                    min={minBid}
                                    step={bidIncrement}
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={isProxy ? `Mức giá tự động tối đa (Tối thiểu ${formatCurrency(minBid)})` : `Tối thiểu ${formatCurrency(minBid)}`}
                                    disabled={placeBidMutation.isPending}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={placeBidMutation.isPending}
                                    className="shrink-0"
                                >
                                    {placeBidMutation.isPending ? "Đang đặt..." : "Đặt giá"}
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2 select-none">
                                <input
                                    type="checkbox"
                                    id="proxy-checkbox"
                                    checked={isProxy}
                                    onChange={(e) => setIsProxy(e.target.checked)}
                                    disabled={placeBidMutation.isPending}
                                    className="h-4 w-4 rounded border-primary bg-background text-primary focus:ring-primary disabled:opacity-50"
                                />
                                <label
                                    htmlFor="proxy-checkbox"
                                    className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                >
                                    Đặt giá tự động (Proxy Bid) bảo vệ quyền nâng giá
                                </label>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="py-4 text-center text-sm text-muted-foreground">
                        <a href="/login" className="underline underline-offset-2 hover:text-foreground">
                            Đăng nhập
                        </a>{" "}
                        để đặt giá
                    </CardContent>
                </Card>
            )}

            {/* ─── Bid History ─ */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Lịch sử đặt giá</CardTitle>
                </CardHeader>
                <CardContent>
                    {historyQuery.isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-8 animate-pulse rounded bg-muted"
                                />
                            ))}
                        </div>
                    ) : bids.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có lượt đặt giá nào.</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {bids.map((bid) => (
                                <li
                                    key={bid.id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {bid.bidder?.fullName ?? "Ẩn danh"}
                                        </span>
                                        {bid.status === "WINNING" && (
                                            <Badge variant="default" className="text-xs">
                                                <Trophy className="mr-1 inline-block h-3 w-3" /> Dẫn đầu
                                            </Badge>
                                        )}
                                        {bid.status === "OUTBID" && (
                                            <Badge variant="outline" className="text-xs opacity-70">
                                                Outbid
                                            </Badge>
                                        )}
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {formatCurrency(bid.bidAmount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
