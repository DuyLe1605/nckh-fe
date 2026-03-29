import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    listMyProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    type ProductStatus,
} from "@/lib/api/products.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useMyProductsQuery(sellerId: string, params: { page?: number; limit?: number; status?: ProductStatus; search?: string }) {
    return useQuery({
        queryKey: QUERY_KEYS.products.myList(params),
        queryFn: () => listMyProducts(sellerId, params),
        enabled: !!sellerId,
    });
}

export function useProductDetailQuery(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.products.detail(id),
        queryFn: () => getProductDetail(id),
        enabled: !!id,
    });
}

export function useCreateProductMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: (data) => {
            toast.success("✅ " + (data.message || "Tạo sản phẩm thành công"));
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.myList() });
            router.push("/seller/products");
        },
        onError: (error: any) => {
            toast.error(`❌ Lỗi: ${error.message || "Không thể tạo sản phẩm"}`);
        },
    });
}

export function useUpdateProductMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => updateProduct(id, payload),
        onSuccess: (data: any, variables) => {
            toast.success("✅ " + (data.message || "Đã cập nhật sản phẩm"));
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.myList() });
            router.push("/seller/products");
        },
        onError: (error: any) => {
            toast.error(`❌ Cập nhật thất bại: ${error.message || "Lỗi không xác định"}`);
        },
    });
}

export function useDeleteProductMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: (data) => {
            toast.success("✅ " + (data.message || "Đã xóa sản phẩm"));
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.myList() });
        },
        onError: (error: any) => {
            toast.error(`❌ Lỗi: ${error.message || "Không thể xóa sản phẩm"}`);
        },
    });
}
