const DEVICE_ID_KEY = "aurelia_device_id";

function generateDeviceId() {
    return `web_${crypto.randomUUID()}`;
}

export function getDeviceId() {
    if (typeof window === "undefined") return "web_ssr";

    const existed = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existed) return existed;

    const next = generateDeviceId();
    window.localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
}
