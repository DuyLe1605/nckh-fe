"use client";

import { useState } from "react";
import { type WalletTransaction } from "@/lib/api/wallets.api";
import { useMyWalletQuery, useDepositMutation } from "@/lib/query/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle } from "lucide-react";

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

const TX_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    DEPOSIT: { label: "Nạp tiền", color: "text-green-600 dark:text-green-400" },
    WITHDRAW: { label: "Rút tiền", color: "text-red-600 dark:text-red-400" },
    HOLD: { label: "Tạm giữ", color: "text-amber-600 dark:text-amber-400" },
    RELEASE: { label: "Hoàn trả", color: "text-blue-600 dark:text-blue-400" },
    PAYMENT: { label: "Thanh toán", color: "text-purple-600 dark:text-purple-400" },
};

function TxTypeBadge({ type }: { type: string }) {
    const info = TX_TYPE_LABELS[type] ?? { label: type, color: "" };
    return <span className={`text-xs font-medium ${info.color}`}>{info.label}</span>;
}

type Notification = { type: "success" | "error"; text: React.ReactNode };

export default function WalletPage() {
    const [amount, setAmount] = useState("");
    const [notification, setNotification] = useState<Notification | null>(null);

    const walletQuery = useMyWalletQuery();

    const depositMutation = useDepositMutation();

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = Number(amount);
        if (Number.isNaN(num) || num < 1) {
            setNotification({ type: "error", text: "Số tiền phải lớn hơn 0" });
            setTimeout(() => setNotification(null), 4000);
            return;
        }
        depositMutation.mutate(num, {
            onSuccess: (data) => {
                setNotification({ type: "success", text: <><CheckCircle className="mr-1 inline-block h-4 w-4" /> Nạp thành công {formatCurrency(data.transaction.amount)}</> });
                setAmount("");
                setTimeout(() => setNotification(null), 4000);
            },
            onError: (error: any) => {
                setNotification({ type: "error", text: <><XCircle className="mr-1 inline-block h-4 w-4" /> {error?.message ?? "Nạp tiền thất bại"}</> });
                setTimeout(() => setNotification(null), 4000);
            }
        });
    };

    const wallet = walletQuery.data?.wallet;
    const transactions: WalletTransaction[] = wallet?.transactions ?? [];

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Ví Của Tôi</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Quản lý số dư tiền và lịch sử giao dịch (Escrow).
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

            {/* ─── Balance Cards ─ */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-primary/30 bg-primary/5">
                    <CardHeader>
                        <CardDescription>Số dư khả dụng</CardDescription>
                        <CardTitle className="text-2xl tabular-nums text-primary">
                            {walletQuery.isLoading ? (
                                <Skeleton className="h-8 w-40" />
                            ) : (
                                formatCurrency(wallet?.availableBalance ?? 0)
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Có thể dùng để đặt giá
                    </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardHeader>
                        <CardDescription>Đang tạm giữ (Escrow)</CardDescription>
                        <CardTitle className="text-2xl tabular-nums text-amber-600 dark:text-amber-400">
                            {walletQuery.isLoading ? (
                                <Skeleton className="h-8 w-40" />
                            ) : (
                                formatCurrency(wallet?.heldBalance ?? 0)
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Bị khóa cho các bid đang WINNING
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Tổng cộng</CardDescription>
                        <CardTitle className="text-2xl tabular-nums">
                            {walletQuery.isLoading ? (
                                <Skeleton className="h-8 w-40" />
                            ) : (
                                formatCurrency(
                                    Number(wallet?.availableBalance ?? 0) + Number(wallet?.heldBalance ?? 0),
                                )
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Khả dụng + Tạm giữ
                    </CardContent>
                </Card>
            </div>

            {/* ─── Deposit Form ─ */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Nạp tiền</CardTitle>
                    <CardDescription>
                        Nạp tiền vào ví để tham gia đấu giá (mock — tự động cộng).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleDeposit} className="flex gap-2">
                        <Input
                            id="deposit-amount"
                            type="number"
                            min={1}
                            step={1000}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số tiền (VND)"
                            disabled={depositMutation.isPending}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={depositMutation.isPending} className="shrink-0">
                            {depositMutation.isPending ? "Đang nạp..." : "Nạp tiền"}
                        </Button>
                    </form>
                    <div className="mt-3 flex gap-2">
                        {[100_000, 500_000, 1_000_000, 5_000_000].map((preset) => (
                            <Button
                                key={preset}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAmount(String(preset))}
                                className="text-xs"
                            >
                                {formatCurrency(preset)}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ─── Transaction History ─ */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Lịch sử giao dịch</CardTitle>
                    <CardDescription>20 giao dịch gần nhất</CardDescription>
                </CardHeader>
                <CardContent>
                    {walletQuery.isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full rounded" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {transactions.map((tx) => (
                                <li key={tx.id} className="flex items-center justify-between py-3 text-sm">
                                    <div className="flex flex-col gap-0.5">
                                        <TxTypeBadge type={tx.transactionType} />
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(tx.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold tabular-nums">
                                            {["DEPOSIT", "RELEASE"].includes(tx.transactionType) ? "+" : "−"}
                                            {formatCurrency(tx.amount)}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={
                                                tx.status === "COMPLETED"
                                                    ? "border-green-500/40 text-green-600 dark:text-green-400"
                                                    : tx.status === "FAILED"
                                                      ? "border-destructive/40 text-destructive"
                                                      : ""
                                            }
                                        >
                                            {tx.status === "COMPLETED" ? "THÀNH CÔNG" : tx.status === "FAILED" ? "THẤT BẠI" : tx.status}
                                        </Badge>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {walletQuery.isError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải dữ liệu ví. Vui lòng thử lại sau.
                </p>
            )}
        </section>
    );
}
