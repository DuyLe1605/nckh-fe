import { create } from "zustand";
import { AuthRole } from "@/lib/api/auth.api";

type AuthUiState = {
    isAuthenticated: boolean;
    currentRole: AuthRole | null;
    currentEmail: string | null;
    setSession: (params: { role: AuthRole; email: string }) => void;
    clearSession: () => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
    isAuthenticated: false,
    currentRole: null,
    currentEmail: null,
    setSession: ({ role, email }) =>
        set({
            isAuthenticated: true,
            currentRole: role,
            currentEmail: email,
        }),
    clearSession: () =>
        set({
            isAuthenticated: false,
            currentRole: null,
            currentEmail: null,
        }),
}));
