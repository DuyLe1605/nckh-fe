import { APP_CONSTANTS } from "@/constants/app.constants";

export type AuthChannelEvent =
    | {
          type: "TOKEN_REFRESHED";
          accessToken: string | null;
      }
    | {
          type: "LOGOUT";
      };

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let authChannel: BroadcastChannel | null = null;
const subscribers = new Set<(event: AuthChannelEvent) => void>();

function getChannel() {
    if (typeof window === "undefined") return null;
    if (!authChannel) {
        authChannel = new BroadcastChannel(APP_CONSTANTS.AUTH_BROADCAST_CHANNEL);
        authChannel.onmessage = (event: MessageEvent<AuthChannelEvent>) => {
            const payload = event.data;
            if (!payload) return;

            if (payload.type === "TOKEN_REFRESHED") {
                accessToken = payload.accessToken;
            }

            if (payload.type === "LOGOUT") {
                accessToken = null;
            }

            subscribers.forEach((subscriber) => subscriber(payload));
        };
    }

    return authChannel;
}

function emit(event: AuthChannelEvent) {
    if (typeof window !== "undefined") {
        getChannel()?.postMessage(event);
    }

    subscribers.forEach((subscriber) => subscriber(event));
}

export function subscribeAuthEvents(subscriber: (event: AuthChannelEvent) => void) {
    subscribers.add(subscriber);
    getChannel();

    return () => {
        subscribers.delete(subscriber);
    };
}

export function getAccessToken() {
    return accessToken;
}

export function setAccessToken(token: string | null) {
    accessToken = token;
    emit({ type: "TOKEN_REFRESHED", accessToken: token });
}

export function clearAccessToken() {
    accessToken = null;
    emit({ type: "LOGOUT" });
}

export async function getAccessTokenWithMutex(refresher: () => Promise<string | null>) {
    if (!refreshPromise) {
        refreshPromise = refresher().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}
