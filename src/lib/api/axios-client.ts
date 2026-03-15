import axios from "axios";
import { APP_CONSTANTS } from "@/constants/app.constants";

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

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        return Promise.reject({
            status: typeof status === "number" ? status : 500,
            message: typeof message === "string" ? message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
            raw: error,
        });
    },
);
