import { apiClient } from "@/lib/api/axios-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
    | "PENDING_PAYMENT"
    | "PAYMENT_SECURED"
    | "SHIPPED"
    | "COMPLETED"
    | "DISPUTED";

export type OrderItem = {
    id: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    winningBidId: string;
    finalPrice: string | number;
    platformFee: string | number;
    orderSnapshot: Record<string, unknown>;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    product?: {
        id: string;
        title: string;
        status: string;
    };
    buyer?: {
        id: string;
        fullName: string;
        email: string;
    };
    seller?: {
        id: string;
        fullName: string;
        email: string;
    };
    winningBid?: {
        id: string;
        bidAmount: string | number;
        serverTimestamp: string;
    };
};

export type ListOrdersParams = {
    page?: number;
    pageSize?: number;
    status?: OrderStatus;
};

type ListOrdersResponse = {
    message: string;
    orders: OrderItem[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    scope: string;
};

type OrderDetailResponse = {
    message: string;
    order: OrderItem;
    scope: string;
};

type UpdateStatusResponse = {
    message: string;
    order: OrderItem;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listOrders(params: ListOrdersParams = {}) {
    const response = await apiClient.get<ListOrdersResponse>("/orders", {
        params,
    });
    return response.data;
}

export async function getOrderDetail(id: string) {
    const response = await apiClient.get<OrderDetailResponse>(`/orders/${id}`);
    return response.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
    const response = await apiClient.patch<UpdateStatusResponse>(
        `/orders/${id}/status`,
        null,
        { params: { status } },
    );
    return response.data;
}
