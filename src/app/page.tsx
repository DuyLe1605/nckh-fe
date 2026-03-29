"use client";

import Link from "next/link";
import Image from "next/image";
import { PublicFooter } from "@/components/common/public-footer";
import { motion, Variants } from "framer-motion";
import { useAuctionsQuery } from "@/lib/query/hooks/use-auctions";
import { ROUTE_CONSTANTS } from "@/constants/app.constants";
import { type AuctionItem } from "@/lib/api/auctions.api";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowRight, ChevronRight, Zap, ShieldCheck, Flame, Clock, Wallet, Trophy, TrendingUp } from "lucide-react";

function formatCurrency(value: string | number) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(num);
}

// Framer Motion Variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function HomePage() {
    // Fetch top 4 ACTIVE auctions
    const featuredAuctionsQuery = useAuctionsQuery({ status: "ACTIVE", pageSize: 4, sortBy: "endTime", sortOrder: "asc" });
    const featuredAuctions = featuredAuctionsQuery.data?.products ?? [];

    return (
        <>
        <main className="min-h-screen pb-20 overflow-hidden">
            {/* ─── HERO SECTION ─── */}
            <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-background/95 -z-20" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light -z-10" />
                
                {/* Glowing Orbs */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" 
                />
                <motion.div 
                    animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-40 -left-20 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px] -z-10" 
                />
                <motion.div 
                    animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 -right-20 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[100px] -z-10" 
                />

                <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        <motion.div variants={fadeInUp} className="flex justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                                <span>Sàn Đấu giá Trực tuyến Đỉnh cao 2026</span>
                            </div>
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
                            Nâng tầm trải nghiệm <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-cyan-400">
                                Đấu Giá Sinh Lời
                            </span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                            Khám phá hàng ngàn vật phẩm giá trị với hệ thống đấu giá **thời gian thực**, **auto proxy bidding** tự động hóa và **ví điện tử Escrow** an toàn tuyệt đối.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                href={ROUTE_CONSTANTS.AUCTIONS_PREFIX}
                                className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 overflow-hidden"
                            >
                                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
                                <span className="relative flex items-center gap-2">
                                    Khám phá ngay
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                            <Link
                                href={ROUTE_CONSTANTS.REGISTER}
                                className="inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-full border-2 border-muted bg-background/50 backdrop-blur-sm px-8 text-lg font-semibold transition-all hover:border-foreground hover:bg-muted/50 focus:outline-none"
                            >
                                Đăng ký Tài khoản
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-border/50"
                    >
                        {[
                            { label: "Real-time Bidding", icon: Zap, sub: "Không trễ nhịp" },
                            { label: "Bảo mật Ví Escrow", icon: ShieldCheck, sub: "Giao dịch an toàn" },
                            { label: "Anti-sniping System", icon: Clock, sub: "+30s cuối giờ" },
                            { label: "Auto Proxy Bidding", icon: TrendingUp, sub: "Đấu giá tự động" },
                        ].map((item, i) => (
                            <motion.div key={i} variants={scaleIn} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl hover:bg-muted/40 transition-colors cursor-default">
                                <div className="p-3 bg-primary/10 rounded-full text-primary ring-1 ring-primary/20">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-sm font-bold text-foreground">{item.label}</span>
                                    <span className="block text-xs text-muted-foreground mt-1">{item.sub}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── HOW IT WORKS SECTION ─── */}
            <section className="py-24 bg-muted/20 border-y border-border/40">
                <div className="container mx-auto px-6 max-w-7xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Hoạt động như thế nào?</h2>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">Hệ thống được thiết kế khép kín giúp bạn dễ dàng tham gia và chiến thắng.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "01", icon: Wallet, title: "Nạp tiền vào Ví", desc: "Sử dụng tính năng nạp tiền an toàn để tạo số dư. Tiền của bạn được giữ an toàn trong hệ thống ví (Escrow)." },
                            { step: "02", icon: Zap, title: "Cạnh tranh Trực tiếp", desc: "Theo dõi sản phẩm, đặt giá thủ công hoặc cấu hình mức giá tối đa (Proxy Bidding) để hệ thống tự động trả giá thay bạn." },
                            { step: "03", icon: Trophy, title: "Chiến thắng & Nhận hàng", desc: "Kết thúc phiên, người trả giá cao nhất thắng cuộc. Tiền chỉ được trừ khi bạn chốt xác nhận đã nhận hàng thành công!" },
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                className="relative bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-lg hover:border-primary/40 transition-all"
                            >
                                <div className="absolute top-6 right-6 text-6xl font-black text-muted/30 pointer-events-none">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 ring-1 ring-primary/20">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURED AUCTIONS SECTION ─── */}
            <section className="container mx-auto px-6 py-24 max-w-7xl">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row items-end justify-between gap-4 mb-10"
                >
                    <div>
                        <div className="flex items-center gap-2 text-primary font-medium tracking-wide mb-2">
                            <Flame className="w-5 h-5" />
                            <span>HOT DEALS</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Phiên đấu giá Nổi bật</h2>
                    </div>
                    <Link
                        href={ROUTE_CONSTANTS.AUCTIONS_PREFIX}
                        className="group flex items-center gap-1 text-sm font-semibold text-primary/80 hover:text-primary transition-colors hover:underline hover:underline-offset-4 bg-primary/10 px-4 py-2 rounded-full"
                    >
                        Xem tất cả <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>

                {featuredAuctionsQuery.isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-[2rem] bg-muted/60 h-[400px]" />
                        ))}
                    </div>
                ) : featuredAuctions.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-center py-20 px-6 rounded-3xl border border-dashed border-border/80 bg-muted/20"
                    >
                        <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <h3 className="text-xl font-semibold mb-2">Chưa có phiên đang diễn ra</h3>
                        <p className="text-muted-foreground">Vui lòng quay lại sau khi người bán đăng sản phẩm mới.</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {featuredAuctions.map((auction: AuctionItem) => (
                            <motion.div key={auction.id} variants={scaleIn}>
                                <Link 
                                    href={`${ROUTE_CONSTANTS.AUCTIONS_PREFIX}/${auction.id}`} 
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/60 bg-card/60 backdrop-blur-md transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 h-full"
                                >
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-secondary relative">
                                        {auction.imageUrls && auction.imageUrls[0] ? (
                                            <Image
                                                src={auction.imageUrls[0]}
                                                alt={auction.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm font-medium">
                                                Không có ảnh
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 z-10">
                                            <StatusBadge status={auction.status} />
                                        </div>
                                        {/* Glassmorphism gradient overly on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
                                            <span className="text-primary-foreground font-medium flex items-center gap-1 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                Trả giá ngay <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-1 p-6">
                                        <h3 className="font-bold text-lg line-clamp-2 leading-tight mb-3 group-hover:text-primary transition-colors">
                                            {auction.title}
                                        </h3>
                                        <div className="mt-auto pt-4 border-t border-border/50">
                                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Giá Bid Hiện Tại</p>
                                            <div className="flex items-end justify-between">
                                                <span className="text-2xl font-black text-foreground tracking-tight">
                                                    {formatCurrency(auction.currentPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>

            {/* ─── CTA SECTION ─── */}
            <section className="container mx-auto px-6 py-10 max-w-5xl">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-[3rem] overflow-hidden bg-primary px-6 py-20 text-center text-primary-foreground shadow-2xl shadow-primary/30"
                >
                    {/* Inner glowing effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 blur-3xl rounded-full" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/20 blur-3xl rounded-full" />

                    <div className="relative z-10 space-y-6">
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Sẵn sàng để sở hữu món hời?</h2>
                        <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg leading-relaxed">
                            Tham gia cùng hàng ngàn người dùng khác đang tận hưởng môi trường đấu giá công bằng, minh bạch và an toàn.
                        </p>
                        <div className="pt-6">
                            <Link
                                href={ROUTE_CONSTANTS.REGISTER}
                                className="inline-flex h-14 items-center justify-center rounded-full bg-background px-10 text-lg font-bold text-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                Bắt đầu ngay Miễn phí
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </main>
        <PublicFooter />
        </>
    );
}
