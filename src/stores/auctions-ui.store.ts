import { create } from "zustand";

import { APP_CONSTANTS } from "@/constants/app.constants";

export type AuctionFilterStatus = "ACTIVE" | "ENDED" | "SOLD" | "UNSOLD" | "ALL";

type AuctionsUiState = {
    page: number;
    pageSize: number;
    search: string;
    status: AuctionFilterStatus;
    // Sprint 4: live bid price updated via WebSocket
    currentBidPrice: number | null;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    setSearch: (search: string) => void;
    setStatus: (status: AuctionFilterStatus) => void;
    setCurrentBidPrice: (price: number) => void;
    resetFilters: () => void;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;

export const useAuctionsUiStore = create<AuctionsUiState>((set) => ({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    search: "",
    status: "ACTIVE",
    currentBidPrice: null,
    setPage: (page) => set({ page: Math.max(APP_CONSTANTS.PAGINATION_MIN_PAGE, page) }),
    setPageSize: (pageSize) =>
        set({
            pageSize: Math.max(
                APP_CONSTANTS.PAGINATION_MIN_PAGE_SIZE,
                Math.min(APP_CONSTANTS.PAGINATION_MAX_PAGE_SIZE, pageSize),
            ),
            page: DEFAULT_PAGE,
        }),
    setSearch: (search) => set({ search, page: DEFAULT_PAGE }),
    setStatus: (status) => set({ status, page: DEFAULT_PAGE }),
    setCurrentBidPrice: (price) => set({ currentBidPrice: price }),
    resetFilters: () =>
        set({
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE,
            search: "",
            status: "ACTIVE",
            currentBidPrice: null,
        }),
}));
