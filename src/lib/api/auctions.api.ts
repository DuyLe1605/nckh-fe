import { apiClient } from "@/lib/api/axios-client";

export type AuctionStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "ENDED" | "SOLD" | "UNSOLD";

export type AuctionListParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: AuctionStatus;
    sortBy?: "createdAt" | "endTime" | "currentPrice";
    sortOrder?: "asc" | "desc";
};

export type AuctionItem = {
    id: string;
    title: string;
    description: string;
    status: AuctionStatus;
    startPrice: string | number;
    currentPrice: string | number;
    bidIncrement: string | number;
    endTime: string;
    createdAt: string;
};

type PaginationPayload = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

type ListAuctionsResponse = {
    message: string;
    products: AuctionItem[];
    pagination: PaginationPayload;
};

type AuctionDetailResponse = {
    message: string;
    product: AuctionItem & {
        seller?: {
            id: string;
            fullName: string;
            email: string;
            role: string;
        };
        category?: {
            id: string;
            name: string;
            description?: string | null;
        };
    };
};

export async function listAuctions(params: AuctionListParams = {}) {
    const response = await apiClient.get<ListAuctionsResponse>("/products", {
        params,
    });
    return response.data;
}

export async function getAuctionDetail(id: string) {
    const response = await apiClient.get<AuctionDetailResponse>(`/products/${id}`);
    return response.data;
}
