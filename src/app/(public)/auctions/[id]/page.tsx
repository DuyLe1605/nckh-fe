type AuctionDetailPageProps = {
    params: Promise<{ id: string }>;
};

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
    const { id } = await params;

    return (
        <main className="mx-auto max-w-4xl px-6 py-10">
            <h1 className="mb-3 text-2xl font-semibold">Auction #{id}</h1>
            <p className="text-sm text-muted-foreground">
                SSR detail skeleton. Real-time bid panel + countdown sẽ được hoàn thiện ở Sprint 4/5.
            </p>
        </main>
    );
}
