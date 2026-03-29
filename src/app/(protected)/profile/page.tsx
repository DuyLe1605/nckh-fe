"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logoutAllDevices, me } from "@/lib/api/auth.api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";
import { clearAccessToken } from "@/lib/auth/session-manager";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { useAuthUiStore } from "@/stores/auth-ui.store";

export default function ProfilePage() {
    const router = useRouter();
    const { currentEmail, currentRole, currentFullName, isAuthenticated, setSession, clearSession } = useAuthUiStore();

    const profileQuery = useQuery({
        queryKey: QUERY_KEYS.auth.profile,
        queryFn: me,
        retry: 1,
    });

    useEffect(() => {
        const user = profileQuery.data?.user;
        if (!user?.email || !user.role) return;

        setSession({
            id: user.id,
            role: user.role,
            email: user.email,
            fullName: user.fullName,
        });
    }, [profileQuery.data?.user, setSession]);

    const logoutAllMutation = useMutation({
        mutationFn: logoutAllDevices,
        onSettled: () => {
            document.cookie = `${APP_CONSTANTS.COOKIE_ROLE_KEY}=; path=/; max-age=0`;
            clearAccessToken();
            clearSession();
            router.push(ROUTE_CONSTANTS.LOGIN);
        },
    });

    const email = profileQuery.data?.user?.email ?? currentEmail;
    const role = profileQuery.data?.user?.role ?? currentRole;
    const fullName = profileQuery.data?.user?.fullName ?? currentFullName;

    return (
        <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Hồ sơ phiên đăng nhập</h1>
            <p className="text-sm text-muted-foreground">
                Trạng thái: {isAuthenticated ? "Đã xác thực" : "Chưa xác thực"}
            </p>

            <div className="rounded-2xl border border-border/80 bg-background/80 p-5">
                <dl className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">Họ tên</dt>
                        <dd className="font-medium">{fullName ?? "(chưa có)"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium">{email ?? "(chưa có)"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Role</dt>
                        <dd className="font-medium">{role ? <StatusBadge status={role} /> : "(chưa có)"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Profile API</dt>
                        <dd className="font-medium">
                            {profileQuery.isPending
                                ? "Đang tải"
                                : profileQuery.isError
                                  ? "Lỗi / fallback store"
                                  : "Đồng bộ thành công"}
                        </dd>
                    </div>
                </dl>

                <div className="mt-5 flex justify-end">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => logoutAllMutation.mutate()}
                        disabled={logoutAllMutation.isPending}
                    >
                        {logoutAllMutation.isPending ? "Đang đăng xuất toàn bộ..." : "Đăng xuất tất cả thiết bị"}
                    </Button>
                </div>
            </div>
        </section>
    );
}
