import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardAnalytics } from "@/lib/api/admin.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";

export function useAdminDashboardQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.admin.dashboard,
        queryFn: getAdminDashboardAnalytics,
        staleTime: 30000,
    });
}
