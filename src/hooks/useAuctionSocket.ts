"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { APP_CONSTANTS, SOCKET_CONSTANTS } from "@/constants/app.constants";

type BidUpdatePayload = {
    productId: string;
    newPrice?: number;
    effectiveEndTime?: string;
    bidderId?: string;
    prevWinnerBidderId?: string | null;
    antiSnipingExtended?: boolean;
};

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

type UseAuctionSocketOptions = {
    productId: string;
    onBidUpdate?: (payload: BidUpdatePayload) => void;
    /** Fallback polling interval in ms when socket is disconnected. Default: 5000ms */
    pollingInterval?: number;
    /** Polling fetch function — should return latest auction data */
    pollFn?: () => Promise<void>;
};

type UseAuctionSocketReturn = {
    socketRef: React.RefObject<Socket | null>;
    status: ConnectionStatus;
    reconnectAttempts: number;
};

const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_BASE_MS = 1000;
const RECONNECT_DELAY_MAX_MS = 30000;

export function useAuctionSocket({
    productId,
    onBidUpdate,
    pollingInterval = 5000,
    pollFn,
}: UseAuctionSocketOptions): UseAuctionSocketReturn {
    const socketRef = useRef<Socket | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>("connecting");
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Stable callback ref to avoid re-creating socket on every render
    const onBidUpdateRef = useRef(onBidUpdate);
    onBidUpdateRef.current = onBidUpdate;

    const pollFnRef = useRef(pollFn);
    pollFnRef.current = pollFn;

    // Start/stop fallback polling
    const startPolling = useCallback(() => {
        if (pollingTimerRef.current) return; // Already polling
        if (!pollFnRef.current) return; // No poll function provided

        pollingTimerRef.current = setInterval(() => {
            pollFnRef.current?.().catch(() => {
                // Polling errors are non-fatal
            });
        }, pollingInterval);
    }, [pollingInterval]);

    const stopPolling = useCallback(() => {
        if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        const baseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL?.replace(APP_CONSTANTS.API_PREFIX, "") ??
            APP_CONSTANTS.DEFAULT_BE_ORIGIN;

        const socket = io(`${baseUrl}${APP_CONSTANTS.AUCTION_NAMESPACE}`, {
            transports: [...SOCKET_CONSTANTS.TRANSPORTS],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: RECONNECT_DELAY_BASE_MS,
            reconnectionDelayMax: RECONNECT_DELAY_MAX_MS,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setStatus("connected");
            setReconnectAttempts(0);
            stopPolling(); // Switch back to WebSocket
            socket.emit(SOCKET_CONSTANTS.JOIN_EVENT, { productId });
        });

        socket.on(SOCKET_CONSTANTS.BID_UPDATE_EVENT, (payload: BidUpdatePayload) => {
            onBidUpdateRef.current?.(payload);
        });

        socket.on("disconnect", (reason) => {
            setStatus("disconnected");
            // Start fallback polling when socket disconnects
            startPolling();

            // If server closed the connection, try to reconnect manually
            if (reason === "io server disconnect") {
                socket.connect();
            }
        });

        socket.on("reconnect_attempt", (attempt: number) => {
            setStatus("reconnecting");
            setReconnectAttempts(attempt);
        });

        socket.on("reconnect", () => {
            setStatus("connected");
            setReconnectAttempts(0);
            stopPolling();
            socket.emit(SOCKET_CONSTANTS.JOIN_EVENT, { productId });
        });

        socket.on("reconnect_failed", () => {
            setStatus("disconnected");
            // Keep polling as permanent fallback
            startPolling();
        });

        socket.on("connect_error", () => {
            setStatus("disconnected");
            startPolling();
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            stopPolling();
        };
    }, [productId, startPolling, stopPolling]);

    return { socketRef, status, reconnectAttempts };
}
