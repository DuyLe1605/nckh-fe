import { apiClient } from "@/lib/api/axios-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BidStatus = "WINNING" | "OUTBID" | "RETRACTED";

export type BidItem = {
    id: string;
    productId: string;
    bidderId: string;
    bidAmount: string | number;
    maxAutoBid?: string | number | null;
    status: BidStatus;
    serverTimestamp: string;
    bidder?: {
        id: string;
        fullName: string;
    };
};

export type PlaceBidPayload = {
    bidAmount: number;
    maxAutoBid?: number;
};

type PlaceBidResponse = {
    message: string;
    bid: BidItem;
    newPrice: number;
    instantlyOutbid?: boolean;
};

type BidHistoryResponse = {
    message: string;
    productId: string;
    bids: BidItem[];
    scope: string;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function placeBid(productId: string, payload: PlaceBidPayload) {
    const response = await apiClient.post<PlaceBidResponse>(
        `/products/${productId}/bids`,
        payload,
    );
    return response.data;
}

export async function getBidHistory(productId: string) {
    const response = await apiClient.get<BidHistoryResponse>(
        `/products/${productId}/bids`,
    );
    return response.data;
}

// ─── My Bids (all bids by current user) ───────────────────────────────────────

export type MyBidsParams = {
    page?: number;
    pageSize?: number;
    status?: BidStatus;
};

export type MyBidItem = BidItem & {
    product?: {
        id: string;
        title: string;
        status: string;
        currentPrice: string | number;
        effectiveEndTime: string;
        antiSnipingTrigger: number;
        antiSnipingExtend: number;
        category?: { name: string };
    };
};

type MyBidsResponse = {
    message: string;
    bids: MyBidItem[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

export async function getMyBids(params: MyBidsParams = {}) {
    const response = await apiClient.get<MyBidsResponse>("/bids/me", {
        params,
    });
    return response.data;
}

