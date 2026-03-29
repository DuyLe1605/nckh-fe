"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createProduct, uploadProductImages, type CreateProductPayload } from "@/lib/api/products.api";
import { listCategories } from "@/lib/api/categories.api";
import { useCategoriesQuery } from "@/lib/query/hooks/use-categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Rocket } from "lucide-react";

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

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function calculateRemain(endTime: string) {
    const diff = new Date(endTime).getTime() - Date.now();
    if (Number.isNaN(diff) || diff <= 0) return "Đã kết thúc";

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainMinutes = minutes % 60;
    return `${hours}h ${remainMinutes}m`;
}

type Notification = { type: "success" | "error"; text: React.ReactNode };

export default function CreateProductPage() {
    const router = useRouter();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const categoriesQuery = useCategoriesQuery();

    const form = useForm<ProductFormValues>({
        defaultValues: {
            title: "",
            categoryId: "",
            startPrice: 0,
            reservePrice: 0,
            bidIncrement: 100000,
            startTime: "",
            endTime: "",
            antiSnipingTrigger: 300,
            antiSnipingExtend: 120,
            description: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: async (payload: CreateProductPayload) => {
            const result = await createProduct(payload);
            if (images.length > 0) {
                setIsUploading(true);
                try {
                    await uploadProductImages(result.product.id, images);
                } finally {
                    setIsUploading(false);
                }
            }
            return result;
        },
        onSuccess: (data) => {
            setNotification({ type: "success", text: <><CheckCircle className="mr-1 inline-block h-4 w-4" /> Sản phẩm được tạo thành công!</> });
            setTimeout(() => router.push("/products"), 1500);
        },
        onError: (error: { message?: string }) => {
            setNotification({ type: "error", text: <><XCircle className="mr-1 inline-block h-4 w-4" /> {error?.message ?? "Tạo sản phẩm thất bại"}</> });
            setIsUploading(false);
            setTimeout(() => setNotification(null), 4000);
        },
    });

    const values = form.watch();
    const categories = categoriesQuery.data?.categories ?? [];

    const onSubmit = (data: ProductFormValues) => {
        form.clearErrors();
        const parsed = productSchema.safeParse(data);

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

        const payload: CreateProductPayload = {
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

        createMutation.mutate(payload);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 5) {
            setNotification({ type: "error", text: <><XCircle className="mr-1 inline-block h-4 w-4" /> Tối đa 5 ảnh</> });
            return;
        }

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (typeof ev.target?.result === "string") {
                    setImages((prev) => [...prev, ev.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Tạo sản phẩm đấu giá</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Điền thông tin sản phẩm, cấu hình anti-sniping và đặt thời gian đấu giá.
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

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin sản phẩm</CardTitle>
                        <CardDescription>
                            Sản phẩm sẽ được tạo với trạng thái DRAFT hoặc SCHEDULED.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Tiêu đề</label>
                                    <Input {...form.register("title")} placeholder="VD: iPhone 14 Pro 128GB" />
                                    {form.formState.errors.title && (
                                        <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Danh mục</label>
                                    <select
                                        {...form.register("categoryId")}
                                        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
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
                                    {categories.length === 0 && !categoriesQuery.isLoading && (
                                        <p className="text-xs text-muted-foreground">Chưa có danh mục nào. Liên hệ admin.</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Giá khởi điểm (VND)</label>
                                    <Input type="number" min="0" {...form.register("startPrice")} />
                                    {form.formState.errors.startPrice && (
                                        <p className="text-xs text-destructive">{form.formState.errors.startPrice.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Reserve price (VND)</label>
                                    <Input type="number" min="0" {...form.register("reservePrice")} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Bước giá (VND)</label>
                                    <Input type="number" min="1" {...form.register("bidIncrement")} />
                                    {form.formState.errors.bidIncrement && (
                                        <p className="text-xs text-destructive">{form.formState.errors.bidIncrement.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Thời gian bắt đầu (tùy chọn)</label>
                                    <Input type="datetime-local" {...form.register("startTime")} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Thời gian kết thúc</label>
                                    <Input type="datetime-local" {...form.register("endTime")} />
                                    {form.formState.errors.endTime && (
                                        <p className="text-xs text-destructive">{form.formState.errors.endTime.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Anti-sniping trigger (giây)</label>
                                    <Input type="number" min="30" {...form.register("antiSnipingTrigger")} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Anti-sniping extend (giây)</label>
                                    <Input type="number" min="30" {...form.register("antiSnipingExtend")} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Mô tả sản phẩm</label>
                                <textarea
                                    className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                                    {...form.register("description")}
                                    placeholder="Mô tả chi tiết về sản phẩm, nguồn gốc, tình trạng..."
                                />
                                {form.formState.errors.description && (
                                    <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hình ảnh sản phẩm (Tối đa 5 ảnh)</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    disabled={images.length >= 5}
                                />
                                {images.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={createMutation.isPending || isUploading}
                            >
                                {createMutation.isPending || isUploading
                                    ? isUploading
                                        ? "Đang tải ảnh lên..."
                                        : "Đang tạo cơ sở..."
                                    : <><Rocket className="mr-1.5 inline-block h-4 w-4" /> Tạo sản phẩm</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ─── Live Preview ─ */}
                <Card>
                    <CardHeader>
                        <CardTitle>Xem trước</CardTitle>
                        <CardDescription>
                            Preview nhanh thông tin sản phẩm trong khi chỉnh sửa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="space-y-3">
                            <p className="font-medium">{values.title || "Chưa có tiêu đề"}</p>
                            <p className="text-xs text-muted-foreground">
                                {categories.find((c) => c.id === values.categoryId)?.name || "Chưa chọn danh mục"}
                            </p>
                            {images.length > 0 && (
                                <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={images[0]} alt="Main Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">Start: {formatCurrency(values.startPrice || 0)}</Badge>
                            {values.reservePrice && values.reservePrice > 0 && (
                                <Badge variant="secondary">Reserve: {formatCurrency(values.reservePrice)}</Badge>
                            )}
                        </div>

                        <div className="space-y-1 rounded-lg border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
                            {values.endTime && (
                                <p>
                                    Remaining:{" "}
                                    <span className="font-medium text-foreground">
                                        {calculateRemain(values.endTime)}
                                    </span>
                                </p>
                            )}
                            <p>
                                Anti-sniping: nếu còn ≤ <b>{values.antiSnipingTrigger || 0}s</b> và có bid mới,
                                sẽ gia hạn thêm <b>{values.antiSnipingExtend || 0}s</b>.
                            </p>
                            <p>Bước giá tối thiểu: {formatCurrency(values.bidIncrement || 0)}</p>
                        </div>

                        {values.description && (
                            <div className="rounded-lg border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
                                <p className="mb-1 font-medium text-foreground">Mô tả:</p>
                                <p className="whitespace-pre-wrap">{values.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
