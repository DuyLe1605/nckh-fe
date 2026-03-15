export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid min-h-screen grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
            <aside className="rounded-lg border bg-background p-4">
                <h2 className="font-semibold">Admin Panel</h2>
            </aside>
            <section>{children}</section>
        </div>
    );
}
