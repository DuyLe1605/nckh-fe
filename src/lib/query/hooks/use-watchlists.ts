import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/api/watchlists.api";
import { toast } from "sonner";

export function useWatchlistsQuery() {
    return useQuery({
        queryKey: ["watchlist"],
        queryFn: () => getWatchlist(1, 50),
    });
}

export function useWatchlistToggleMutation(isWatchlisted: boolean, productId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (isWatchlisted) {
                return removeFromWatchlist(productId);
            }
            return addToWatchlist(productId);
        },
        onSuccess: () => {
            toast.success(isWatchlisted ? "Đã xoá khỏi danh sách theo dõi" : "Đã thêm vào danh sách theo dõi");
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        },
        onError: () => {
            toast.error("Không thể thay đổi trạng thái theo dõi");
        }
    });
}
