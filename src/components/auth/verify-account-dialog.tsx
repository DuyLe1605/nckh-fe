"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useResendVerificationMutation, useVerifyEmailMutation } from "@/lib/query/hooks/use-auth";

type VerifyAccountDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
    onSuccess?: () => void;
    onSkip?: () => void;
    showSkipAction?: boolean;
};

export function VerifyAccountDialog({
    open,
    onOpenChange,
    email,
    onSuccess,
    onSkip,
    showSkipAction = false,
}: VerifyAccountDialogProps) {
    const [otp, setOtp] = useState("");
    const [countdown, setCountdown] = useState(0);
    const verifyMutation = useVerifyEmailMutation();
    const resendMutation = useResendVerificationMutation();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        if (!open) {
            setOtp("");
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast.error("Mã OTP không hợp lệ", { description: "Vui lòng nhập đủ 6 chữ số." });
            return;
        }

        verifyMutation.mutate(
            { email, otp },
            {
                onSuccess: (data) => {
                    toast.success("Xác thực thành công", { description: data.message });
                    onOpenChange(false);
                    onSuccess?.();
                    setOtp("");
                },
                onError: (error: any) => {
                    toast.error("Xác thực thất bại", {
                        description: error?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.",
                    });
                },
            },
        );
    };

    const handleResend = () => {
        resendMutation.mutate(
            { email },
            {
                onSuccess: (data) => {
                    toast.success("Đã gửi mã mới", { description: data.message });
                    setCountdown(60);
                },
                onError: (error: any) => {
                    toast.error("Gửi mã thất bại", {
                        description: error?.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
                    });
                },
            },
        );
    };

    const handleSkip = () => {
        onOpenChange(false);
        onSkip?.();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Xác thực tài khoản</DialogTitle>
                    <DialogDescription>
                        Chúng tôi đã gửi mã xác thực 6 số đến email <strong>{email}</strong>. Vui lòng nhập mã vào bên
                        dưới để hoàn tất đăng ký.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="flex flex-col space-y-2">
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                            className="h-12 w-full rounded-md border border-input bg-background text-center text-2xl tracking-[0.5em] transition hover:border-accent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                            placeholder="------"
                            autoComplete="one-time-code"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="link"
                            className="px-0 text-sm"
                            disabled={countdown > 0 || resendMutation.isPending}
                            onClick={handleResend}
                        >
                            {resendMutation.isPending
                                ? "Đang gửi..."
                                : countdown > 0
                                  ? `Gửi lại mã sau ${countdown}s`
                                  : "Gửi lại mã xác thực"}
                        </Button>
                    </div>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        {showSkipAction ? (
                            <Button type="button" variant="outline" onClick={handleSkip}>
                                Bỏ qua, xác thực sau
                            </Button>
                        ) : (
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Đóng
                            </Button>
                        )}
                        <Button type="submit" disabled={verifyMutation.isPending || otp.length < 6}>
                            {verifyMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
