"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ROUTE_CONSTANTS } from "@/constants/app.constants";
import { useResendVerificationMutation, useVerifyEmailMutation } from "@/lib/query/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";

export default function VerifyAccountPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") ?? "";
    const source = searchParams.get("from");

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [countdown, setCountdown] = useState(0);

    const verifyMutation = useVerifyEmailMutation();
    const resendMutation = useResendVerificationMutation();

    useEffect(() => {
        setEmail(initialEmail);
    }, [initialEmail]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    const backRoute = useMemo(() => {
        if (source === "profile") return ROUTE_CONSTANTS.PROFILE;
        return ROUTE_CONSTANTS.LOGIN;
    }, [source]);

    const handleVerify = (event: React.FormEvent) => {
        event.preventDefault();

        if (!email.trim()) {
            toast.error("Thiếu email", { description: "Vui lòng nhập email tài khoản cần xác thực." });
            return;
        }

        if (otp.length < 6) {
            toast.error("Mã OTP không hợp lệ", { description: "Vui lòng nhập đủ 6 chữ số." });
            return;
        }

        verifyMutation.mutate(
            { email: email.trim(), otp },
            {
                onSuccess: (data) => {
                    toast.success("Xác thực thành công", { description: data.message });
                    router.push(backRoute);
                },
                onError: (error: { message?: string }) => {
                    toast.error("Xác thực thất bại", {
                        description: error?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.",
                    });
                },
            },
        );
    };

    const handleResend = () => {
        if (!email.trim()) {
            toast.error("Thiếu email", { description: "Vui lòng nhập email trước khi gửi lại mã." });
            return;
        }

        resendMutation.mutate(
            { email: email.trim() },
            {
                onSuccess: (data) => {
                    toast.success("Đã gửi mã mới", { description: data.message });
                    setCountdown(60);
                },
                onError: (error: { message?: string }) => {
                    toast.error("Gửi mã thất bại", {
                        description: error?.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
                    });
                },
            },
        );
    };

    return (
        <div className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-4xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <section className="space-y-5">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Xác thực tài khoản Aurelia Auctions
                </p>
                <h1 className="text-4xl font-semibold tracking-tight">Xác minh email</h1>
                <p className="max-w-xl text-muted-foreground">
                    Nhập email và mã OTP 6 chữ số được gửi qua email để kích hoạt tài khoản đầy đủ quyền sử dụng.
                </p>

                <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Mẹo nhỏ</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>OTP có hiệu lực trong thời gian ngắn, hãy nhập ngay sau khi nhận.</li>
                        <li>Nếu không thấy mail, kiểm tra cả mục Spam/Junk.</li>
                        <li>
                            Nếu quên mật khẩu, bạn có thể sang trang{" "}
                            <Link href={ROUTE_CONSTANTS.CHANGE_PASSWORD} className="font-medium text-primary hover:underline">
                                đổi mật khẩu
                            </Link>
                            .
                        </li>
                    </ul>
                </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl md:p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold">Nhập mã OTP</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Mã OTP gồm 6 chữ số đã gửi tới email của bạn.</p>
                </div>

                <form className="space-y-4" onSubmit={handleVerify}>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email tài khoản
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="otp" className="text-sm font-medium">
                            Mã OTP (6 số)
                        </label>
                        <div className="relative">
                            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="otp"
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, ""))}
                                placeholder="------"
                                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-center text-sm tracking-[0.35em] outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                        </div>
                    </div>

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

                    <Button type="submit" size="lg" className="w-full" disabled={verifyMutation.isPending || otp.length < 6}>
                        {verifyMutation.isPending ? "Đang xác thực..." : "Xác nhận OTP"}
                    </Button>
                </form>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" className="w-full" onClick={() => router.push(backRoute)}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        {source === "profile" ? "Quay lại hồ sơ" : "Quay lại đăng nhập"}
                    </Button>
                    <Button type="button" variant="secondary" className="w-full" onClick={() => router.push(ROUTE_CONSTANTS.CHANGE_PASSWORD)}>
                        Đổi mật khẩu
                    </Button>
                </div>
            </section>
        </div>
    );
}
