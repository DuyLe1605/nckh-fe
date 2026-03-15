export const APP_CONSTANTS = {
    DEFAULT_BE_ORIGIN: "http://localhost:4000",
    API_PREFIX: "/api/v1",
    API_TIMEOUT_MS: 15_000,
    AUCTION_NAMESPACE: "/auctions",
    LOGIN_PATH: "/login",
    REGISTER_PATH: "/register",
    UNAUTHORIZED_PATH: "/unauthorized",
    COOKIE_ROLE_KEY: "role",
    COOKIE_MAX_AGE_SECONDS: 60 * 60 * 24,
    AUTH_LOGIN_ENDPOINT: "/auth/login",
    AUTH_REGISTER_ENDPOINT: "/auth/register",
    APP_TITLE: "NCKH Auction",
    APP_SUBTITLE: "Realtime Auction Platform",
    ROLE_BIDDER: "BIDDER",
    ROLE_ADMIN: "ADMIN",
    ROLE_SELLER: "SELLER",
} as const;

export const ROUTE_CONSTANTS = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    AUCTIONS_PREFIX: "/auctions",
    DASHBOARD: "/dashboard",
    WALLET: "/wallet",
    PRODUCTS_CREATE: "/products/create",
    ORDERS: "/orders",
    USERS: "/users",
    DISPUTES: "/disputes",
} as const;

export const SOCKET_CONSTANTS = {
    JOIN_EVENT: "auction:join",
    BID_UPDATE_EVENT: "auction:bid:update",
    TRANSPORTS: ["websocket"] as const,
} as const;
