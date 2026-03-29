import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listReports, updateReportStatus, type ReportStatus, type UpdateReportStatusPayload } from "@/lib/api/reports.api";
import { toast } from "sonner";

export function useReportsQuery(params: { page?: number; pageSize?: number; status?: ReportStatus }) {
    return useQuery({
        queryKey: ["admin", "reports", params],
        queryFn: () => listReports(params),
    });
}

export function useUpdateReportStatusMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: ReportStatus }) =>
            updateReportStatus(id, { status }),
        onSuccess: (data) => {
            toast.success("✅ Cập nhật trạng thái thành công");
            queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
        },
        onError: (error: any) => {
            toast.error(`❌ ${error?.message ?? "Cập nhật thất bại"}`);
        },
    });
}
