import { useQuery, useMutation } from "@tanstack/react-query";
import { me, logoutAllDevices } from "@/lib/api/auth.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { useRouter } from "next/navigation";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";
import { clearAccessToken } from "@/lib/auth/session-manager";
import { useAuthUiStore } from "@/stores/auth-ui.store";

export function useProfileQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.auth.profile,
        queryFn: me,
        retry: 1,
    });
}

export function useLogoutAllMutation() {
    const router = useRouter();
    const clearSession = useAuthUiStore((s) => s.clearSession);

    return useMutation({
        mutationFn: logoutAllDevices,
        onSettled: () => {
            document.cookie = `${APP_CONSTANTS.COOKIE_ROLE_KEY}=; path=/; max-age=0`;
            clearAccessToken();
            clearSession();
            router.push(ROUTE_CONSTANTS.LOGIN);
        },
    });
}
