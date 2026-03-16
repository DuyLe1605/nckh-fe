export const QUERY_KEYS = {
    auth: {
        profile: ["auth", "profile"] as const,
    },
    auctions: {
        list: (params?: Record<string, string | number | undefined>) => ["auctions", "list", params] as const,
        detail: (id: string) => ["auctions", "detail", id] as const,
    },
    bids: {
        history: (productId: string) => ["bids", "history", productId] as const,
    },
} as const;
