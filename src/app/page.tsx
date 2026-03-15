import Link from "next/link";

export default function HomePage() {
    return (
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">Realtime Auction Platform</p>
            <h1 className="text-4xl font-bold tracking-tight">NCKH Auction — Next.js + NestJS</h1>
            <p className="max-w-2xl text-muted-foreground">
                Sprint 1 frontend skeleton is ready with Tailwind + shadcn/ui, role-based route groups and middleware
                placeholder.
            </p>
            <div className="flex gap-3">
                <Link
                    href="/login"
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                    Đăng nhập
                </Link>
                <Link
                    href="/auctions/demo-auction"
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground"
                >
                    Xem phiên đấu giá mẫu
                </Link>
            </div>
        </main>
    );
}
