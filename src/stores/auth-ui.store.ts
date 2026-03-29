import { create } from "zustand";
import { AuthRole } from "@/lib/api/auth.api";

type AuthUiState = {
    isAuthenticated: boolean;
    currentUserId: string | null;
    currentRole: AuthRole | null;
    currentEmail: string | null;
    currentFullName: string | null;
    lastHydratedAt: number | null;
    setSession: (params: { id?: string; role: AuthRole; email: string; fullName?: string }) => void;
    clearSession: () => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
    isAuthenticated: false,
    currentUserId: null,
    currentRole: null,
    currentEmail: null,
    currentFullName: null,
    lastHydratedAt: null,
    setSession: ({ id, role, email, fullName }) =>
        set({
            isAuthenticated: true,
            currentUserId: id ?? null,
            currentRole: role,
            currentEmail: email,
            currentFullName: fullName ?? null,
            lastHydratedAt: Date.now(),
        }),
    clearSession: () =>
        set({
            isAuthenticated: false,
            currentUserId: null,
            currentRole: null,
            currentEmail: null,
            currentFullName: null,
            lastHydratedAt: null,
        }),
}));

