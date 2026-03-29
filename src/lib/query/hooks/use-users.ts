import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers as getAdminUsers, updateUserStatus, type UserRole, type UserStatus } from "@/lib/api/admin.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { toast } from "sonner";

export function useAdminUsersQuery(params: { page?: number; pageSize?: number; search?: string; role?: UserRole; status?: UserStatus }) {
    return useQuery({
        queryKey: QUERY_KEYS.admin.users(params),
        queryFn: () => getAdminUsers(params),
    });
}

export function useUpdateUserStatusMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
            updateUserStatus(id, status),
        onSuccess: (data) => {
            toast.success(data.message || "Cập nhật trạng thái thành công");
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
        onError: (error: any) => {
            toast.error(`❌ ${error?.message ?? "Cập nhật thất bại"}`);
        },
    });
}
