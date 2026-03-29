import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listOrders, updateOrderStatus, type OrderStatus } from "@/lib/api/orders.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { toast } from "sonner";

export function useOrdersQuery(statusFilter?: OrderStatus | "") {
    return useQuery({
        queryKey: QUERY_KEYS.orders.list(statusFilter ? { status: statusFilter } : undefined),
        queryFn: () => listOrders(statusFilter ? { status: statusFilter as OrderStatus } : {}),
        staleTime: 15_000,
    });
}

export function useUpdateOrderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            updateOrderStatus(id, status),
        onSuccess: (data) => {
            toast.success(`✅ ${data.message}`);
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error: { message?: string }) => {
            toast.error(`❌ ${error?.message ?? "Cập nhật thất bại"}`);
        },
    });
}
