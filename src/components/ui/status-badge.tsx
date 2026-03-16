import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_TONE_CLASSNAME: Record<StatusTone, string> = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    danger: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    neutral: "border-border bg-muted/40 text-foreground",
};

function resolveTone(status: string): StatusTone {
    const normalized = status.toUpperCase();

    if (
        ["WINNING", "PAYMENT_SECURED", "COMPLETED", "ACTIVE", "SOLD", "BIDDER", "SELLER", "ADMIN"].includes(normalized)
    ) {
        return "success";
    }

    if (["OUTBID", "PENDING_PAYMENT", "SCHEDULED", "WATCHING", "SHIPPED"].includes(normalized)) {
        return "warning";
    }

    if (["DISPUTED", "BANNED", "SUSPENDED", "UNSOLD", "RETRACTED"].includes(normalized)) {
        return "danger";
    }

    if (["DRAFT", "ENDED"].includes(normalized)) {
        return "info";
    }

    return "neutral";
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
    const tone = resolveTone(status);

    return <Badge className={cn("border", STATUS_TONE_CLASSNAME[tone], className)}>{status}</Badge>;
}
