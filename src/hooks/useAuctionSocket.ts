"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { APP_CONSTANTS, SOCKET_CONSTANTS } from "@/constants/app.constants";

type BidUpdatePayload = {
    productId: string;
    newPrice?: number;
    effectiveEndTime?: string;
};

type UseAuctionSocketOptions = {
    productId: string;
    onBidUpdate?: (payload: BidUpdatePayload) => void;
};

export function useAuctionSocket({ productId, onBidUpdate }: UseAuctionSocketOptions) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const baseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL?.replace(APP_CONSTANTS.API_PREFIX, "") ??
            APP_CONSTANTS.DEFAULT_BE_ORIGIN;
        const socket = io(`${baseUrl}${APP_CONSTANTS.AUCTION_NAMESPACE}`, {
            transports: [...SOCKET_CONSTANTS.TRANSPORTS],
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit(SOCKET_CONSTANTS.JOIN_EVENT, { productId });
        });

        socket.on(SOCKET_CONSTANTS.BID_UPDATE_EVENT, (payload: BidUpdatePayload) => {
            onBidUpdate?.(payload);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [productId, onBidUpdate]);

    return socketRef;
}
