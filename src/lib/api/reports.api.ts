import { apiClient } from "@/lib/api/axios-client";

export type ReportStatus = "PENDING" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";

export type ReportItem = {
    id: string;
    reporterId: string;
    reportedUserId: string;
    productId?: string | null;
    reason: string;
    status: ReportStatus;
    createdAt: string;
    updatedAt: string;
    reporter?: {
        id: string;
        fullName: string;
        email: string;
    };
    reportedUser?: {
        id: string;
        fullName: string;
        email: string;
    };
    product?: {
        id: string;
        title: string;
    } | null;
};

export type CreateReportPayload = {
    reportedUserId: string;
    productId?: string;
    reason: string;
};

export type UpdateReportStatusPayload = {
    status: ReportStatus;
};

export type ListReportsResponse = {
    message: string;
    reports: ReportItem[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

export type MutateReportResponse = {
    message: string;
    report: ReportItem;
};

export async function createReport(payload: CreateReportPayload) {
    const response = await apiClient.post<MutateReportResponse>("/reports", payload);
    return response.data;
}

export async function listReports(params: { page?: number; pageSize?: number; status?: ReportStatus } = {}) {
    const response = await apiClient.get<ListReportsResponse>("/reports", { params });
    return response.data;
}

export async function updateReportStatus(id: string, payload: UpdateReportStatusPayload) {
    const response = await apiClient.put<MutateReportResponse>(`/reports/${id}/status`, payload);
    return response.data;
}
