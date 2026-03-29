import { apiClient } from "@/lib/api/axios-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SELLER" | "BIDDER";
export type UserStatus = "UNVERIFIED" | "ACTIVE" | "SUSPENDED" | "BANNED";

export type AdminUserItem = {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    wallet?: {
        availableBalance: string | number;
        heldBalance: string | number;
    } | null;
};

export type ListUsersParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
};

type ListUsersResponse = {
    message: string;
    users: AdminUserItem[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

type UpdateUserStatusResponse = {
    message: string;
    user: AdminUserItem;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listUsers(params: ListUsersParams = {}) {
    const response = await apiClient.get<ListUsersResponse>("/admin/users", {
        params,
    });
    return response.data;
}

export async function updateUserStatus(id: string, status: UserStatus) {
    const response = await apiClient.patch<UpdateUserStatusResponse>(
        `/admin/users/${id}/status`,
        { status },
    );
    return response.data;
}

export type DashboardRecentOrder = {
    id: string;
    finalPrice: number | string;
    platformFee: number | string;
    status: string;
    createdAt: string;
    buyer: { id: string; fullName: string } | null;
    product: { id: string; title: string };
};

export type DashboardAnalyticsResponse = {
    message: string;
    data: {
        totalUsers: number;
        activeAuctions: number;
        totalBids: number;
        totalRevenue: number;
        recentOrders: DashboardRecentOrder[];
        monthlyRevenue: { month: string; revenue: number; finalPrice: number }[];
    };
};

export async function getAdminDashboardAnalytics() {
    const response = await apiClient.get<DashboardAnalyticsResponse>(
        "/admin/analytics/dashboard",
    );
    return response.data;
}

export type AuthFunnelCampaignStats = {
    utmCampaign: string;
    verifyClicks: number;
    verifySuccess: number;
    resetClicks: number;
    resetSuccess: number;
    verifyRate: number;
    resetRate: number;
};

export type AuthFunnelAnalyticsResponse = {
    message: string;
    data: {
        range: {
            days: number;
            from: string;
            to: string;
        };
        totals: {
            verifyClicksFromEmail: number;
            verifySuccessFromEmail: number;
            resetClicksFromEmail: number;
            resetSuccessFromEmail: number;
        };
        ratios: {
            verifyRate: number;
            resetRate: number;
            overallRate: number;
        };
        campaigns: AuthFunnelCampaignStats[];
    };
};

export async function getAdminAuthFunnelAnalytics(days = 30) {
    const response = await apiClient.get<AuthFunnelAnalyticsResponse>(
        "/admin/analytics/auth-funnel",
        {
            params: { days },
        },
    );

    return response.data;
}
