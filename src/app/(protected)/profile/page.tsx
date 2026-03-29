"use client";

import { useState, useEffect } from "react";
import { useProfileQuery, useLogoutAllMutation } from "@/lib/query/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifyAccountDialog } from "@/components/auth/verify-account-dialog";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { ShieldCheck, Mail, UserRound, CheckCircle2, AlertTriangle, RefreshCcw, Laptop } from "lucide-react";

export default function ProfilePage() {
    const { currentEmail, currentRole, currentFullName, currentStatus, isAuthenticated, setSession } = useAuthUiStore();

    const profileQuery = useProfileQuery();

    useEffect(() => {
        const user = profileQuery.data?.user;
        if (!user?.email || !user.role) return;

        setSession({
            id: user.id,
            role: user.role,
            email: user.email,
            fullName: user.fullName,
            status: user.status,
        });
    }, [profileQuery.data?.user, setSession]);

    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);

    const logoutAllMutation = useLogoutAllMutation();

    const email = profileQuery.data?.user?.email ?? currentEmail;
    const role = profileQuery.data?.user?.role ?? currentRole;
    const fullName = profileQuery.data?.user?.fullName ?? currentFullName;
    const status = profileQuery.data?.user?.status ?? currentStatus;
    const isUnverified = status === "UNVERIFIED";
    const isActive = status === "ACTIVE";
    const initials =
        fullName
            ?.split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((chunk) => chunk[0]?.toUpperCase())
            .join("") ?? "U";

    if (profileQuery.isPending && !email) {
        return (
            <section className="space-y-4">
                <div className="h-28 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
                <div className="grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-40 animate-pulse rounded-2xl border border-border/70 bg-muted/40"
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (profileQuery.isError && !email) {
        return (
            <section className="space-y-4">
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
                    <h1 className="text-xl font-semibold">Không thể tải hồ sơ</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Phiên đăng nhập có thể đã hết hạn hoặc hệ thống đang bận. Vui lòng thử tải lại hồ sơ.
                    </p>
                    <Button className="mt-4" variant="outline" onClick={() => profileQuery.refetch()}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Thử lại
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-primary/10 via-background to-cyan-500/5 p-6 md:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-xl font-semibold text-primary">
                            {initials}
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold md:text-3xl">{fullName ?? "Tài khoản người dùng"}</h1>
                            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {email ?? "(chưa có email)"}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {role ? <StatusBadge status={role} /> : null}
                                {isUnverified ? (
                                    <StatusBadge
                                        status="UNVERIFIED"
                                        className="border-amber-500/30 bg-amber-500/10 text-amber-600"
                                    />
                                ) : isActive ? (
                                    <StatusBadge
                                        status="ACTIVE"
                                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                    />
                                ) : status ? (
                                    <StatusBadge status={status} />
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                        {isUnverified ? (
                            <Button onClick={() => setVerifyDialogOpen(true)}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Xác thực tài khoản
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => profileQuery.refetch()}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Làm mới hồ sơ
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            onClick={() => logoutAllMutation.mutate()}
                            disabled={logoutAllMutation.isPending}
                        >
                            {logoutAllMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất mọi thiết bị"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-border/80 bg-background p-5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Thông tin cơ bản</p>
                    <div className="mt-4 space-y-3 text-sm">
                        <p className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{fullName ?? "Chưa cập nhật"}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{email ?? "Chưa cập nhật"}</span>
                        </p>
                    </div>
                </article>

                <article className="rounded-2xl border border-border/80 bg-background p-5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Bảo mật tài khoản</p>
                    <div className="mt-4 space-y-3 text-sm">
                        <p className="flex items-center gap-2">
                            {isUnverified ? (
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                            <span className="font-medium">
                                {isUnverified ? "Email chưa xác thực" : "Email đã xác thực"}
                            </span>
                        </p>
                        {isUnverified ? (
                            <Button size="sm" variant="outline" onClick={() => setVerifyDialogOpen(true)}>
                                Xác thực ngay
                            </Button>
                        ) : (
                            <p className="text-muted-foreground">
                                Tài khoản của bạn đã sẵn sàng sử dụng đầy đủ tính năng.
                            </p>
                        )}
                    </div>
                </article>

                <article className="rounded-2xl border border-border/80 bg-background p-5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Trạng thái phiên</p>
                    <div className="mt-4 space-y-3 text-sm">
                        <p className="flex items-center gap-2">
                            <Laptop className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{isAuthenticated ? "Đang đăng nhập" : "Chưa đăng nhập"}</span>
                        </p>
                        <p className="text-muted-foreground">
                            {profileQuery.isPending
                                ? "Đang đồng bộ dữ liệu phiên..."
                                : profileQuery.isError
                                  ? "Đang hiển thị dữ liệu fallback từ phiên local."
                                  : "Đã đồng bộ trạng thái tài khoản thành công."}
                        </p>
                    </div>
                </article>
            </div>

            {email && (
                <VerifyAccountDialog
                    open={verifyDialogOpen}
                    onOpenChange={setVerifyDialogOpen}
                    email={email}
                    onSuccess={() => {
                        profileQuery.refetch();
                    }}
                />
            )}
        </section>
    );
}
