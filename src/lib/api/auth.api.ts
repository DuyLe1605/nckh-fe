import { apiClient } from "@/lib/api/axios-client";
import { APP_CONSTANTS } from "@/constants/app.constants";

export type AuthRole = "BIDDER" | "SELLER" | "ADMIN";

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
};

export async function login(payload: LoginPayload) {
    const response = await apiClient.post<AuthApiSkeletonResponse<LoginPayload>>(
        APP_CONSTANTS.AUTH_LOGIN_ENDPOINT,
        payload,
    );
    return response.data;
}

export async function register(payload: RegisterPayload) {
    const response = await apiClient.post<AuthApiSkeletonResponse<RegisterPayload>>(
        APP_CONSTANTS.AUTH_REGISTER_ENDPOINT,
        payload,
    );
    return response.data;
}
