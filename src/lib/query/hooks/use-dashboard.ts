import { useQuery } from "@tanstack/react-query";
import { getAdminAuthFunnelAnalytics, getAdminDashboardAnalytics } from "@/lib/api/admin.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";

export function useAdminDashboardQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.admin.dashboard,
        queryFn: getAdminDashboardAnalytics,
        staleTime: 30000,
    });
}

export function useAdminAuthFunnelQuery(days = 30) {
    return useQuery({
        queryKey: QUERY_KEYS.admin.authFunnel(days),
        queryFn: () => getAdminAuthFunnelAnalytics(days),
        staleTime: 30000,
    });
}
