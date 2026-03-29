import { NextRequest, NextResponse } from "next/server";
import { APP_CONSTANTS } from "@/constants/app.constants";

type FrontAuthFunnelFlow = "verify" | "reset";
type FrontAuthFunnelEventName = "auth_email_link_clicked" | "auth_verify_success" | "auth_reset_success";

type FrontAuthFunnelEventPayload = {
    eventName?: FrontAuthFunnelEventName;
    flow?: FrontAuthFunnelFlow;
    dedupeKey?: string;
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    occurredAt?: string;
    sessionId?: string;
    pagePath?: string;
    emailMasked?: string;
};

type BackendAuthFunnelEventPayload = {
    eventName: "AUTH_EMAIL_LINK_CLICKED" | "AUTH_VERIFY_SUCCESS" | "AUTH_RESET_SUCCESS";
    flow: "VERIFY" | "RESET";
    dedupeKey?: string;
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    occurredAt?: string;
    sessionId?: string;
    pagePath?: string;
    emailMasked?: string;
};

function getBackendBaseUrl() {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? `${APP_CONSTANTS.DEFAULT_BE_ORIGIN}${APP_CONSTANTS.API_PREFIX}`;
}

function mapEventName(eventName?: FrontAuthFunnelEventName) {
    if (eventName === "auth_email_link_clicked") return "AUTH_EMAIL_LINK_CLICKED";
    if (eventName === "auth_verify_success") return "AUTH_VERIFY_SUCCESS";
    if (eventName === "auth_reset_success") return "AUTH_RESET_SUCCESS";
    return null;
}

function mapFlow(flow?: FrontAuthFunnelFlow) {
    if (flow === "verify") return "VERIFY";
    if (flow === "reset") return "RESET";
    return null;
}

function mapToBackendPayload(payload: FrontAuthFunnelEventPayload): BackendAuthFunnelEventPayload | null {
    const eventName = mapEventName(payload.eventName);
    const flow = mapFlow(payload.flow);
    if (!eventName || !flow) return null;

    return {
        eventName,
        flow,
        dedupeKey: payload.dedupeKey,
        source: payload.source,
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        utmCampaign: payload.utmCampaign,
        utmContent: payload.utmContent,
        occurredAt: payload.occurredAt,
        sessionId: payload.sessionId,
        pagePath: payload.pagePath,
        emailMasked: payload.emailMasked,
    };
}

async function safeJson(response: Response) {
    try {
        return (await response.json()) as unknown;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    let payload: FrontAuthFunnelEventPayload;

    try {
        payload = (await request.json()) as FrontAuthFunnelEventPayload;
    } catch {
        return NextResponse.json({ message: "Invalid analytics payload" }, { status: 400 });
    }

    const mappedPayload = mapToBackendPayload(payload);
    if (!mappedPayload) {
        return NextResponse.json({ message: "Invalid eventName or flow" }, { status: 400 });
    }

    const backendResponse = await fetch(`${getBackendBaseUrl()}/analytics/auth-funnel/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(mappedPayload),
        cache: "no-store",
    });

    const data = await safeJson(backendResponse);
    if (!backendResponse.ok) {
        return NextResponse.json(data ?? { message: "Upstream analytics error" }, { status: backendResponse.status });
    }

    return NextResponse.json(data ?? { message: "ok" });
}

export async function GET(request: NextRequest) {
    const incomingUrl = new URL(request.url);
    const days = incomingUrl.searchParams.get("days") ?? "30";

    const backendResponse = await fetch(`${getBackendBaseUrl()}/analytics/auth-funnel/stats?days=${encodeURIComponent(days)}`, {
        cache: "no-store",
    });

    const data = await safeJson(backendResponse);
    if (!backendResponse.ok) {
        return NextResponse.json(data ?? { message: "Upstream analytics error" }, { status: backendResponse.status });
    }

    return NextResponse.json(data);
}
