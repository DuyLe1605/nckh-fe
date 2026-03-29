import { useQuery } from "@tanstack/react-query";
import { getMyBids } from "@/lib/api/bids.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";

export function useMyBidsQuery(params: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.bids.myBids(params),
        queryFn: () => getMyBids(params),
    });
}
