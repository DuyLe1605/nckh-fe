"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/lib/api/watchlists.api";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type WatchlistButtonProps = {
    productId: string;
    currentUserId?: string;
};

export function WatchlistButton({ productId, currentUserId }: WatchlistButtonProps) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["watchlist"],
        queryFn: () => getWatchlist(1, 50),
        enabled: !!currentUserId,
    });

    const isWatchlisted = query.data?.items.some(item => item.productId === productId);

    const toggleMutation = useMutation({
        mutationFn: async () => {
            if (isWatchlisted) {
                return removeFromWatchlist(productId);
            }
            return addToWatchlist(productId);
        },
        onSuccess: () => {
            toast.success(isWatchlisted ? "Đã bỏ theo dõi" : "Đã thêm vào danh sách theo dõi");
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        },
        onError: () => {
            toast.error("Không thể thay đổi trạng thái theo dõi");
        }
    });

    if (!currentUserId) return null;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => toggleMutation.mutate()}
            disabled={query.isLoading || toggleMutation.isPending}
            className={cn("transition-colors", isWatchlisted ? "text-red-500 hover:text-red-600 border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20" : "")}
            title={isWatchlisted ? "Bỏ theo dõi" : "Thêm vào danh sách theo dõi"}
        >
            <Heart className={cn("h-4 w-4", isWatchlisted ? "fill-current" : "")} />
        </Button>
    );
}
