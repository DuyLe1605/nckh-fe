import { apiClient } from "@/lib/api/axios-client";
import { APP_CONSTANTS } from "@/constants/app.constants";
import { getDeviceId } from "@/lib/auth/device-id";

export type AuthRole = "BIDDER" | "SELLER" | "ADMIN";

export type AuthUser = {
    email: string;
    role: AuthRole;
    fullName?: string;
};

export type AuthSessionPayload = {
    message: string;
    accessToken: string | null;
    refreshTokenExpiresAt: string | null;
    user: AuthUser | null;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    email: string;
    password: string;
    fullName: string;
};

type AuthApiSkeletonResponse<TPayload> = {
    message: string;
    body: TPayload;
    accessToken?: string;
    refreshTokenExpiresAt?: string;
    user?: AuthUser;
};

function normalizeAuthResponse<TPayload>(
    response: AuthApiSkeletonResponse<TPayload>,
    fallback?: Partial<AuthUser>,
): AuthSessionPayload {
    const fallbackUser =
        fallback?.email && fallback?.role
            ? { email: fallback.email, role: fallback.role, fullName: fallback.fullName }
            : null;

    return {
        message: response.message,
        accessToken: response.accessToken ?? null,
        refreshTokenExpiresAt: response.refreshTokenExpiresAt ?? null,
        user: response.user ?? fallbackUser,
    };
}

export async function login(payload: LoginPayload, fallbackRole?: AuthRole) {
    const deviceId = getDeviceId();
    const response = await apiClient.post<AuthApiSkeletonResponse<LoginPayload>>(APP_CONSTANTS.AUTH_LOGIN_ENDPOINT, {
        ...payload,
        deviceId,
    });
    return normalizeAuthResponse(response.data, {
        email: payload.email,
        role: fallbackRole,
    });
}

export async function register(payload: RegisterPayload) {
    const response = await apiClient.post<AuthApiSkeletonResponse<RegisterPayload>>(
        APP_CONSTANTS.AUTH_REGISTER_ENDPOINT,
        payload,
    );
    return normalizeAuthResponse(response.data, {
        email: payload.email,
    });
}

export async function refreshSession() {
    const deviceId = getDeviceId();
    const response = await apiClient.post<AuthApiSkeletonResponse<null>>(APP_CONSTANTS.AUTH_REFRESH_ENDPOINT, {
        deviceId,
    });
    return normalizeAuthResponse(response.data);
}

export async function me() {
    const response = await apiClient.get<{ user?: AuthUser; message?: string }>(APP_CONSTANTS.AUTH_ME_ENDPOINT);

    return {
        message: response.data.message ?? "Profile fetched",
        user: response.data.user ?? null,
    };
}

export async function logout() {
    const response = await apiClient.post<{ message?: string }>(APP_CONSTANTS.AUTH_LOGOUT_ENDPOINT);
    return {
        message: response.data.message ?? "Logged out",
    };
}

export async function logoutAllDevices() {
    const response = await apiClient.post<{ message?: string }>(APP_CONSTANTS.AUTH_LOGOUT_ALL_ENDPOINT);
    return {
        message: response.data.message ?? "Logged out from all devices",
    };
}
