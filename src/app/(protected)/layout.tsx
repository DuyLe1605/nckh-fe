import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen bg-muted/20">
            <header className="sticky top-0 z-30 border-b border-border/80 bg-background/70 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                    <Link href={ROUTE_CONSTANTS.HOME} className="text-sm font-semibold">
                        {APP_CONSTANTS.APP_TITLE}
                    </Link>
                    <ThemeToggle />
                </div>
            </header>
            <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
    );
}
