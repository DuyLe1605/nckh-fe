import { NextRequest, NextResponse } from "next/server";

type AuthFunnelFlow = "verify" | "reset";
type AuthFunnelEventName = "auth_email_link_clicked" | "auth_verify_success" | "auth_reset_success";

type AuthFunnelEventPayload = {
    eventName?: AuthFunnelEventName;
    flow?: AuthFunnelFlow;
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

const stats = {
    verifyClicksFromEmail: 0,
    resetClicksFromEmail: 0,
    verifySuccessFromEmail: 0,
    resetSuccessFromEmail: 0,
};

function isEmailSource(payload: AuthFunnelEventPayload) {
    return payload.source === "email" || payload.utmSource === "email";
}

function updateStats(payload: AuthFunnelEventPayload) {
    if (!isEmailSource(payload)) return;

    if (payload.eventName === "auth_email_link_clicked" && payload.flow === "verify") {
        stats.verifyClicksFromEmail += 1;
    }

    if (payload.eventName === "auth_email_link_clicked" && payload.flow === "reset") {
        stats.resetClicksFromEmail += 1;
    }

    if (payload.eventName === "auth_verify_success") {
        stats.verifySuccessFromEmail += 1;
    }

    if (payload.eventName === "auth_reset_success") {
        stats.resetSuccessFromEmail += 1;
    }
}

function buildRatios() {
    const verifyRate = stats.verifyClicksFromEmail > 0 ? stats.verifySuccessFromEmail / stats.verifyClicksFromEmail : 0;
    const resetRate = stats.resetClicksFromEmail > 0 ? stats.resetSuccessFromEmail / stats.resetClicksFromEmail : 0;

    return {
        verifyRate,
        resetRate,
    };
}

export async function POST(request: NextRequest) {
    let payload: AuthFunnelEventPayload;

    try {
        payload = (await request.json()) as AuthFunnelEventPayload;
    } catch {
        return NextResponse.json({ message: "Invalid analytics payload" }, { status: 400 });
    }

    updateStats(payload);

    if (isEmailSource(payload)) {
        console.log("[AuthFunnelEvent]", {
            eventName: payload.eventName,
            flow: payload.flow,
            source: payload.source,
            utmSource: payload.utmSource,
            utmMedium: payload.utmMedium,
            utmCampaign: payload.utmCampaign,
            utmContent: payload.utmContent,
            sessionId: payload.sessionId,
            occurredAt: payload.occurredAt,
            pagePath: payload.pagePath,
            emailMasked: payload.emailMasked,
            ...buildRatios(),
        });
    }

    return NextResponse.json({ message: "ok" });
}

export async function GET() {
    const ratios = buildRatios();

    return NextResponse.json({
        stats,
        ratios,
    });
}
