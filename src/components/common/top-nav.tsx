"use client";

import Link from "next/link";
import { useAuthUiStore } from "@/stores/auth-ui.store";
import { ROUTE_CONSTANTS, APP_CONSTANTS } from "@/constants/app.constants";

export function TopNav() {
    const { currentRole } = useAuthUiStore();

    if (!currentRole) return null;

    let items: { href: string; label: string }[] = [];

    switch (currentRole) {
        case APP_CONSTANTS.ROLE_ADMIN:
        case APP_CONSTANTS.ROLE_SUPER_ADMIN:
            items = [
                { href: ROUTE_CONSTANTS.AUCTIONS_PREFIX, label: "Tất cả đấu giá" },
                { href: "/admin", label: "Admin Panel" },
                { href: ROUTE_CONSTANTS.PROFILE, label: "Hồ sơ" },
            ];
            break;
        case APP_CONSTANTS.ROLE_SELLER:
            items = [
                { href: ROUTE_CONSTANTS.AUCTIONS_PREFIX, label: "Tất cả đấu giá" },
                { href: ROUTE_CONSTANTS.PRODUCTS, label: "Sản phẩm của tôi" },
                { href: ROUTE_CONSTANTS.ORDERS, label: "Đơn bán" },
                { href: ROUTE_CONSTANTS.WALLET, label: "Ví tiền" },
                { href: ROUTE_CONSTANTS.PROFILE, label: "Hồ sơ" },
            ];
            break;
        case APP_CONSTANTS.ROLE_BIDDER:
            items = [
                { href: ROUTE_CONSTANTS.AUCTIONS_PREFIX, label: "Đấu giá" },
                { href: ROUTE_CONSTANTS.DASHBOARD, label: "Lịch sử đấu giá" },
                { href: ROUTE_CONSTANTS.MY_ORDERS, label: "Đơn mua" },
                { href: ROUTE_CONSTANTS.WALLET, label: "Ví tiền" },
                { href: ROUTE_CONSTANTS.PROFILE, label: "Hồ sơ" },
            ];
            break;
    }

    return (
        <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground md:flex">
            {items.map((item) => (
                <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
