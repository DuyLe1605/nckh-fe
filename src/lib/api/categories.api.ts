import { apiClient } from "@/lib/api/axios-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryItem = {
    id: string;
    name: string;
    description?: string | null;
    parentId?: string | null;
};

export type CreateCategoryPayload = {
    name: string;
    description?: string;
    parentId?: string;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

type ListCategoriesResponse = {
    message: string;
    categories: CategoryItem[];
};

type MutateCategoryResponse = {
    message: string;
    category: CategoryItem;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listCategories() {
    const response = await apiClient.get<ListCategoriesResponse>("/categories");
    return response.data;
}

export async function createCategory(payload: CreateCategoryPayload) {
    const response = await apiClient.post<MutateCategoryResponse>("/categories", payload);
    return response.data;
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload) {
    const response = await apiClient.put<MutateCategoryResponse>(`/categories/${id}`, payload);
    return response.data;
}

export async function deleteCategory(id: string) {
    const response = await apiClient.delete<{ message: string; id: string }>(`/categories/${id}`);
    return response.data;
}
