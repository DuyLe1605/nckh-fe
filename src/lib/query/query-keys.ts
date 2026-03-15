export const QUERY_KEYS = {
    auth: {
        profile: ["auth", "profile"] as const,
    },
    auctions: {
        list: ["auctions", "list"] as const,
        detail: (id: string) => ["auctions", "detail", id] as const,
    },
} as const;
