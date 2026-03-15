import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute -left-24 -top-32 size-96 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-32 size-112 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
                <Link href={ROUTE_CONSTANTS.HOME} className="text-sm font-semibold tracking-tight">
                    {APP_CONSTANTS.APP_TITLE}
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href={ROUTE_CONSTANTS.LOGIN}
                        className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        href={ROUTE_CONSTANTS.REGISTER}
                        className="rounded-md border border-border bg-background/70 px-3 py-1.5 text-sm transition hover:bg-muted"
                    >
                        Đăng ký
                    </Link>
                    <ThemeToggle />
                </div>
            </div>

            <div>{children}</div>
        </div>
    );
}
