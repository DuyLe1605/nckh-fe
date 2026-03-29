"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/lib/api/reviews.api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star } from "lucide-react";

type ReviewDialogProps = {
    orderId: string;
    sellerName: string;
};

export function ReviewDialog({ orderId, sellerName }: ReviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => createReview({ orderId, rating, comment }),
        onSuccess: () => {
            toast.success("Cảm ơn bạn đã đánh giá!");
            setOpen(false);
            setRating(5);
            setComment("");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Không thể gửi đánh giá hoặc bạn đã đánh giá đơn hàng này rồi");
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                    ⭐ Đánh giá Người bán
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Đánh giá & Nhận xét</DialogTitle>
                    <DialogDescription>
                        Nhận xét về trải nghiệm mua hàng từ <span className="font-semibold text-foreground">{sellerName}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>Số sao (1-5)</Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`h-8 w-8 ${
                                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                                        } transition-colors hover:fill-yellow-300 hover:text-yellow-300`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="comment">Nhận xét chi tiết (tuỳ chọn)</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Sản phẩm rất tốt, đóng gói cẩn thận..."
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
                        Huỷ
                    </Button>
                    <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                        Gửi đánh giá
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
