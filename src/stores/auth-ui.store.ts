import { create } from "zustand";
import { AuthRole } from "@/lib/api/auth.api";

type AuthUiState = {
    isAuthenticated: boolean;
    currentRole: AuthRole | null;
    currentEmail: string | null;
    currentFullName: string | null;
    lastHydratedAt: number | null;
    setSession: (params: { role: AuthRole; email: string; fullName?: string }) => void;
    clearSession: () => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
    isAuthenticated: false,
    currentRole: null,
    currentEmail: null,
    currentFullName: null,
    lastHydratedAt: null,
    setSession: ({ role, email, fullName }) =>
        set({
            isAuthenticated: true,
            currentRole: role,
            currentEmail: email,
            currentFullName: fullName ?? null,
            lastHydratedAt: Date.now(),
        }),
    clearSession: () =>
        set({
            isAuthenticated: false,
            currentRole: null,
            currentEmail: null,
            currentFullName: null,
            lastHydratedAt: null,
        }),
}));
