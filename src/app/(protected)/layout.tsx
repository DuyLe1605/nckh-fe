import Link from "next/link";
import { CurrentRoleBadge } from "@/components/auth/current-role-badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";

const NAV_ITEMS = [
    { href: ROUTE_CONSTANTS.AUCTIONS_PREFIX, label: "Auctions" },
    { href: ROUTE_CONSTANTS.DASHBOARD, label: "Dashboard" },
    { href: ROUTE_CONSTANTS.ORDERS, label: "Orders" },
    { href: ROUTE_CONSTANTS.WALLET, label: "Wallet" },
    { href: ROUTE_CONSTANTS.PROFILE, label: "Profile" },
] as const;

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen bg-muted/20">
            <header className="sticky top-0 z-30 border-b border-border/80 bg-background/70 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-6">
                        <Link href={ROUTE_CONSTANTS.HOME} className="text-sm font-semibold">
                            {APP_CONSTANTS.APP_TITLE}
                        </Link>
                        <nav className="hidden items-center gap-3 text-sm text-muted-foreground md:flex">
                            {NAV_ITEMS.map((item) => (
                                <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-2">
                        <CurrentRoleBadge />
                        <ThemeToggle />
                        <LogoutButton />
                    </div>
                </div>
            </header>
            <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
    );
}
