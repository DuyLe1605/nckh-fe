export const APP_CONSTANTS = {
    DEFAULT_BE_ORIGIN: "http://localhost:4000",
    API_PREFIX: "/api/v1",
    AUCTION_NAMESPACE: "/auctions",
    LOGIN_PATH: "/login",
    UNAUTHORIZED_PATH: "/unauthorized",
    COOKIE_ROLE_KEY: "role",
    ROLE_ADMIN: "ADMIN",
    ROLE_SELLER: "SELLER",
} as const;

export const ROUTE_CONSTANTS = {
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
