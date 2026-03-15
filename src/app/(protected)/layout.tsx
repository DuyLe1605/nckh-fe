export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen bg-muted/20">
            <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
    );
}
