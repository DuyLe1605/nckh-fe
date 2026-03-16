"use client";

import { useMemo } from "react";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { StatusBadge } from "@/components/ui/status-badge";

export function CurrentRoleBadge() {
    const { currentRole, isAuthenticated } = useAuthUiStore();

    const text = useMemo(() => {
        if (!isAuthenticated || !currentRole) return "GUEST";
        return currentRole;
    }, [currentRole, isAuthenticated]);

    return <StatusBadge status={text} className="hidden md:inline-flex" />;
}
