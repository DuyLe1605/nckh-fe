import { apiClient } from "@/lib/api/axios-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "ENDED" | "SOLD" | "UNSOLD";

export type ProductItem = {
    id: string;
    sellerId: string;
    categoryId: string;
    title: string;
    description: string;
    startPrice: string;
    currentPrice: string;
    reservePrice?: string;
    bidIncrement: string;
    startTime: string; // ISO String
    endTime: string; // ISO String
    effectiveEndTime?: string; // ISO String
    antiSnipingTrigger: number;
    antiSnipingExtend: number;
    imageUrls?: string[];
    status: ProductStatus;
    version: number;
    createdAt: string;
    updatedAt: string;
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

export type ListProductsParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: ProductStatus;
    sellerId?: string;
    sortBy?: "createdAt" | "endTime" | "currentPrice";
    sortOrder?: "asc" | "desc";
};

export type CreateProductPayload = {
    categoryId: string;
    title: string;
    description: string;
    startPrice: number;
    bidIncrement: number;
    endTime: string;
    startTime?: string;
    reservePrice?: number;
    status?: ProductStatus;
    antiSnipingTrigger?: number;
    antiSnipingExtend?: number;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

type ListProductsResponse = {
    message: string;
    products: ProductItem[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

type ProductDetailResponse = {
    message: string;
    product: ProductItem;
};

type MutateProductResponse = {
    message: string;
    product: ProductItem;
};

type DeleteProductResponse = {
    message: string;
    id: string;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listMyProducts(sellerId: string, params: Omit<ListProductsParams, "sellerId"> = {}) {
    const response = await apiClient.get<ListProductsResponse>("/products", {
        params: { ...params, sellerId },
    });
    return response.data;
}

export async function createProduct(payload: CreateProductPayload) {
    const response = await apiClient.post<MutateProductResponse>("/products", payload);
    return response.data;
}

export async function updateProduct(id: string, payload: UpdateProductPayload) {
    const response = await apiClient.put<MutateProductResponse>(`/products/${id}`, payload);
    return response.data;
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/products/${id}`);
    return response.data;
}

export async function uploadProductImages(
    id: string,
    images: string[],
): Promise<{ message: string; product: ProductItem }> {
    const response = await apiClient.post<{ message: string; product: ProductItem }>(`/products/${id}/images`, {
        images,
    });
    return response.data;
}

export async function deleteProductImage(id: string, index: number): Promise<{ message: string; product: ProductItem }> {
    const response = await apiClient.delete<{ message: string; product: ProductItem }>(
        `/products/${id}/images/${index}`,
    );
    return response.data;
}

export async function getProductDetail(id: string) {
    const response = await apiClient.get<ProductDetailResponse>(`/products/${id}`);
    return response.data;
}
