import { apiClient } from "@/lib/api/axios-client";

export type CreateReviewPayload = {
    orderId: string;
    rating: number;
    comment?: string;
};

export async function createReview(payload: CreateReviewPayload) {
    const response = await apiClient.post<{ message: string; review: any }>(
        "/reviews",
        payload
    );
    return response.data;
}

export async function getUserReviews(userId: string, page = 1, pageSize = 10) {
    const response = await apiClient.get<any>(
        `/reviews/users/${userId}`,
        { params: { page, pageSize } }
    );
    return response.data;
}
