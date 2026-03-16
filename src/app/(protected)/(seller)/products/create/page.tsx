"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { sellerDraftsMock } from "@/lib/mock/sprint5-workflows.mock";

const productSchema = z.object({
    title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự"),
    category: z.string().min(2, "Vui lòng nhập danh mục"),
    startPrice: z.coerce.number().min(1, "Start price phải lớn hơn 0"),
    reservePrice: z.coerce.number().min(1, "Reserve price phải lớn hơn 0"),
    bidIncrement: z.coerce.number().min(1, "Bid increment phải lớn hơn 0"),
    endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
    antiSnipingTrigger: z.coerce.number().min(30, "Trigger tối thiểu 30s"),
    antiSnipingExtend: z.coerce.number().min(30, "Extend tối thiểu 30s"),
    description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),
});

type ProductFormValues = z.infer<typeof productSchema>;

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function toDateTimeLocalValue(iso: string) {
    const date = new Date(iso);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toFormValues(item: (typeof sellerDraftsMock)[number]): ProductFormValues {
    return {
        title: item.title,
        category: item.category,
        startPrice: item.startPrice,
        reservePrice: item.reservePrice,
        bidIncrement: item.bidIncrement,
        endTime: toDateTimeLocalValue(item.endTime),
        antiSnipingTrigger: item.antiSnipingTrigger,
        antiSnipingExtend: item.antiSnipingExtend,
        description: "Mô tả mẫu Sprint 5: mô tả rõ nguồn gốc, tình trạng và chính sách giao dịch.",
    };
}

function calculateRemain(endTime: string) {
    const diff = new Date(endTime).getTime() - Date.now();
    if (Number.isNaN(diff) || diff <= 0) return "Đã kết thúc";

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainMinutes = minutes % 60;
    return `${hours}h ${remainMinutes}m`;
}

export default function CreateProductPage() {
    const [selectedDraftId, setSelectedDraftId] = useState(sellerDraftsMock[0]?.id ?? "");
    const selectedDraft = useMemo(
        () => sellerDraftsMock.find((item) => item.id === selectedDraftId) ?? sellerDraftsMock[0],
        [selectedDraftId],
    );

    const form = useForm<ProductFormValues>({
        defaultValues: toFormValues(selectedDraft),
    });

    const values = form.watch();

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Seller Product Workflows</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Sprint 5: hỗ trợ tạo/chỉnh sửa sản phẩm, preview countdown theo
                    <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">effective_end_time</code>
                    và mô phỏng anti-sniping extension.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Create / Edit Product</CardTitle>
                        <CardDescription>
                            Biểu mẫu mẫu cho seller để triển khai nhanh trước khi hook API.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nạp dữ liệu mẫu để edit nhanh</label>
                            <div className="flex flex-wrap gap-2">
                                {sellerDraftsMock.map((item) => {
                                    const active = item.id === selectedDraftId;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDraftId(item.id);
                                                form.reset(toFormValues(item));
                                            }}
                                            className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                                                active
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:border-primary/40"
                                            }`}
                                        >
                                            {item.title}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form
                            className="space-y-4"
                            onSubmit={form.handleSubmit((payload) => {
                                form.clearErrors();
                                const parsed = productSchema.safeParse(payload);

                                if (!parsed.success) {
                                    parsed.error.issues.forEach((issue) => {
                                        const field = issue.path[0] as keyof ProductFormValues | undefined;
                                        if (!field) return;
                                        form.setError(field, {
                                            type: "manual",
                                            message: issue.message,
                                        });
                                    });
                                    return;
                                }

                                const normalized = {
                                    ...parsed.data,
                                    effectiveEndTime: new Date(parsed.data.endTime).toISOString(),
                                };
                                console.info("[Sprint5 seller form payload]", normalized);
                            })}
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Tiêu đề</label>
                                    <Input {...form.register("title")} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Danh mục</label>
                                    <Input {...form.register("category")} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Start price</label>
                                    <Input type="number" {...form.register("startPrice")} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Reserve price</label>
                                    <Input type="number" {...form.register("reservePrice")} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Bid increment</label>
                                    <Input type="number" {...form.register("bidIncrement")} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-medium">
                                        Thời gian kết thúc (effective_end_time)
                                    </label>
                                    <Input type="datetime-local" {...form.register("endTime")} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Anti-sniping trigger (s)</label>
                                    <Input type="number" {...form.register("antiSnipingTrigger")} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Anti-sniping extend (s)</label>
                                    <Input type="number" {...form.register("antiSnipingExtend")} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Mô tả</label>
                                    <textarea
                                        className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                                        {...form.register("description")}
                                    />
                                </div>
                            </div>

                            {form.formState.errors.root?.message ? (
                                <p className="text-xs text-destructive">{form.formState.errors.root.message}</p>
                            ) : null}

                            <Button type="submit" size="lg" className="w-full">
                                Lưu biểu mẫu sản phẩm
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                        <CardDescription>
                            Preview nhanh countdown + anti-sniping extension trong lúc chỉnh form.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="font-medium">{values.title || "Untitled product"}</p>
                            <p className="text-xs text-muted-foreground">{values.category || "Uncategorized"}</p>
                            <div className="mt-2">
                                <StatusBadge status={selectedDraft?.status ?? "DRAFT"} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Start: {formatCurrency(values.startPrice || 0)}</Badge>
                            <Badge variant="secondary">Reserve: {formatCurrency(values.reservePrice || 0)}</Badge>
                        </div>

                        <div className="space-y-1 rounded-lg border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
                            <p>
                                Remaining:{" "}
                                <span className="font-medium text-foreground">{calculateRemain(values.endTime)}</span>
                            </p>
                            <p>
                                Anti-sniping policy: nếu còn ≤ <b>{values.antiSnipingTrigger || 0}s</b> và có bid mới,
                                sẽ gia hạn thêm <b>{values.antiSnipingExtend || 0}s</b>.
                            </p>
                            <p>Bid increment tối thiểu: {formatCurrency(values.bidIncrement || 0)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
