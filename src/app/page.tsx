import Link from "next/link";
import { ROUTE_CONSTANTS } from "@/constants/app.constants";

export default function HomePage() {
    return (
        <main className="mx-auto grid min-h-[calc(100vh-84px)] max-w-6xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2">
            <section className="space-y-6">
                <p className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
                    Realtime Auction • Sprint 2 in progress
                </p>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                    Đấu giá trực tuyến tốc độ cao với giao diện premium.
                </h1>
                <p className="max-w-xl text-muted-foreground md:text-lg">
                    Trải nghiệm live bidding, role-based dashboard và wallet tracking trong một flow mượt mà, tối ưu cả
                    light/dark mode.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={ROUTE_CONSTANTS.LOGIN}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                        Bắt đầu ngay
                    </Link>
                    <Link
                        href={ROUTE_CONSTANTS.REGISTER}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background/60 px-5 text-sm font-medium transition hover:bg-muted"
                    >
                        Tạo tài khoản
                    </Link>
                    <Link
                        href={ROUTE_CONSTANTS.AUCTIONS_PREFIX}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/20 dark:text-indigo-300"
                    >
                        Xem danh sách auction
                    </Link>
                </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-background/70 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
                <div className="absolute -right-12 -top-12 size-40 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 size-44 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="relative space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">Platform highlights</p>
                    <div className="grid gap-3">
                        {[
                            "Live bid updates qua Socket.IO",
                            "Auth flow với TanStack Query + Axios",
                            "Client state rõ ràng bằng Zustand",
                            "Role route guard ở middleware layer",
                        ].map((item) => (
                            <div
                                key={item}
                                className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
