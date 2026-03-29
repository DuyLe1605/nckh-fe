"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listReports, updateReportStatus, type ReportItem, type ReportStatus } from "@/lib/api/reports.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const REPORT_STATUS_LABELS: Record<ReportStatus, { label: string; className: string }> = {
    PENDING: { label: "Chờ xử lý", className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700" },
    INVESTIGATING: { label: "Đang điều tra", className: "border-blue-500/40 bg-blue-500/10 text-blue-700" },
    RESOLVED: { label: "Đã giải quyết", className: "border-green-500/40 bg-green-500/10 text-green-700" },
    DISMISSED: { label: "Bỏ qua", className: "border-zinc-500/40 bg-zinc-500/10 text-zinc-700" },
};

export default function AdminReportsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
    const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const reportsQuery = useQuery({
        queryKey: ["reports", statusFilter],
        queryFn: () => listReports(statusFilter ? { status: statusFilter } : {}),
        staleTime: 15_000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: ReportStatus }) => updateReportStatus(id, { status }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            setNotification({ type: "success", text: `✅ Đã cập nhật trạng thái report.` });
            setTimeout(() => setNotification(null), 3000);
        },
        onError: (error: any) => {
            setNotification({ type: "error", text: `❌ Cập nhật thất bại: ${error.message}` });
        },
    });

    const reports: ReportItem[] = reportsQuery.data?.reports || [];
    const pagination = reportsQuery.data?.pagination;

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Báo cáo & Tranh chấp (Reports & Disputes)</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Xử lý các báo cáo vi phạm, lừa đảo hoặc vấn đề về sản phẩm/đơn hàng.
                </p>
            </header>

            {notification && (
                <div
                    className={
                        "rounded-lg border px-4 py-3 text-sm " +
                        (notification.type === "success"
                            ? "border-green-500/40 bg-green-500/10 text-green-700"
                            : "border-destructive/40 bg-destructive/10 text-destructive")
                    }
                >
                    {notification.text}
                </div>
            )}

            <div className="flex gap-2flex-wrap">
                <Button variant={statusFilter === "" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("")}>
                    Tất cả
                </Button>
                {Object.entries(REPORT_STATUS_LABELS).map(([status, cfg]) => (
                    <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(status as ReportStatus)}
                    >
                        {cfg.label}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách báo cáo</CardTitle>
                    <CardDescription>{pagination ? `Tổng cộng ${pagination.total} báo cáo` : "Đang tải..."}</CardDescription>
                </CardHeader>
                <CardContent>
                    {reportsQuery.isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : reports.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Không có báo cáo nào khớp với bộ lọc.</p>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div key={report.id} className="rounded-lg border p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                        <div>
                                            <p className="font-medium text-sm">
                                                Người tố cáo: <span className="font-semibold">{report.reporter?.email}</span>
                                            </p>
                                            <p className="text-sm">
                                                Tố cáo người dùng: <span className="text-red-500 font-semibold">{report.reportedUser?.email}</span>
                                            </p>
                                            {report.product && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Sản phẩm liên quan: {report.product.title} (ID: {report.product.id.split("-")[0]}...)
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className={REPORT_STATUS_LABELS[report.status].className}>
                                                {REPORT_STATUS_LABELS[report.status].label}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(report.createdAt).toLocaleString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 rounded p-3 mb-4">
                                        <p className="text-xs font-semibold mb-1 uppercase text-muted-foreground">Lý do báo cáo:</p>
                                        <p className="text-sm whitespace-pre-wrap">{report.reason}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-xs text-muted-foreground font-medium mr-2">Cập nhật trạng thái:</span>
                                        {Object.entries(REPORT_STATUS_LABELS).map(([status, cfg]) => {
                                            if (status === report.status) return null;
                                            return (
                                                <Button
                                                    key={status}
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-7 text-xs"
                                                    disabled={updateStatusMutation.isPending}
                                                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: status as ReportStatus })}
                                                >
                                                    Chuyển sang {cfg.label}
                                                </Button>
                                            );
                                        })}
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
