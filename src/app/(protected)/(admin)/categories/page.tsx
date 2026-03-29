"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    type CategoryItem,
} from "@/lib/api/categories.api";
import { QUERY_KEYS } from "@/lib/query/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const categorySchema = z.object({
    name: z.string().min(2, "Tên danh mục ít nhất 2 ký tự"),
    description: z.string().optional(),
    parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type Notification = { type: "success" | "error"; text: string };

export default function AdminCategoriesPage() {
    const queryClient = useQueryClient();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

    const categoriesQuery = useQuery({
        queryKey: QUERY_KEYS.categories.list,
        queryFn: () => listCategories(),
    });

    const form = useForm<CategoryFormValues>({
        defaultValues: {
            name: "",
            description: "",
            parentId: "",
        },
    });

    const handleEdit = (category: CategoryItem) => {
        setEditingCategory(category);
        form.reset({
            name: category.name,
            description: category.description || "",
            parentId: category.parentId || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        form.reset({ name: "", description: "", parentId: "" });
    };

    const createMutation = useMutation({
        mutationFn: (payload: CategoryFormValues) => createCategory(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.list });
            setNotification({ type: "success", text: `✅ Đã tạo danh mục: ${data.category.name}` });
            handleCancelEdit();
            setTimeout(() => setNotification(null), 3000);
        },
        onError: (error: any) => {
            setNotification({ type: "error", text: `❌ Lỗi: ${error.message}` });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: CategoryFormValues }) => updateCategory(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.list });
            setNotification({ type: "success", text: `✅ Đã cập nhật danh mục: ${data.category.name}` });
            handleCancelEdit();
            setTimeout(() => setNotification(null), 3000);
        },
        onError: (error: any) => {
            setNotification({ type: "error", text: `❌ Lỗi: ${error.message}` });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.list });
            setNotification({ type: "success", text: `✅ Đã xóa danh mục` });
            setTimeout(() => setNotification(null), 3000);
        },
        onError: (error: any) => {
            setNotification({ type: "error", text: `❌ Không thể xóa danh mục (có thể do đang có sản phẩm)` });
        },
    });

    const onSubmit = (data: CategoryFormValues) => {
        form.clearErrors();
        const parsed = categorySchema.safeParse(data);
        if (!parsed.success) {
            parsed.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof CategoryFormValues | undefined;
                if (!field) return;
                form.setError(field, { type: "manual", message: issue.message });
            });
            return;
        }

        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, payload: parsed.data });
        } else {
            createMutation.mutate(parsed.data);
        }
    };

    const categories = categoriesQuery.data?.categories || [];

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Quản lý chuyên mục (Categories)</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Thêm, sửa, xóa các danh mục sản phẩm của hệ thống đấu giá.
                </p>
            </header>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>{editingCategory ? "Sửa danh mục" : "Thêm mới danh mục"}</CardTitle>
                        <CardDescription>
                            {editingCategory ? `Đang sửa: ${editingCategory.name}` : "Tạo mới một danh mục."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Tên danh mục</label>
                                <Input {...form.register("name")} placeholder="VD: Điện thoại di động" />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Mô tả</label>
                                <textarea
                                    className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                                    {...form.register("description")}
                                    placeholder="Tùy chọn..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Danh mục cha</label>
                                <select
                                    {...form.register("parentId")}
                                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                                >
                                    <option value="">— Cấp 1 (Root) —</option>
                                    {categories
                                        .filter((c) => c.id !== editingCategory?.id)
                                        .map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingCategory ? "💾 Cập nhật" : "➕ Thêm mới"}
                                </Button>
                                {editingCategory && (
                                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                        Hủy
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Danh sách danh mục</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categoriesQuery.isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Chưa có danh mục nào.</p>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Tên danh mục</th>
                                            <th className="px-4 py-3 font-medium">Id</th>
                                            <th className="px-4 py-3 font-medium">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {categories.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium">
                                                    {cat.name}
                                                    {cat.description && (
                                                        <span className="block text-xs text-muted-foreground mt-0.5">
                                                            {cat.description}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                                                    {cat.id.split("-")[0]}...
                                                </td>
                                                <td className="px-4 py-3 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(cat)}
                                                        className="text-xs h-8"
                                                    >
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            if (window.confirm(`Xóa danh mục "${cat.name}"?`)) {
                                                                deleteMutation.mutate(cat.id);
                                                            }
                                                        }}
                                                        disabled={deleteMutation.isPending}
                                                        className="text-xs h-8"
                                                    >
                                                        Xóa
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
