import { apiClient } from "@/lib/api/axios-client";

export type WatchlistItem = {
    id: string;
    userId: string;
    productId: string;
    createdAt: string;
    product: {
        title: string;
        currentPrice: string | number;
        endTime: string;
        imageUrls: string[];
        category: { name: string };
        seller: { fullName: string; reputationScore: string | number };
    };
};

export type WatchlistResponse = {
    message: string;
    items: WatchlistItem[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

export async function getWatchlist(page = 1, pageSize = 10) {
    const response = await apiClient.get<WatchlistResponse>("/watchlist", {
        params: { page, pageSize },
    });
    return response.data;
}

export async function addToWatchlist(productId: string) {
    const response = await apiClient.post<{ message: string; item: any }>(
        `/watchlist/${productId}`
    );
    return response.data;
}

export async function removeFromWatchlist(productId: string) {
    const response = await apiClient.delete<{ message: string }>(
        `/watchlist/${productId}`
    );
    return response.data;
}
