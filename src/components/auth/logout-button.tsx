"use client";

import { LogOut } from "lucide-react";
import { useLogoutMutation } from "@/lib/query/hooks/use-profile";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    const logoutMutation = useLogoutMutation();

    return (
        <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            <LogOut className="size-4" />
            {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </Button>
    );
}
