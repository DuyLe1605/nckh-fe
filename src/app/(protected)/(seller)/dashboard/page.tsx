"use client";

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
        revenue: { label: "Thực nhận", color: "hsl(var(--primary))" },
        platformFee: { label: "Phí nền tảng", color: "hsl(var(--destructive))" },
    };

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

            <Card>
                <CardHeader>
                    <CardTitle>Biểu đồ Doanh thu (6 tháng gần nhất)</CardTitle>
                    <CardDescription>Dữ liệu chỉ tính các đơn hàng ở trạng thái COMPLETED</CardDescription>
                </CardHeader>
                <CardContent>
                    {ordersQuery.isLoading ? (
                        <div className="flex h-[350px] items-center justify-center">
                            <Skeleton className="h-full w-full rounded-xl" />
                        </div>
                    ) : (
                        <div className="mt-4">
                            <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={(val) => val} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <YAxis tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="platformFee" fill="var(--color-platformFee)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
