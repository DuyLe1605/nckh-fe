"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createReport } from "@/lib/api/reports.api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReportDialog({ reportedUserId, productId }: { reportedUserId: string; productId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const reportMutation = useMutation({
        mutationFn: () => createReport({ reportedUserId, productId, reason }),
        onSuccess: () => {
            setNotification({ type: "success", text: "✅ Đã gửi báo cáo thành công" });
            setTimeout(() => {
                setIsOpen(false);
                setReason("");
                setNotification(null);
            }, 2000);
        },
        onError: (err: any) => {
            setNotification({ type: "error", text: `❌ Lỗi: ${err.message}` });
        },
    });

    if (!isOpen) {
        return (
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-600">
                🚩 Báo cáo vi phạm
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground">Báo cáo vi phạm</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Mô tả rõ lý do bạn báo cáo người dùng/sản phẩm này. Quản trị viên sẽ xem xét.
                </p>

                {notification && (
                    <div
                        className={
                            "mb-4 rounded-lg bg-background p-3 text-sm " +
                            (notification.type === "success" ? "text-green-600" : "text-destructive")
                        }
                    >
                        {notification.text}
                    </div>
                )}

                <Textarea
                    placeholder="Lý do chi tiết..."
                    rows={4}
                    value={reason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                    disabled={reportMutation.isPending || notification?.type === "success"}
                    className="w-full mb-4 resize-none"
                    autoFocus
                />

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={reportMutation.isPending}>
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => reportMutation.mutate()}
                        disabled={reportMutation.isPending || reason.trim().length < 10 || notification?.type === "success"}
                    >
                        {reportMutation.isPending ? "Đang gửi..." : "Gửi Báo Cáo"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
