"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
    { href: "/users", label: "👥 Quản lý người dùng", match: "/users" },
    { href: "/categories", label: "📁 Quản lý Danh mục", match: "/categories" },
    { href: "/disputes", label: "📋 Báo cáo & Tranh chấp", match: "/disputes" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="grid min-h-[calc(100vh-100px)] grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
            <aside className="space-y-2 rounded-lg border bg-background p-4">
                <h2 className="mb-4 text-sm font-semibold text-foreground">Admin Panel</h2>
                <nav className="space-y-1">
                    {ADMIN_NAV.map((item) => {
                        const isActive = pathname?.includes(item.match);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={
                                    "block rounded-md px-3 py-2 text-sm transition-colors " +
                                    (isActive
                                        ? "bg-primary/10 font-medium text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground")
                                }
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <section>{children}</section>
        </div>
    );
}
