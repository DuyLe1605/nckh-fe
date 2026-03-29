import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    listCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from "@/lib/api/categories.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { toast } from "sonner";

export function useCategoriesQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.categories.list,
        queryFn: listCategories,
    });
}

export function useCreateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; description?: string }) => createCategory(data),
        onSuccess: (data) => {
            toast.success(data.message || "Tạo danh mục thành công");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.list });
        },
        onError: (error: any) => {
            toast.error(`❌ ${error?.message ?? "Tạo danh mục thất bại"}`);
        },
    });
}

export function useUpdateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
            updateCategory(id, data),
        onSuccess: (data) => {
            toast.success(data.message || "Cập nhật danh mục thành công");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.list });
        },
        onError: (error: any) => {
            toast.error(`❌ ${error?.message ?? "Cập nhật thất bại"}`);
        },
    });
}

export function useDeleteCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: (data) => {
            toast.success(data.message || "Xóa danh mục thành công");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.list });
        },
        onError: (error: any) => {
            toast.error(`❌ ${error?.message ?? "Xóa thất bại"}`);
        },
    });
}
