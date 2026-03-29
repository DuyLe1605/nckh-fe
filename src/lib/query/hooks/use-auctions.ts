import { useQuery } from "@tanstack/react-query";
import { getAuctionDetail, listAuctions } from "@/lib/api/auctions.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";

export function useAuctionsQuery(params?: Record<string, any>) {
    return useQuery({
        queryKey: QUERY_KEYS.auctions.list(params),
        queryFn: () => listAuctions(params),
    });
}

export function useAuctionDetailQuery(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.auctions.detail(id),
        queryFn: () => getAuctionDetail(id),
        enabled: !!id,
    });
}
