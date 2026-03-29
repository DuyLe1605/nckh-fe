import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/api/watchlists.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { toast } from "sonner";

export function useWatchlistQuery(page = 1, limit = 50) {
    return useQuery({
        queryKey: ["watchlist", page, limit],
        queryFn: () => getWatchlist(page, limit),
    });
}

export function useAddToWatchlistMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addToWatchlist,
        onSuccess: () => {
            toast.success("✅ Đã thêm vào theo dõi");
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        },
        onError: () => {
            toast.error("❌ Thêm vào theo dõi thất bại (đã có?)");
        },
    });
}

export function useRemoveFromWatchlistMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeFromWatchlist,
        onSuccess: () => {
            toast.success("✅ Đã xoá khỏi danh sách theo dõi");
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        },
        onError: () => {
            toast.error("❌ Có lỗi xảy ra khi xoá");
        },
    });
}
