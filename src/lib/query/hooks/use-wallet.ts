import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyWallet, deposit } from "@/lib/api/wallets.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { toast } from "sonner";

export function useMyWalletQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.wallets.me,
        queryFn: getMyWallet,
        staleTime: 10_000,
    });
}

export function useDepositMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) =>
            deposit({
                amount,
                idempotencyKey: `dep-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallets.me });
        },
    });
}
