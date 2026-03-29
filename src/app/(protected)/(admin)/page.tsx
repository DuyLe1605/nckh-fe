"use client";

import { useState, useMemo } from "react";
import { useAdminAuthFunnelQuery, useAdminDashboardQuery } from "@/lib/query/hooks/use-dashboard";
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
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

function formatPercent(value: number) {
    return `${(value * 100).toFixed(1)}%`;
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
    const { data: response, isLoading, isError } = useAdminDashboardQuery();
    const {
        data: authFunnelResponse,
        isLoading: isAuthFunnelLoading,
        isError: isAuthFunnelError,
    } = useAdminAuthFunnelQuery(30);

    const data = response?.data;
    const monthlyRevenue = data?.monthlyRevenue || [];
    const authFunnelData = authFunnelResponse?.data;

    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("revenue");

    const totals = useMemo(() => ({
        revenue: monthlyRevenue.reduce((acc, curr) => acc + curr.revenue, 0),
        finalPrice: monthlyRevenue.reduce((acc, curr) => acc + curr.finalPrice, 0),
    }), [monthlyRevenue]);

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

            {isAuthFunnelError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    Không thể tải dữ liệu auth funnel. Vui lòng thử lại sau.
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

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Verify Conversion (Email)</CardTitle>
                        <CardDescription>Click link xác thực → verify thành công (30 ngày)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isAuthFunnelLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatPercent(authFunnelData?.ratios.verifyRate ?? 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {authFunnelData?.totals.verifySuccessFromEmail ?? 0} / {authFunnelData?.totals.verifyClicksFromEmail ?? 0} lượt
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Reset Conversion (Email)</CardTitle>
                        <CardDescription>Click link đặt lại mật khẩu → reset thành công (30 ngày)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isAuthFunnelLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatPercent(authFunnelData?.ratios.resetRate ?? 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {authFunnelData?.totals.resetSuccessFromEmail ?? 0} / {authFunnelData?.totals.resetClicksFromEmail ?? 0} lượt
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Overall Auth Funnel</CardTitle>
                        <CardDescription>
                            Tổng conversion verify + reset trong {authFunnelData?.range.days ?? 30} ngày
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isAuthFunnelLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {formatPercent(authFunnelData?.ratios.overallRate ?? 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Total clicks: {(authFunnelData?.totals.verifyClicksFromEmail ?? 0) + (authFunnelData?.totals.resetClicksFromEmail ?? 0)}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Auth Funnel theo Campaign</CardTitle>
                    <CardDescription>
                        So sánh conversion theo `utm_campaign` (nguồn email)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isAuthFunnelLoading ? (
                        <Skeleton className="h-44 w-full" />
                    ) : authFunnelData?.campaigns?.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="px-2 py-2 font-medium">Campaign</th>
                                        <th className="px-2 py-2 font-medium">Verify</th>
                                        <th className="px-2 py-2 font-medium">Reset</th>
                                        <th className="px-2 py-2 font-medium">Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {authFunnelData.campaigns.map((campaign) => (
                                        <tr key={campaign.utmCampaign} className="border-b last:border-0">
                                            <td className="px-2 py-2 font-medium">{campaign.utmCampaign}</td>
                                            <td className="px-2 py-2">
                                                {campaign.verifySuccess}/{campaign.verifyClicks}
                                                <span className="ml-2 text-xs text-muted-foreground">({formatPercent(campaign.verifyRate)})</span>
                                            </td>
                                            <td className="px-2 py-2">
                                                {campaign.resetSuccess}/{campaign.resetClicks}
                                                <span className="ml-2 text-xs text-muted-foreground">({formatPercent(campaign.resetRate)})</span>
                                            </td>
                                            <td className="px-2 py-2">
                                                {campaign.verifyClicks + campaign.resetClicks}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Chưa có dữ liệu campaign trong khoảng thời gian đã chọn.
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ─── Revenue Chart ─── */}
                <Card className="flex flex-col py-0 sm:py-0">
                    <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
                        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0">
                            <CardTitle>Biểu đồ Doanh thu (Interactive)</CardTitle>
                            <CardDescription>
                                Dữ liệu 6 tháng gần nhất từ đơn hàng thành công
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
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : monthlyRevenue.length > 0 ? (
                            <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                                <LineChart
                                    accessibilityLayer
                                    data={monthlyRevenue}
                                    margin={{ left: 12, right: 12, top: 12 }}
                                >
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                                        width={50}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent className="w-[150px]" />}
                                    />
                                    <Line
                                        dataKey={activeChart}
                                        type="monotone"
                                        stroke={`var(--color-${activeChart})`}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
                                Chưa có dòng tiền nào trong 6 tháng qua
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
