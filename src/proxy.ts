import { NextRequest, NextResponse } from "next/server";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";

const PROTECTED_PREFIXES = [
    ROUTE_CONSTANTS.DASHBOARD,
    ROUTE_CONSTANTS.ADMIN,
    ROUTE_CONSTANTS.WALLET,
    ROUTE_CONSTANTS.PRODUCTS_CREATE,
    ROUTE_CONSTANTS.ORDERS,
    ROUTE_CONSTANTS.USERS,
    ROUTE_CONSTANTS.DISPUTES,
    ROUTE_CONSTANTS.PROFILE,
] as const;

const AUTH_PAGES = [ROUTE_CONSTANTS.LOGIN, ROUTE_CONSTANTS.REGISTER, ROUTE_CONSTANTS.FORGOT_PASSWORD] as const;

const ROLE_HOME_MAP = {
    [APP_CONSTANTS.ROLE_ADMIN]: ROUTE_CONSTANTS.ADMIN,
    [APP_CONSTANTS.ROLE_SUPER_ADMIN]: ROUTE_CONSTANTS.ADMIN,
    [APP_CONSTANTS.ROLE_SELLER]: ROUTE_CONSTANTS.PRODUCTS_CREATE,
    [APP_CONSTANTS.ROLE_BIDDER]: ROUTE_CONSTANTS.DASHBOARD,
} as const;

const VALID_ROLES = [
    APP_CONSTANTS.ROLE_ADMIN,
    APP_CONSTANTS.ROLE_SUPER_ADMIN,
    APP_CONSTANTS.ROLE_SELLER,
    APP_CONSTANTS.ROLE_BIDDER,
] as const;

type ValidRole = (typeof VALID_ROLES)[number];

function isValidRole(role: string | undefined): role is ValidRole {
    return !!role && VALID_ROLES.includes(role as ValidRole);
}

function hasAnyRole(role: ValidRole, allowedRoles: readonly ValidRole[]) {
    return allowedRoles.includes(role);
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isAuthPage = AUTH_PAGES.some((page) => pathname === page);

    const roleValue = request.cookies.get(APP_CONSTANTS.COOKIE_ROLE_KEY)?.value;
    const role = isValidRole(roleValue) ? roleValue : undefined;

    if (isAuthPage && role) {
        return NextResponse.redirect(new URL(ROLE_HOME_MAP[role], request.url));
    }

    if (!isProtected) {
        return NextResponse.next();
    }

    if (!role) {
        return NextResponse.redirect(new URL(APP_CONSTANTS.LOGIN_PATH, request.url));
    }

    const isAdminRoute =
        pathname.startsWith(ROUTE_CONSTANTS.ADMIN) ||
        pathname.startsWith(ROUTE_CONSTANTS.USERS) ||
        pathname.startsWith(ROUTE_CONSTANTS.DISPUTES);
    const isSellerRoute =
        pathname.startsWith(ROUTE_CONSTANTS.PRODUCTS_CREATE) || pathname.startsWith(ROUTE_CONSTANTS.ORDERS);

    if (isAdminRoute && !hasAnyRole(role, [APP_CONSTANTS.ROLE_ADMIN, APP_CONSTANTS.ROLE_SUPER_ADMIN])) {
        return NextResponse.redirect(new URL(APP_CONSTANTS.UNAUTHORIZED_PATH, request.url));
    }

    if (
        isSellerRoute &&
        !hasAnyRole(role, [APP_CONSTANTS.ROLE_SELLER, APP_CONSTANTS.ROLE_ADMIN, APP_CONSTANTS.ROLE_SUPER_ADMIN])
    ) {
        return NextResponse.redirect(new URL(APP_CONSTANTS.UNAUTHORIZED_PATH, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/register",
        "/forgot-password",
        "/dashboard/:path*",
        "/admin/:path*",
        "/wallet/:path*",
        "/products/create/:path*",
        "/orders/:path*",
        "/users/:path*",
        "/disputes/:path*",
        "/profile/:path*",
    ],
};
