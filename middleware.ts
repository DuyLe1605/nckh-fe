import { NextRequest, NextResponse } from "next/server";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "./src/constants/app.constants";

const PROTECTED_PREFIXES = [
    ROUTE_CONSTANTS.DASHBOARD,
    ROUTE_CONSTANTS.WALLET,
    ROUTE_CONSTANTS.PRODUCTS_CREATE,
    ROUTE_CONSTANTS.ORDERS,
    ROUTE_CONSTANTS.USERS,
    ROUTE_CONSTANTS.DISPUTES,
] as const;

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (!isProtected) return NextResponse.next();

    const role = request.cookies.get(APP_CONSTANTS.COOKIE_ROLE_KEY)?.value;

    if (!role) {
        return NextResponse.redirect(new URL(APP_CONSTANTS.LOGIN_PATH, request.url));
    }

    const isAdminRoute = pathname.startsWith(ROUTE_CONSTANTS.USERS) || pathname.startsWith(ROUTE_CONSTANTS.DISPUTES);
    const isSellerRoute =
        pathname.startsWith(ROUTE_CONSTANTS.PRODUCTS_CREATE) || pathname.startsWith(ROUTE_CONSTANTS.ORDERS);

    if (isAdminRoute && role !== APP_CONSTANTS.ROLE_ADMIN) {
        return NextResponse.redirect(new URL(APP_CONSTANTS.UNAUTHORIZED_PATH, request.url));
    }

    if (isSellerRoute && role !== APP_CONSTANTS.ROLE_SELLER && role !== APP_CONSTANTS.ROLE_ADMIN) {
        return NextResponse.redirect(new URL(APP_CONSTANTS.UNAUTHORIZED_PATH, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/wallet/:path*",
        "/products/create/:path*",
        "/orders/:path*",
        "/users/:path*",
        "/disputes/:path*",
    ],
};
