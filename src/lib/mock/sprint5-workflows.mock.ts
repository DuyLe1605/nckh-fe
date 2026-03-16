export type BidderAuctionState = "WINNING" | "OUTBID" | "WATCHING";

export type BidderAuctionItem = {
    id: string;
    title: string;
    state: BidderAuctionState;
    myBid: number;
    currentPrice: number;
    effectiveEndTime: string;
    antiSnipingExtend: number;
    antiSnipingExtensions: number;
    category: string;
};

export type SellerDraftItem = {
    id: string;
    title: string;
    category: string;
    status: "DRAFT" | "SCHEDULED" | "ACTIVE";
    startPrice: number;
    reservePrice: number;
    bidIncrement: number;
    endTime: string;
    antiSnipingTrigger: number;
    antiSnipingExtend: number;
};

export type SellerOrderItem = {
    id: string;
    productTitle: string;
    buyerName: string;
    finalPrice: number;
    status: "PENDING_PAYMENT" | "PAYMENT_SECURED" | "SHIPPED" | "COMPLETED" | "DISPUTED";
    createdAt: string;
};

const now = Date.now();

export const bidderAuctionsMock: BidderAuctionItem[] = [
    {
        id: "auc-iphone-14-pro",
        title: "iPhone 14 Pro 128GB (99% pin 89%)",
        state: "OUTBID",
        myBid: 14600000,
        currentPrice: 14800000,
        effectiveEndTime: new Date(now + 19 * 60 * 1000).toISOString(),
        antiSnipingExtend: 120,
        antiSnipingExtensions: 1,
        category: "Electronics",
    },
    {
        id: "auc-mtg-lotus-proxy",
        title: "Black Lotus Artist Proof (Collectibles)",
        state: "WATCHING",
        myBid: 0,
        currentPrice: 5200000,
        effectiveEndTime: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
        antiSnipingExtend: 180,
        antiSnipingExtensions: 0,
        category: "Collectibles",
    },
    {
        id: "auc-mech-keyboard-limited",
        title: "Custom Mechanical Keyboard GMK Set",
        state: "WINNING",
        myBid: 3900000,
        currentPrice: 3900000,
        effectiveEndTime: new Date(now + 51 * 60 * 1000).toISOString(),
        antiSnipingExtend: 120,
        antiSnipingExtensions: 2,
        category: "Electronics",
    },
    {
        id: "auc-vintage-bag",
        title: "Vintage Leather Messenger Bag",
        state: "OUTBID",
        myBid: 1650000,
        currentPrice: 1700000,
        effectiveEndTime: new Date(now + 37 * 60 * 1000).toISOString(),
        antiSnipingExtend: 90,
        antiSnipingExtensions: 1,
        category: "Fashion",
    },
    {
        id: "auc-headphone-hi-fi",
        title: "Hi-Fi Open Back Headphone",
        state: "WINNING",
        myBid: 6100000,
        currentPrice: 6100000,
        effectiveEndTime: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
        antiSnipingExtend: 120,
        antiSnipingExtensions: 0,
        category: "Electronics",
    },
];

export const sellerDraftsMock: SellerDraftItem[] = [
    {
        id: "draft-cam-sony-a7",
        title: "Sony A7 III body + 2 pin",
        category: "Electronics",
        status: "DRAFT",
        startPrice: 18500000,
        reservePrice: 21000000,
        bidIncrement: 250000,
        endTime: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
        antiSnipingTrigger: 300,
        antiSnipingExtend: 120,
    },
    {
        id: "draft-nike-rare",
        title: "Nike SB Dunk Low Rare Size 42",
        category: "Fashion",
        status: "SCHEDULED",
        startPrice: 4500000,
        reservePrice: 6000000,
        bidIncrement: 100000,
        endTime: new Date(now + 72 * 60 * 60 * 1000).toISOString(),
        antiSnipingTrigger: 240,
        antiSnipingExtend: 90,
    },
    {
        id: "draft-gameboy-collection",
        title: "Nintendo Game Boy Color Collection",
        category: "Collectibles",
        status: "ACTIVE",
        startPrice: 3200000,
        reservePrice: 4300000,
        bidIncrement: 50000,
        endTime: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
        antiSnipingTrigger: 300,
        antiSnipingExtend: 180,
    },
];

export const sellerOrdersMock: SellerOrderItem[] = [
    {
        id: "ord-101",
        productTitle: "MacBook Pro M2 16GB/512GB",
        buyerName: "Tran Gia Bao",
        finalPrice: 31900000,
        status: "PAYMENT_SECURED",
        createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "ord-102",
        productTitle: "Leica Q2 Fullbox",
        buyerName: "Pham Minh Chau",
        finalPrice: 58700000,
        status: "SHIPPED",
        createdAt: new Date(now - 28 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "ord-103",
        productTitle: "Pokemon Card Limited Edition",
        buyerName: "Nguyen Le Truc",
        finalPrice: 2650000,
        status: "COMPLETED",
        createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "ord-104",
        productTitle: "Rolex Vintage Box + Papers",
        buyerName: "Do Quang Minh",
        finalPrice: 74200000,
        status: "DISPUTED",
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
];
