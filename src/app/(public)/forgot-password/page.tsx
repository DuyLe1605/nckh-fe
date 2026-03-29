"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { toast } from "sonner";
import { ROUTE_CONSTANTS } from "@/constants/app.constants";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/lib/query/hooks/use-auth";
import { extractAuthAttribution, isEmailAttribution, logAuthFunnelEvent } from "@/lib/analytics/auth-funnel";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, KeyRound, ArrowLeft, RefreshCw } from "lucide-react";

const emailSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
});

const resetSchema = z
    .object({
        otp: z.string().length(6, "Mã OTP phải gồm 6 chữ số"),
        newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
        confirmPassword: z.string().min(8, "Vui lòng xác nhận mật khẩu"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Mật khẩu xác nhận không khớp",
    });

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

function ForgotPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") ?? "";
    const initialOtp = (searchParams.get("otp") ?? "").replace(/[^0-9]/g, "").slice(0, 6);
    const attribution = useMemo(() => extractAuthAttribution(searchParams), [searchParams]);

    const [step, setStep] = useState<1 | 2>(initialOtp ? 2 : 1);
    const [email, setEmail] = useState(initialEmail);
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const forgotPasswordMutation = useForgotPasswordMutation();
    const resetPasswordMutation = useResetPasswordMutation();

    const emailForm = useForm<EmailFormValues>({
        defaultValues: { email: initialEmail },
    });

    const resetForm = useForm<ResetFormValues>({
        defaultValues: { otp: initialOtp, newPassword: "", confirmPassword: "" },
    });

    useEffect(() => {
        if (!isEmailAttribution(attribution)) return;

        logAuthFunnelEvent({
            eventName: "auth_email_link_clicked",
            flow: "reset",
            email: initialEmail || email,
            dedupeKey: `email-click-reset:${initialEmail || "unknown"}`,
            ...attribution,
        });
    }, [attribution, email, initialEmail]);

    const trackResetSuccess = (targetEmail: string) => {
        if (!isEmailAttribution(attribution)) return;

        logAuthFunnelEvent({
            eventName: "auth_reset_success",
            flow: "reset",
            email: targetEmail,
            dedupeKey: `reset-success:${targetEmail || "unknown"}`,
            ...attribution,
        });
    };

    const requestOtp = (emailValue: string) => {
        forgotPasswordMutation.mutate(
            { email: emailValue },
            {
                onSuccess: (data) => {
                    setEmail(emailValue);
                    setStep(2);
                    setApiMessage(null);
                    toast.success("Đã gửi mã xác thực", { description: data.message });
                },
                onError: (error: { message?: string }) => {
                    const message = error?.message ?? "Có lỗi xảy ra, vui lòng thử lại.";
                    setApiMessage(message);
                    toast.error("Không thể gửi mã", { description: message });
                },
            },
        );
    };

    const submitResetPassword = (payload: ResetFormValues) => {
        resetPasswordMutation.mutate(
            { email, otp: payload.otp, newPassword: payload.newPassword },
            {
                onSuccess: (data) => {
                    trackResetSuccess(email.trim());
                    toast.success("Đổi mật khẩu thành công", { description: data.message });
                    router.push(ROUTE_CONSTANTS.LOGIN);
                },
                onError: (error: { message?: string }) => {
                    const message = error?.message ?? "Có lỗi xảy ra, vui lòng thử lại.";
                    setApiMessage(message);
                    toast.error("Đặt lại mật khẩu thất bại", { description: message });
                },
            },
        );
    };

    return (
        <div className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-4xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <section className="space-y-5">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Khôi phục truy cập an toàn
                </p>
                <h1 className="text-4xl font-semibold tracking-tight">Đặt lại mật khẩu</h1>
                <p className="max-w-xl text-muted-foreground">
                    Không sao cả, chuyện này ai cũng từng gặp. Nhập email để nhận mã OTP 6 số và thiết lập mật khẩu mới
                    trong vài bước.
                </p>

                <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Lưu ý bảo mật</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>Mã OTP chỉ có hiệu lực trong thời gian ngắn.</li>
                        <li>Không chia sẻ OTP cho bất kỳ ai, kể cả nhân viên hỗ trợ.</li>
                        <li>Sau khi đổi mật khẩu, bạn sẽ đăng nhập lại để tiếp tục.</li>
                    </ul>
                </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl md:p-8">
                <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                            }`}
                        >
                            1
                        </div>
                        <div className="h-px flex-1 bg-border" />
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                step === 2 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                            }`}
                        >
                            2
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">{step === 1 ? "Xác minh email" : "Đổi mật khẩu mới"}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {step === 1
                                ? "Nhập email để nhận mã OTP 6 chữ số."
                                : `Nhập OTP đã gửi đến ${email} và đặt mật khẩu mới.`}
                        </p>
                    </div>
                </div>

                {step === 1 ? (
                    <form
                        className="space-y-4"
                        onSubmit={emailForm.handleSubmit((values) => {
                            setApiMessage(null);
                            emailForm.clearErrors();

                            const parsed = emailSchema.safeParse(values);
                            if (!parsed.success) {
                                parsed.error.issues.forEach((issue) => {
                                    const field = issue.path[0] as keyof EmailFormValues | undefined;
                                    if (!field) return;
                                    emailForm.setError(field, {
                                        type: "manual",
                                        message: issue.message,
                                    });
                                });
                                return;
                            }

                            requestOtp(parsed.data.email);
                        })}
                    >
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email tài khoản
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                    {...emailForm.register("email")}
                                />
                            </div>
                            {emailForm.formState.errors.email ? (
                                <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
                            ) : null}
                        </div>

                        {apiMessage ? <p className="text-sm text-destructive">{apiMessage}</p> : null}

                        <Button type="submit" size="lg" className="w-full" disabled={forgotPasswordMutation.isPending}>
                            {forgotPasswordMutation.isPending ? "Đang gửi mã..." : "Gửi mã xác thực"}
                        </Button>
                    </form>
                ) : (
                    <form
                        className="space-y-4"
                        onSubmit={resetForm.handleSubmit((values) => {
                            setApiMessage(null);
                            resetForm.clearErrors();

                            const parsed = resetSchema.safeParse(values);
                            if (!parsed.success) {
                                parsed.error.issues.forEach((issue) => {
                                    const field = issue.path[0] as keyof ResetFormValues | undefined;
                                    if (!field) return;
                                    resetForm.setError(field, {
                                        type: "manual",
                                        message: issue.message,
                                    });
                                });
                                return;
                            }

                            submitResetPassword(parsed.data);
                        })}
                    >
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
                                    placeholder="------"
                                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-center text-sm tracking-[0.35em] outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                    {...resetForm.register("otp", {
                                        onChange: (event) => {
                                            event.target.value = event.target.value.replace(/[^0-9]/g, "");
                                        },
                                    })}
                                />
                            </div>
                            {resetForm.formState.errors.otp ? (
                                <p className="text-xs text-destructive">{resetForm.formState.errors.otp.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="newPassword" className="text-sm font-medium">
                                Mật khẩu mới
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="••••••••"
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                {...resetForm.register("newPassword")}
                            />
                            {resetForm.formState.errors.newPassword ? (
                                <p className="text-xs text-destructive">
                                    {resetForm.formState.errors.newPassword.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                {...resetForm.register("confirmPassword")}
                            />
                            {resetForm.formState.errors.confirmPassword ? (
                                <p className="text-xs text-destructive">
                                    {resetForm.formState.errors.confirmPassword.message}
                                </p>
                            ) : null}
                        </div>

                        {apiMessage ? <p className="text-sm text-destructive">{apiMessage}</p> : null}

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setStep(1);
                                    setApiMessage(null);
                                }}
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" /> Đổi email
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full"
                                onClick={() => requestOtp(email)}
                                disabled={forgotPasswordMutation.isPending}
                            >
                                <RefreshCw className="mr-1 h-4 w-4" /> Gửi lại mã
                            </Button>
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={resetPasswordMutation.isPending}>
                            {resetPasswordMutation.isPending ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                        </Button>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Quay lại{" "}
                    <Link href={ROUTE_CONSTANTS.LOGIN} className="font-medium text-primary hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </section>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="mx-auto w-full max-w-4xl px-6 py-10 text-sm text-muted-foreground">Đang tải...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
