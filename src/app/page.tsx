"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuctionsQuery } from "@/lib/query/hooks/use-auctions";
import { ROUTE_CONSTANTS } from "@/constants/app.constants";
import { type AuctionItem } from "@/lib/api/auctions.api";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowRight, ChevronRight, Zap, ShieldCheck, Flame, Clock } from "lucide-react";

function formatCurrency(value: string | number) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(num);
}

export default function HomePage() {
    // Fetch top 4 ACTIVE auctions
    const featuredAuctionsQuery = useAuctionsQuery({ status: "ACTIVE", pageSize: 4, sortBy: "endTime", sortOrder: "asc" });

    const featuredAuctions = featuredAuctionsQuery.data?.products ?? [];

    return (
        <main className="min-h-screen pb-20">
            {/* ─── Hero Section ─── */}
            <section className="relative overflow-hidden pt-24 pb-32 mt-[-84px] lg:pt-36 lg:pb-40 rounded-b-[3rem] bg-gradient-to-b from-background to-muted/30 border-b border-border/50">
                {/* Decorative background blur blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none mix-blend-screen" />
                <div className="absolute top-40 -left-40 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(var(--primary),0.2)] animate-pulse">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>Sàn Đấu giá Trực tuyến Đỉnh cao</span>
                    </div>
                    
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                        Nâng tầm trải nghiệm <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-cyan-400">
                            Đấu Giá Sinh Lời
                        </span>
                    </h1>
                    
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                        Khám phá hàng ngàn vật phẩm giá trị với hệ thống đấu giá thời gian thực, tính năng tự động (proxy bidding) và ví điện tử an toàn tuyệt đối.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href={ROUTE_CONSTANTS.AUCTIONS_PREFIX}
                            className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                        >
                            Khám phá ngay
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href={ROUTE_CONSTANTS.REGISTER}
                            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border-2 border-muted bg-transparent px-8 text-base font-semibold transition-all hover:border-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            Đăng ký Tài khoản
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-border/60">
                        {[
                            { label: "Real-time Bidding", icon: Zap },
                            { label: "Bảo mật Ví Escrow", icon: ShieldCheck },
                            { label: "Anti-sniping (+30s)", icon: Clock },
                            { label: "Auto Proxy Bidding", icon: Flame },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                <item.icon className="h-6 w-6" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Featured Auctions Section ─── */}
            <section className="container mx-auto px-6 mt-20 max-w-7xl">
                <div className="flex flex-col sm:flex-row items-end justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Phiên đấu giá Nổi bật</h2>
                        <p className="text-muted-foreground mt-2">Các sản phẩm hấp dẫn đang sắp kết thúc, đừng bỏ lỡ!</p>
                    </div>
                    <Link
                        href={ROUTE_CONSTANTS.AUCTIONS_PREFIX}
                        className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline hover:underline-offset-4"
                    >
                        Xem tất cả <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {featuredAuctionsQuery.isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-2xl bg-muted/50 h-[380px]" />
                        ))}
                    </div>
                ) : featuredAuctions.length === 0 ? (
                    <div className="text-center py-20 px-6 rounded-3xl border border-dashed border-border/80 bg-muted/20">
                        <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <h3 className="text-xl font-semibold mb-2">Chưa có phiên đang diễn ra</h3>
                        <p className="text-muted-foreground">Vui lòng quay lại sau khi người bán đăng sản phẩm mới.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredAuctions.map((auction: AuctionItem) => (
                            <Link 
                                href={`${ROUTE_CONSTANTS.AUCTIONS_PREFIX}/${auction.id}`} 
                                key={auction.id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                                    {auction.imageUrls && auction.imageUrls[0] ? (
                                        <Image
                                            src={auction.imageUrls[0]}
                                            alt={auction.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground bg-secondary/50">
                                            Không có ảnh
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 z-10">
                                        <StatusBadge status={auction.status} />
                                    </div>
                                    {/* Glassmorphism gradient overly on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </div>
                                <div className="flex flex-col flex-1 p-5">
                                    <h3 className="font-semibold text-lg line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                                        {auction.title}
                                    </h3>
                                    <div className="mt-auto pt-4 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground mb-1">Giá hiện tại</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-foreground">
                                                {formatCurrency(auction.currentPrice)}
                                            </span>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:text-primary group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
