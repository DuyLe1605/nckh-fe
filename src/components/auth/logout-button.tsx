"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/api/auth.api";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { clearAccessToken } from "@/lib/auth/session-manager";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    const router = useRouter();
    const { clearSession } = useAuthUiStore();

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSettled: () => {
            document.cookie = `${APP_CONSTANTS.COOKIE_ROLE_KEY}=; path=/; max-age=0`;
            clearAccessToken();
            clearSession();
            router.push(ROUTE_CONSTANTS.LOGIN);
        },
    });

    return (
        <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            <LogOut className="size-4" />
            {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </Button>
    );
}
