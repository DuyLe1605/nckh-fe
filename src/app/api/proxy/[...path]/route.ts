import { NextRequest, NextResponse } from "next/server";
import { APP_CONSTANTS } from "@/constants/app.constants";

const BE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(APP_CONSTANTS.API_PREFIX, "") ?? APP_CONSTANTS.DEFAULT_BE_ORIGIN;
const TARGET_API_URL = `${BE_URL}${APP_CONSTANTS.API_PREFIX}`;

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const path = (await params).path.join("/");
    const url = new URL(`${TARGET_API_URL}/${path}${req.nextUrl.search}`);

    const role = req.cookies.get(APP_CONSTANTS.COOKIE_ROLE_KEY)?.value;

    // Optional Role Routing / Blocking logic
    // Example: Block Admin APIs from non-admin users at the Edge middleware level
    if (path.startsWith("admin") && role !== APP_CONSTANTS.ROLE_ADMIN && role !== APP_CONSTANTS.ROLE_SUPER_ADMIN) {
        return NextResponse.json({ message: "Forbidden API access" }, { status: 403 });
    }

    try {
        const headers = new Headers(req.headers);
        headers.delete("host"); // Let the sub-request set its own host

        const response = await fetch(url.toString(), {
            method: req.method,
            headers,
            body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
            redirect: "manual",
        });

        const data = await response.text();

        const resHeaders = new Headers(response.headers);
        resHeaders.delete("content-encoding"); // Let Next.js handle encoding

        return new NextResponse(data, {
            status: response.status,
            headers: resHeaders,
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ message: "Proxy error" }, { status: 500 });
    }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
