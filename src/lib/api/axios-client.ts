import axios from "axios";
import { APP_CONSTANTS } from "@/constants/app.constants";
import { getDeviceId } from "@/lib/auth/device-id";
import { getAccessToken, getAccessTokenWithMutex, setAccessToken } from "@/lib/auth/session-manager";

function getBaseUrl() {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? `${APP_CONSTANTS.DEFAULT_BE_ORIGIN}${APP_CONSTANTS.API_PREFIX}`;
}

export const apiClient = axios.create({
    baseURL: getBaseUrl(),
    timeout: APP_CONSTANTS.API_TIMEOUT_MS,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

const authExcludedEndpoints = [
    APP_CONSTANTS.AUTH_LOGIN_ENDPOINT,
    APP_CONSTANTS.AUTH_REGISTER_ENDPOINT,
    APP_CONSTANTS.AUTH_REFRESH_ENDPOINT,
] as const;

async function requestTokenRefresh() {
    try {
        const deviceId = getDeviceId();
        const response = await axios.post<{ accessToken?: string }>(
            `${getBaseUrl()}${APP_CONSTANTS.AUTH_REFRESH_ENDPOINT}`,
            { deviceId },
            {
                timeout: APP_CONSTANTS.API_TIMEOUT_MS,
                withCredentials: true,
            },
        );

        const nextAccessToken = response.data.accessToken ?? null;
        setAccessToken(nextAccessToken);
        return nextAccessToken;
    } catch {
        return null;
    }
}

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (!token) return config;

    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const rawMessage = error?.response?.data?.message;
        const message = Array.isArray(rawMessage) ? rawMessage.join("; ") : rawMessage;
        const originalConfig = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;
        const requestUrl: string = originalConfig?.url ?? "";

        const shouldSkipRefresh = authExcludedEndpoints.some((endpoint) => requestUrl.includes(endpoint));

        if (status === 401 && originalConfig && !originalConfig._retry && !shouldSkipRefresh) {
            originalConfig._retry = true;
            const token = await getAccessTokenWithMutex(requestTokenRefresh);

            if (token) {
                originalConfig.headers = originalConfig.headers ?? {};
                originalConfig.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalConfig);
            }
        }

        return Promise.reject({
            status: typeof status === "number" ? status : 500,
            message: typeof message === "string" ? message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
            raw: error,
        });
    },
);
