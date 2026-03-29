"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWatchlist, removeFromWatchlist } from "@/lib/api/watchlists.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

function formatCurrency(value: string | number) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(num);
}

export default function WatchlistPage() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["watchlist"],
        queryFn: () => getWatchlist(1, 50),
    });

    const removeMutation = useMutation({
        mutationFn: removeFromWatchlist,
        onSuccess: () => {
            toast.success("Đã xoá khỏi danh sách theo dõi");
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        },
        onError: () => {
            toast.error("Có lỗi xảy ra khi xoá");
        }
    });

    const items = query.data?.items ?? [];

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Sản phẩm đang theo dõi</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Danh sách các phiên đấu giá bạn đã lưu để theo dõi tiến độ.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Watchlist</CardTitle>
                    <CardDescription>Các sản phẩm bạn yêu thích</CardDescription>
                </CardHeader>
                <CardContent>
                    {query.isLoading ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Bạn chưa theo dõi sản phẩm nào.{" "}
                            <Link href="/auctions" className="font-medium underline underline-offset-4">
                                Khám phá các phiên đấu giá
                            </Link>
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => (
                                <div key={item.id} className="group relative flex flex-col justify-between overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition hover:shadow-md">
                                    <Link href={`/auctions/${item.productId}`} className="flex-1">
                                        <div className="relative aspect-[4/3] w-full bg-muted">
                                            {item.product?.imageUrls?.[0] ? (
                                                <Image 
                                                    src={item.product.imageUrls[0]} 
                                                    alt={item.product.title} 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="line-clamp-2 font-semibold">
                                                {item.product?.title || "Sản phẩm không xác định"}
                                            </h3>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-lg font-bold text-primary">
                                                    {formatCurrency(item.product?.currentPrice ?? 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="border-t p-4 pt-3 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeMutation.mutate(item.productId);
                                            }}
                                            disabled={removeMutation.isPending}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Bỏ theo dõi
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
