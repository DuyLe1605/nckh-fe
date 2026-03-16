import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { sellerOrdersMock } from "@/lib/mock/sprint5-workflows.mock";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function SellerOrdersPage() {
    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Seller Orders</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Theo dõi đơn hàng sau khi kết thúc đấu giá: thanh toán escrow, vận chuyển, hoàn tất, tranh chấp.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Total orders</CardDescription>
                        <CardTitle>{sellerOrdersMock.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Payment secured</CardDescription>
                        <CardTitle>
                            {sellerOrdersMock.filter((item) => item.status === "PAYMENT_SECURED").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Disputed</CardDescription>
                        <CardTitle>{sellerOrdersMock.filter((item) => item.status === "DISPUTED").length}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order queue</CardTitle>
                    <CardDescription>Dữ liệu mẫu đa trạng thái để test UX Sprint 5.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {sellerOrdersMock.map((order) => (
                        <div key={order.id} className="rounded-lg border border-border/70 bg-background/70 p-4 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-medium">{order.productTitle}</p>
                                <StatusBadge status={order.status} />
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
                                <p>Buyer: {order.buyerName}</p>
                                <p>Final price: {formatCurrency(order.finalPrice)}</p>
                                <p>Created: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </section>
    );
}
