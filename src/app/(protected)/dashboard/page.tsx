"use client";

import { useAuthUiStore } from "@/stores/auth-ui.store";
import BidderDashboardPage from "./bidder-dashboard";
import SellerDashboardPage from "./seller-dashboard";
import { APP_CONSTANTS } from "@/constants/app.constants";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const currentRole = useAuthUiStore(s => s.currentRole);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="space-y-6">
                <header>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                </header>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (currentRole === APP_CONSTANTS.ROLE_BIDDER) {
        return <BidderDashboardPage />;
    }

    if (currentRole === APP_CONSTANTS.ROLE_SELLER) {
        return <SellerDashboardPage />;
    }

    if (currentRole === APP_CONSTANTS.ROLE_ADMIN) {
        // Admin usually has its own dashboard at /admin, but if they hit /dashboard:
        return (
            <section className="space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold">Trang tổng quan Admin</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Admin không sử dụng trang này. Vui lòng chuyển hướng sang trang quản trị viên.
                    </p>
                </header>
            </section>
        );
    }

    return null;
}
