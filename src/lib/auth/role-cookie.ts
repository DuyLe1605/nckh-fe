import { APP_CONSTANTS } from "@/constants/app.constants";
import { AuthRole } from "@/lib/api/auth.api";

export function setRoleCookie(role: AuthRole) {
    if (typeof document === "undefined") return;
    document.cookie = `${APP_CONSTANTS.COOKIE_ROLE_KEY}=${role}; path=/; max-age=${APP_CONSTANTS.COOKIE_MAX_AGE_SECONDS}`;
}

export function clearRoleCookie() {
    if (typeof document === "undefined") return;
    document.cookie = `${APP_CONSTANTS.COOKIE_ROLE_KEY}=; path=/; max-age=0`;
}
