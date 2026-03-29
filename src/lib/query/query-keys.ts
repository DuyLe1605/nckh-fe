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
        myBids: (params?: Record<string, string | number | undefined>) => ["bids", "me", params] as const,
    },
    wallets: {
        me: ["wallets", "me"] as const,
    },
    orders: {
        list: (params?: Record<string, string | number | undefined>) => ["orders", "list", params] as const,
        detail: (id: string) => ["orders", "detail", id] as const,
    },
    products: {
        myList: (params?: Record<string, string | number | undefined>) => ["products", "my", params] as const,
        detail: (id: string) => ["products", "detail", id] as const,
    },
    categories: {
        list: ["categories", "list"] as const,
    },
    admin: {
        users: (params?: Record<string, string | number | undefined>) => ["admin", "users", params] as const,
        dashboard: ["admin", "dashboard"] as const,
    },
} as const;
