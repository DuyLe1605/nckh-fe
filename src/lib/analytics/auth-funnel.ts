type SearchParamReader = {
    get: (key: string) => string | null;
};

export type AuthFunnelFlow = "verify" | "reset";

export type AuthFunnelEventName = "auth_email_link_clicked" | "auth_verify_success" | "auth_reset_success";

type AuthFunnelEventInput = {
    eventName: AuthFunnelEventName;
    flow: AuthFunnelFlow;
    dedupeKey?: string;
    email?: string;
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
};

type AuthFunnelEventPayload = AuthFunnelEventInput & {
    sessionId: string;
    occurredAt: string;
    pagePath: string;
    emailMasked?: string;
};

const STORAGE_KEY = "aurelia:auth-funnel-events";
const SESSION_KEY = "aurelia:auth-funnel-session-id";
const MAX_STORED_EVENTS = 200;

function generateSessionId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId() {
    if (typeof window === "undefined") return "server";

    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const created = generateSessionId();
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
}

function maskEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    const [localPart = "", domain = ""] = normalized.split("@");
    if (!localPart || !domain) return undefined;

    if (localPart.length <= 2) {
        return `${localPart[0] ?? "*"}***@${domain}`;
    }

    return `${localPart.slice(0, 2)}***@${domain}`;
}

function persistEventLocally(event: AuthFunnelEventPayload) {
    if (typeof window === "undefined") return;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const current: AuthFunnelEventPayload[] = raw ? JSON.parse(raw) : [];
        const next = [...current, event].slice(-MAX_STORED_EVENTS);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // ignore local persistence errors
    }
}

function sendEventToApi(event: AuthFunnelEventPayload) {
    if (typeof window === "undefined") return;

    const body = JSON.stringify(event);

    try {
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
            const blob = new Blob([body], { type: "application/json" });
            navigator.sendBeacon("/api/analytics/auth-funnel", blob);
            return;
        }

        void fetch("/api/analytics/auth-funnel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
            keepalive: true,
        });
    } catch {
        // ignore transport errors in UI flow
    }
}

function shouldSkipByDedupe(dedupeKey?: string) {
    if (!dedupeKey || typeof window === "undefined") return false;

    const storageKey = `aurelia:auth-funnel:dedupe:${dedupeKey}`;
    const existed = window.sessionStorage.getItem(storageKey);
    if (existed === "1") return true;

    window.sessionStorage.setItem(storageKey, "1");
    return false;
}

export function extractAuthAttribution(searchParams: SearchParamReader) {
    return {
        source: searchParams.get("from") ?? "unknown",
        utmSource: searchParams.get("utm_source") ?? undefined,
        utmMedium: searchParams.get("utm_medium") ?? undefined,
        utmCampaign: searchParams.get("utm_campaign") ?? undefined,
        utmContent: searchParams.get("utm_content") ?? undefined,
    };
}

export function isEmailAttribution(params: { source?: string; utmSource?: string }) {
    return params.source === "email" || params.utmSource === "email";
}

export function logAuthFunnelEvent(input: AuthFunnelEventInput) {
    if (typeof window === "undefined") return;
    if (shouldSkipByDedupe(input.dedupeKey)) return;

    const payload: AuthFunnelEventPayload = {
        ...input,
        sessionId: getSessionId(),
        occurredAt: new Date().toISOString(),
        pagePath: window.location.pathname,
        emailMasked: input.email ? maskEmail(input.email) : undefined,
    };

    persistEventLocally(payload);
    sendEventToApi(payload);

    if (process.env.NODE_ENV !== "production") {
        console.info("[AuthFunnel]", payload);
    }
}
