"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod/v4";
import { toast } from "sonner";
import { AuthRole, AuthSessionPayload, RegisterRole, login, register } from "@/lib/api/auth.api";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { Button } from "@/components/ui/button";
import { setAccessToken } from "@/lib/auth/session-manager";
import { setRoleCookie } from "@/lib/auth/role-cookie";

const emailSchema = z.email("Email không hợp lệ");
const passwordSchema = z.string().min(8, "Mật khẩu tối thiểu 8 ký tự");

const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

const registerSchema = z
    .object({
        fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(8, "Vui lòng xác nhận mật khẩu"),
        role: z.enum([APP_CONSTANTS.ROLE_BIDDER, APP_CONSTANTS.ROLE_SELLER]),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Mật khẩu xác nhận không khớp",
    });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type AuthPanelMode = "login" | "register";

const REGISTER_ROLE_OPTIONS: Array<{ value: RegisterRole; label: string; hint: string }> = [
    {
        value: APP_CONSTANTS.ROLE_BIDDER,
        label: "Bidder",
        hint: "Tham gia đấu giá, theo dõi watchlist và trạng thái outbid.",
    },
    {
        value: APP_CONSTANTS.ROLE_SELLER,
        label: "Seller",
        hint: "Đăng sản phẩm, theo dõi đơn hàng và quản lý phiên đấu giá.",
    },
];

function redirectPathByRole(role: AuthRole) {
    if (role === APP_CONSTANTS.ROLE_ADMIN) return ROUTE_CONSTANTS.USERS;
    if (role === APP_CONSTANTS.ROLE_SELLER) return ROUTE_CONSTANTS.PRODUCTS_CREATE;
    return ROUTE_CONSTANTS.DASHBOARD;
}

export function AuthPanel({ mode }: { mode: AuthPanelMode }) {
    const router = useRouter();
    const { setSession } = useAuthUiStore();
    const [apiMessage, setApiMessage] = useState<string | null>(null);

    const isLoginMode = mode === "login";
    const title = isLoginMode ? "Chào mừng trở lại" : "Tạo tài khoản mới";
    const subtitle = isLoginMode
        ? "Đăng nhập bằng email và mật khẩu, quyền truy cập sẽ do backend tự nhận diện."
        : "Tạo tài khoản người dùng để bắt đầu tham gia đấu giá.";

    const loginForm = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const registerForm = useForm<RegisterFormValues>({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: APP_CONSTANTS.ROLE_BIDDER,
        },
    });
    const selectedRegisterRole = useWatch({
        control: registerForm.control,
        name: "role",
    });

    const loginMutation = useMutation({
        mutationFn: (payload: LoginFormValues) => login(payload),
        onSuccess: (session: AuthSessionPayload, variables) => {
            const role = session.user?.role;
            const email = session.user?.email ?? variables.email;

            if (!role) {
                setApiMessage("Không xác định được role từ backend. Vui lòng thử lại.");
                toast.error("Đăng nhập thất bại", {
                    description: "Backend chưa trả role người dùng.",
                });
                return;
            }

            setRoleCookie(role);
            setAccessToken(session.accessToken);
            setSession({
                id: session.user?.id,
                role,
                email,
                fullName: session.user?.fullName,
            });

            toast.success("Đăng nhập thành công", {
                description: `Xin chào ${session.user?.fullName ?? email}`,
            });

            router.push(redirectPathByRole(role));
        },
        onError: (error: { message?: string }) => {
            setApiMessage(error?.message ?? "Đăng nhập thất bại. Vui lòng thử lại.");
            toast.error("Đăng nhập thất bại", {
                description: error?.message ?? "Vui lòng thử lại.",
            });
        },
    });

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: () => {
            setApiMessage("Đăng ký thành công. Mời bạn đăng nhập để tiếp tục.");
            toast.success("Đăng ký thành công", {
                description: "Bạn có thể đăng nhập ngay bây giờ.",
            });
            router.push(APP_CONSTANTS.LOGIN_PATH);
        },
        onError: (error: { message?: string }) => {
            setApiMessage(error?.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
            toast.error("Đăng ký thất bại", {
                description: error?.message ?? "Vui lòng thử lại.",
            });
        },
    });

    const isSubmitting = loginMutation.isPending || registerMutation.isPending;

    const featureItems = useMemo(
        () => [
            "Cập nhật kết quả đấu giá thời gian thực <100ms",
            "Trang tổng quan phân quyền: Bidder/Seller/Admin",
            "Theo dõi ví Escrow minh bạch và an toàn",
        ],
        [],
    );

    return (
        <div className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-6xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-2 lg:items-center">
            <section className="space-y-5">
                <p className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500">
                    Nền tảng Đấu giá Trực tuyến • Xác thực & Bảo mật
                </p>
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Ứng dụng đấu giá trực tuyến</h1>
                <p className="max-w-xl text-muted-foreground">{subtitle}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {featureItems.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-indigo-500" />
                            {item}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl md:p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                </div>

                {isLoginMode ? (
                    <form
                        className="space-y-4"
                        onSubmit={loginForm.handleSubmit((values) => {
                            setApiMessage(null);
                            loginForm.clearErrors();

                            const parsed = loginSchema.safeParse(values);
                            if (!parsed.success) {
                                parsed.error.issues.forEach((issue) => {
                                    const field = issue.path[0] as keyof LoginFormValues | undefined;
                                    if (!field) return;
                                    loginForm.setError(field, {
                                        type: "manual",
                                        message: issue.message,
                                    });
                                });
                                return;
                            }

                            loginMutation.mutate(parsed.data);
                        })}
                    >
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                {...loginForm.register("email")}
                            />
                            {loginForm.formState.errors.email ? (
                                <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                {...loginForm.register("password")}
                            />
                            {loginForm.formState.errors.password ? (
                                <p className="text-xs text-destructive">
                                    {loginForm.formState.errors.password.message}
                                </p>
                            ) : null}
                        </div>

                        {apiMessage ? <p className="text-sm text-destructive">{apiMessage}</p> : null}

                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                        </Button>
                    </form>
                ) : (
                    <form
                        className="space-y-4"
                        onSubmit={registerForm.handleSubmit((values) => {
                            setApiMessage(null);
                            registerForm.clearErrors();

                            const parsed = registerSchema.safeParse(values);
                            if (!parsed.success) {
                                parsed.error.issues.forEach((issue) => {
                                    const field = issue.path[0] as keyof RegisterFormValues | undefined;
                                    if (!field) return;
                                    registerForm.setError(field, {
                                        type: "manual",
                                        message: issue.message,
                                    });
                                });
                                return;
                            }

                            registerMutation.mutate({
                                fullName: parsed.data.fullName,
                                email: parsed.data.email,
                                password: parsed.data.password,
                                role: parsed.data.role,
                            });
                        })}
                    >
                        <div className="space-y-1.5">
                            <label htmlFor="fullName" className="text-sm font-medium">
                                Họ và tên
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Nguyen Van A"
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                {...registerForm.register("fullName")}
                            />
                            {registerForm.formState.errors.fullName ? (
                                <p className="text-xs text-destructive">
                                    {registerForm.formState.errors.fullName.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                {...registerForm.register("email")}
                            />
                            {registerForm.formState.errors.email ? (
                                <p className="text-xs text-destructive">
                                    {registerForm.formState.errors.email.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Mật khẩu
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                    {...registerForm.register("password")}
                                />
                                {registerForm.formState.errors.password ? (
                                    <p className="text-xs text-destructive">
                                        {registerForm.formState.errors.password.message}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                                    {...registerForm.register("confirmPassword")}
                                />
                                {registerForm.formState.errors.confirmPassword ? (
                                    <p className="text-xs text-destructive">
                                        {registerForm.formState.errors.confirmPassword.message}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vai trò</label>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {REGISTER_ROLE_OPTIONS.map((option) => {
                                    const isSelected = selectedRegisterRole === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => registerForm.setValue("role", option.value)}
                                            className={`rounded-lg border px-3 py-3 text-left transition ${
                                                isSelected
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:border-primary/40"
                                            }`}
                                        >
                                            <p className="text-sm font-medium">{option.label}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">{option.hint}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            {registerForm.formState.errors.role ? (
                                <p className="text-xs text-destructive">{registerForm.formState.errors.role.message}</p>
                            ) : null}
                        </div>

                        {apiMessage ? <p className="text-sm text-destructive">{apiMessage}</p> : null}

                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
                        </Button>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    {isLoginMode ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                    <Link
                        href={isLoginMode ? ROUTE_CONSTANTS.REGISTER : ROUTE_CONSTANTS.LOGIN}
                        className="font-medium text-primary hover:underline"
                    >
                        {isLoginMode ? "Đăng ký ngay" : "Đăng nhập"}
                    </Link>
                </p>
            </section>
        </div>
    );
}
