"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProductDetail, updateProduct, type UpdateProductPayload } from "@/lib/api/products.api";
import { listCategories } from "@/lib/api/categories.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const productSchema = z.object({
    title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự"),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
    startPrice: z.coerce.number().min(1, "Start price phải lớn hơn 0"),
    reservePrice: z.coerce.number().min(0, "Reserve price không được âm").optional(),
    bidIncrement: z.coerce.number().min(1, "Bid increment phải lớn hơn 0"),
    startTime: z.string().optional(),
    endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
    antiSnipingTrigger: z.coerce.number().min(30, "Trigger tối thiểu 30s").optional(),
    antiSnipingExtend: z.coerce.number().min(30, "Extend tối thiểu 30s").optional(),
    description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),
});

type ProductFormValues = z.infer<typeof productSchema>;

function toDateTimeLocalValue(iso: string) {
    const date = new Date(iso);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

type Notification = { type: "success" | "error"; text: string };

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const [notification, setNotification] = useState<Notification | null>(null);

    const categoriesQuery = useQuery({
        queryKey: QUERY_KEYS.categories.list,
        queryFn: () => listCategories(),
        staleTime: 60_000,
    });

    const productQuery = useQuery({
        queryKey: QUERY_KEYS.products.detail(productId),
        queryFn: () => getProductDetail(productId),
        enabled: !!productId,
    });

    const form = useForm<ProductFormValues>();

    // Pre-fill form when product data loads
    const product = productQuery.data?.product;
    const isFormReady = !!product;

    if (product && !form.formState.isDirty && form.getValues("title") === "") {
        form.reset({
            title: product.title,
            categoryId: product.categoryId,
            startPrice: Number(product.startPrice),
            reservePrice: product.reservePrice ? Number(product.reservePrice) : 0,
            bidIncrement: Number(product.bidIncrement),
            startTime: toDateTimeLocalValue(product.startTime),
            endTime: toDateTimeLocalValue(product.endTime),
            antiSnipingTrigger: product.antiSnipingTrigger,
            antiSnipingExtend: product.antiSnipingExtend,
            description: product.description,
        });
    }

    const updateMutation = useMutation({
        mutationFn: (payload: UpdateProductPayload) => updateProduct(productId, payload),
        onSuccess: (data) => {
            setNotification({ type: "success", text: `✅ ${data.message}` });
            setTimeout(() => router.push("/products"), 1500);
        },
        onError: (error: { message?: string }) => {
            setNotification({ type: "error", text: `❌ ${error?.message ?? "Cập nhật thất bại"}` });
            setTimeout(() => setNotification(null), 4000);
        },
    });

    const categories = categoriesQuery.data?.categories ?? [];

    const onSubmit = (data: ProductFormValues) => {
        form.clearErrors();
        const parsed = productSchema.safeParse(data);

        if (!parsed.success) {
            parsed.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof ProductFormValues | undefined;
                if (!field) return;
                form.setError(field, { type: "manual", message: issue.message });
            });
            return;
        }

        const payload: UpdateProductPayload = {
            title: parsed.data.title,
            categoryId: parsed.data.categoryId,
            description: parsed.data.description,
            startPrice: parsed.data.startPrice,
            bidIncrement: parsed.data.bidIncrement,
            endTime: new Date(parsed.data.endTime).toISOString(),
        };

        if (parsed.data.startTime) {
            payload.startTime = new Date(parsed.data.startTime).toISOString();
        }
        if (parsed.data.reservePrice && parsed.data.reservePrice > 0) {
            payload.reservePrice = parsed.data.reservePrice;
        }
        if (parsed.data.antiSnipingTrigger) {
            payload.antiSnipingTrigger = parsed.data.antiSnipingTrigger;
        }
        if (parsed.data.antiSnipingExtend) {
            payload.antiSnipingExtend = parsed.data.antiSnipingExtend;
        }

        updateMutation.mutate(payload);
    };

    const isActive = product?.status === "ACTIVE";

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Chỉnh sửa sản phẩm</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Cập nhật thông tin sản phẩm. Không thể chỉnh sửa sản phẩm đang ACTIVE.
                </p>
            </header>

            {/* ─── Notification ─ */}
            {notification && (
                <div
                    className={
                        "rounded-lg border px-4 py-3 text-sm " +
                        (notification.type === "success"
                            ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                            : "border-destructive/40 bg-destructive/10 text-destructive")
                    }
                >
                    {notification.text}
                </div>
            )}

            {isActive && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                    ⚠️ Sản phẩm đang trong trạng thái ACTIVE — không thể chỉnh sửa.
                </div>
            )}

            {productQuery.isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : productQuery.isError ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Không thể tải thông tin sản phẩm. Vui lòng thử lại.
                </p>
            ) : isFormReady ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin sản phẩm</CardTitle>
                        <CardDescription>
                            ID: {productId} • Status: {product?.status}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Tiêu đề</label>
                                    <Input {...form.register("title")} disabled={isActive} />
                                    {form.formState.errors.title && (
                                        <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Danh mục</label>
                                    <select
                                        {...form.register("categoryId")}
                                        disabled={isActive}
                                        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                                    >
                                        <option value="">— Chọn danh mục —</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.formState.errors.categoryId && (
                                        <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Giá khởi điểm (VND)</label>
                                    <Input type="number" min="0" {...form.register("startPrice")} disabled={isActive} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Reserve price (VND)</label>
                                    <Input type="number" min="0" {...form.register("reservePrice")} disabled={isActive} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Bước giá (VND)</label>
                                    <Input type="number" min="1" {...form.register("bidIncrement")} disabled={isActive} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Thời gian bắt đầu</label>
                                    <Input type="datetime-local" {...form.register("startTime")} disabled={isActive} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Thời gian kết thúc</label>
                                    <Input type="datetime-local" {...form.register("endTime")} disabled={isActive} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Anti-sniping trigger (giây)</label>
                                    <Input type="number" min="30" {...form.register("antiSnipingTrigger")} disabled={isActive} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Anti-sniping extend (giây)</label>
                                    <Input type="number" min="30" {...form.register("antiSnipingExtend")} disabled={isActive} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Mô tả sản phẩm</label>
                                <textarea
                                    className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                                    {...form.register("description")}
                                    disabled={isActive}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="flex-1"
                                    disabled={updateMutation.isPending || isActive}
                                >
                                    {updateMutation.isPending ? "Đang cập nhật..." : "💾 Lưu thay đổi"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => router.push("/products")}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : null}
        </section>
    );
}
