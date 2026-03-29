import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth.api";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";
import { clearAccessToken } from "@/lib/auth/session-manager";
import { useLogoutAllMutation, useLogoutMutation, useProfileQuery } from "./use-profile";

const hoisted = vi.hoisted(() => ({
    clearSession: vi.fn(),
    push: vi.fn(),
    clearAccessToken: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
        push: hoisted.push,
    })),
}));

vi.mock("@/stores/auth-ui.store", () => ({
    useAuthUiStore: vi.fn((selector: (state: { clearSession: () => void }) => unknown) =>
        selector({ clearSession: hoisted.clearSession }),
    ),
}));

vi.mock("@/lib/auth/session-manager", () => ({
    clearAccessToken: hoisted.clearAccessToken,
}));

vi.mock("@/lib/api/auth.api", () => ({
    me: vi.fn(),
    logout: vi.fn(),
    logoutAllDevices: vi.fn(),
}));

describe("use-profile hooks", () => {
    const useQueryMock = vi.mocked(useQuery);
    const useMutationMock = vi.mocked(useMutation);

    beforeEach(() => {
        vi.clearAllMocks();
        useQueryMock.mockImplementation((options: unknown) => options as never);
        useMutationMock.mockImplementation((options: unknown) => options as never);
    });

    it("configures useProfileQuery with profile query key and authApi.me", () => {
        useProfileQuery();

        expect(useQueryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["auth", "profile"],
                queryFn: authApi.me,
                retry: 1,
            }),
        );
    });

    it("useLogoutMutation clears auth artifacts and redirects on settled", () => {
        const cookieSetterSpy = vi.spyOn(Document.prototype, "cookie", "set");
        useLogoutMutation();
        const [options] = useMutationMock.mock.calls.at(-1) ?? [];
        const mutationFn = (options as { mutationFn: unknown }).mutationFn;
        const onSettled = (options as { onSettled: () => void }).onSettled;

        expect(mutationFn).toBe(authApi.logout);

        onSettled();

        expect(cookieSetterSpy).toHaveBeenCalledWith(`${APP_CONSTANTS.COOKIE_ROLE_KEY}=; path=/; max-age=0`);
        expect(clearAccessToken).toHaveBeenCalledTimes(1);
        expect(hoisted.clearSession).toHaveBeenCalledTimes(1);
        expect(hoisted.push).toHaveBeenCalledWith(ROUTE_CONSTANTS.LOGIN);
    });

    it("useLogoutAllMutation clears auth artifacts and redirects on settled", () => {
        const cookieSetterSpy = vi.spyOn(Document.prototype, "cookie", "set");
        useLogoutAllMutation();
        const [options] = useMutationMock.mock.calls.at(-1) ?? [];
        const mutationFn = (options as { mutationFn: unknown }).mutationFn;
        const onSettled = (options as { onSettled: () => void }).onSettled;

        expect(mutationFn).toBe(authApi.logoutAllDevices);

        onSettled();

        expect(cookieSetterSpy).toHaveBeenCalledWith(`${APP_CONSTANTS.COOKIE_ROLE_KEY}=; path=/; max-age=0`);
        expect(clearAccessToken).toHaveBeenCalledTimes(1);
        expect(hoisted.clearSession).toHaveBeenCalledTimes(1);
        expect(hoisted.push).toHaveBeenCalledWith(ROUTE_CONSTANTS.LOGIN);
    });
});
