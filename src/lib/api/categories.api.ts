import { apiClient } from "@/lib/api/axios-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryItem = {
    id: string;
    name: string;
    description?: string | null;
    parentId?: string | null;
};

type ListCategoriesResponse = {
    message: string;
    categories: CategoryItem[];
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listCategories() {
    const response = await apiClient.get<ListCategoriesResponse>("/categories");
    return response.data;
}
