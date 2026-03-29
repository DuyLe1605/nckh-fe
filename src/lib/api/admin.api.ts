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
