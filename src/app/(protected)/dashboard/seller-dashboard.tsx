"use client";

import { useState, useMemo } from "react";
import { useOrdersQuery } from "@/lib/query/hooks/use-orders";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import Link from "next/link";
import { WalletCards, Package, CheckCircle2 } from "lucide-react";

function formatCurrency(value: string | number) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(num);
}

export default function SellerDashboardPage() {
    const currentUserId = useAuthUiStore(s => s.currentUserId);

    const ordersQuery = useOrdersQuery("");

    const orders = ordersQuery.data?.orders ?? [];
    
    // Calculate Stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === "COMPLETED");
    const totalRevenue = completedOrders.reduce((sum, order) => {
        return sum + (Number(order.finalPrice) - Number(order.platformFee));
    }, 0);
    
    // Prepare Chart Data
    const monthlyDataMap: Record<string, { month: string; revenue: number; platformFee: number }> = {};
    
    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStr = `T${d.getMonth() + 1}/${d.getFullYear()}`;
        monthlyDataMap[monthStr] = { month: monthStr, revenue: 0, platformFee: 0 };
    }

    completedOrders.forEach(order => {
        const d = new Date(order.createdAt);
        const monthStr = `T${d.getMonth() + 1}/${d.getFullYear()}`;
        if (monthlyDataMap[monthStr]) {
            monthlyDataMap[monthStr].revenue += (Number(order.finalPrice) - Number(order.platformFee));
            monthlyDataMap[monthStr].platformFee += Number(order.platformFee);
        }
    });

    const chartData = Object.values(monthlyDataMap);

    const chartConfig = {
        revenue: { label: "Thực nhận", color: "hsl(var(--chart-1))" },
        platformFee: { label: "Phí nền tảng", color: "hsl(var(--chart-2))" },
    };

    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("revenue");

    const totals = useMemo(() => ({
        revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
        platformFee: chartData.reduce((acc, curr) => acc + curr.platformFee, 0),
    }), [chartData]);

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Tóm tắt Doanh thu</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Tổng quan về các phiên đấu giá và doanh thu của bạn.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Doanh thu</CardTitle>
                        <WalletCards className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {ordersQuery.isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Từ các đơn hàng đã Hoàn thành</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đơn hàng Hoàn thành</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {ordersQuery.isLoading ? <Skeleton className="h-8 w-12" /> : completedOrders.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Giao dịch thành công</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số Đơn hàng</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {ordersQuery.isLoading ? <Skeleton className="h-8 w-12" /> : totalOrders}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <Link href="/seller/orders" className="underline hover:text-foreground transition-colors">
                                Quản lý đơn hàng →
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="flex flex-col py-0 sm:py-0">
                <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0">
                        <CardTitle>Biểu đồ Doanh thu (Interactive)</CardTitle>
                        <CardDescription>
                            Dữ liệu chỉ tính các đơn hàng ở trạng thái COMPLETED
                        </CardDescription>
                    </div>
                    <div className="flex">
                        {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map((key) => {
                            const chart = chartConfig[key];
                            return (
                                <button
                                    key={key}
                                    data-active={activeChart === key}
                                    className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                    onClick={() => setActiveChart(key)}
                                >
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {chart.label}
                                    </span>
                                    <span className="text-lg leading-none font-bold sm:text-2xl whitespace-nowrap">
                                        {totals[key] ? formatCurrency(totals[key]) : "0 đ"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </CardHeader>
                <CardContent className="px-2 sm:p-6 flex-1">
                    {ordersQuery.isLoading ? (
                        <div className="flex h-[300px] items-center justify-center">
                            <Skeleton className="h-full w-full rounded-xl" />
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val}
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                />
                                <YAxis
                                    tickFormatter={(val) => `${(val / 1000).toLocaleString()}k`}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                    width={60}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent className="w-[150px]" />}
                                />
                                <Bar
                                    dataKey={activeChart}
                                    fill={`var(--color-${activeChart})`}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
