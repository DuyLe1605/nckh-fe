"use client";

import { useEffect } from "react";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { refreshSession } from "@/lib/api/auth.api";
import { setAccessToken, subscribeAuthEvents } from "@/lib/auth/session-manager";

export function AuthSessionSync() {
    const { clearSession, setSession } = useAuthUiStore();

    useEffect(() => {
        let mounted = true;

        refreshSession()
            .then((payload) => {
                if (!mounted) return;
                if (payload.accessToken) {
                    setAccessToken(payload.accessToken);
                }

                if (payload.user?.email && payload.user.role) {
                    setSession({
                        role: payload.user.role,
                        email: payload.user.email,
                        fullName: payload.user.fullName,
                    });
                }
            })
            .catch(() => {
                // Refresh thất bại là trạng thái bình thường khi user chưa login.
            });

        const unsubscribe = subscribeAuthEvents((event) => {
            if (event.type === "LOGOUT") {
                clearSession();
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [clearSession, setSession]);

    return null;
}
