"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { refreshSession } from "@/lib/api/auth.api";
import { setAccessToken, subscribeAuthEvents } from "@/lib/auth/session-manager";
import { clearRoleCookie, setRoleCookie } from "@/lib/auth/role-cookie";
import { ROUTE_CONSTANTS } from "@/constants/app.constants";

const AUTH_PAGES = [ROUTE_CONSTANTS.LOGIN, ROUTE_CONSTANTS.REGISTER, ROUTE_CONSTANTS.FORGOT_PASSWORD] as const;

export function AuthSessionSync() {
    const pathname = usePathname();
    const { clearSession, setSession } = useAuthUiStore();

    useEffect(() => {
        let mounted = true;
        const isAuthPage = AUTH_PAGES.some((page) => pathname === page);

        if (!isAuthPage) {
            refreshSession()
                .then((payload) => {
                    if (!mounted) return;
                    if (payload.accessToken) {
                        setAccessToken(payload.accessToken);
                    }

                    if (payload.user?.email && payload.user.role) {
                        setRoleCookie(payload.user.role);
                        setSession({
                            id: payload.user.id,
                            role: payload.user.role,
                            email: payload.user.email,
                            fullName: payload.user.fullName,
                            status: payload.user.status,
                        });
                    }
                })
                .catch(() => {
                    // Refresh thất bại là trạng thái bình thường khi user chưa login.
                });
        }

        const unsubscribe = subscribeAuthEvents((event) => {
            if (event.type === "LOGOUT") {
                clearRoleCookie();
                clearSession();
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [clearSession, pathname, setSession]);

    return null;
}
