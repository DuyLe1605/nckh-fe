"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardAnalytics } from "@/lib/api/admin.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, Gavel, FileDigit, DollarSign, Activity } from "lucide-react";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
    const date = new Date(iso);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }) + " " + date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

const chartConfig = {
    revenue: {
        label: "Doanh thu (Phí nền tảng)",
        color: "hsl(var(--chart-1))",
    },
    finalPrice: {
        label: "Giá trị đơn",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export default function AdminDashboardPage() {
    const { data: response, isLoading, isError } = useQuery({
        queryKey: QUERY_KEYS.admin.dashboard,
        queryFn: getAdminDashboardAnalytics,
        staleTime: 30000,
    });

    const data = response?.data;

    // Map recent orders to chart data
    const chartData = (data?.recentOrders || []).map((order) => ({
        name: order.product.title.length > 20 ? order.product.title.substring(0, 20) + "..." : order.product.title,
        revenue: Number(order.platformFee),
        finalPrice: Number(order.finalPrice),
    })).reverse(); // Reverse so oldest is first from the last 5

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Thống kê nền tảng</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Tổng quan hiệu suất và các chỉ số quan trọng của hệ thống đấu giá.
                </p>
            </header>

            {isError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
                </div>
            )}

            {/* ─── Metric Cards ─── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(data?.totalRevenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Từ các đơn hàng thành công</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Skeleton className="h-8 w-16" /> : data?.totalUsers || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Tổng thành viên đăng ký</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đấu giá đang diễn ra</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Skeleton className="h-8 w-16" /> : data?.activeAuctions || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Phiên đàng chờ kết thúc</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số lượt Bid</CardTitle>
                        <Gavel className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Skeleton className="h-8 w-16" /> : data?.totalBids || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Lượt trả giá trên sàn</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ─── Revenue Chart ─── */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Doanh thu từ các đơn gần đây</CardTitle>
                        <CardDescription>Biểu đồ thể hiện phí nền tảng thu được</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {isLoading ? (
                            <Skeleton className="h-[300px] w-full" />
                        ) : chartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value.toLocaleString()}đ`}
                                            width={80}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dashed" />}
                                        />
                                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                    </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
                                Chưa có đơn hàng nào
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ─── Recent Orders ─── */}
                <Card>
                    <CardHeader>
                        <CardTitle>Đơn hàng gần đây</CardTitle>
                        <CardDescription>5 đơn hàng mới nhất trên hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : data?.recentOrders?.length ? (
                            <div className="space-y-4">
                                {data.recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none flex items-center gap-2">
                                                <FileDigit className="h-3.5 w-3.5 text-muted-foreground" />
                                                #{order.id.split("-")[0].toUpperCase()}
                                            </p>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{order.product.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{formatDate(order.createdAt)}</span>
                                                <span>•</span>
                                                <Badge variant="outline" className="text-[10px] uppercase h-5 font-normal">
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{formatCurrency(order.finalPrice)}</div>
                                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                Phí: +{formatCurrency(order.platformFee)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                Không có đơn hàng nào
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
