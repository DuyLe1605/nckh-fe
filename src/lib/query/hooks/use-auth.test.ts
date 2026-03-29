import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMutation } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth.api";
import {
    useForgotPasswordMutation,
    useLoginMutation,
    useRegisterMutation,
    useResendVerificationMutation,
    useResetPasswordMutation,
    useVerifyEmailMutation,
} from "./use-auth";

vi.mock("@tanstack/react-query", () => ({
    useMutation: vi.fn(),
}));

vi.mock("@/lib/api/auth.api", () => ({
    login: vi.fn(),
    register: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
}));

describe("use-auth hooks", () => {
    const useMutationMock = vi.mocked(useMutation);

    beforeEach(() => {
        vi.clearAllMocks();
        useMutationMock.mockImplementation((options: unknown) => options as never);
    });

    it("maps useLoginMutation to authApi.login", async () => {
        const payload = { email: "user@example.com", password: "Secret123" };
        useLoginMutation();
        const [options] = useMutationMock.mock.calls.at(-1) ?? [];
        const mutationFn = (options as { mutationFn: (data: typeof payload) => Promise<unknown> }).mutationFn;

        await mutationFn(payload);

        expect(authApi.login).toHaveBeenCalledWith(payload);
    });

    it("maps useRegisterMutation to authApi.register", async () => {
        const payload = {
            email: "seller@example.com",
            password: "Secret123",
            fullName: "Seller Name",
            role: "SELLER" as const,
        };
        useRegisterMutation();
        const [options] = useMutationMock.mock.calls.at(-1) ?? [];
        const mutationFn = (options as { mutationFn: (data: typeof payload) => Promise<unknown> }).mutationFn;

        await mutationFn(payload);

        expect(authApi.register).toHaveBeenCalledWith(payload);
    });

    it("maps useVerifyEmailMutation to authApi.verifyEmail", async () => {
        const payload = { email: "user@example.com", otp: "123456" };
        useVerifyEmailMutation();
        const [options] = useMutationMock.mock.calls.at(-1) ?? [];
        const mutationFn = (options as { mutationFn: (data: typeof payload) => Promise<unknown> }).mutationFn;

        await mutationFn(payload);

        expect(authApi.verifyEmail).toHaveBeenCalledWith(payload);
    });

    it("maps useResendVerificationMutation to authApi.resendVerification", async () => {
        const payload = { email: "user@example.com" };
        useResendVerificationMutation();
        const [options] = useMutationMock.mock.calls.at(-1) ?? [];
        const mutationFn = (options as { mutationFn: (data: typeof payload) => Promise<unknown> }).mutationFn;

        await mutationFn(payload);

        expect(authApi.resendVerification).toHaveBeenCalledWith(payload);
    });

    it("maps useForgotPasswordMutation to authApi.forgotPassword", async () => {
        const payload = { email: "user@example.com" };
        useForgotPasswordMutation();
        const [options] = useMutationMock.mock.calls.at(-1) ?? [];
        const mutationFn = (options as { mutationFn: (data: typeof payload) => Promise<unknown> }).mutationFn;

        await mutationFn(payload);

        expect(authApi.forgotPassword).toHaveBeenCalledWith(payload);
    });

    it("maps useResetPasswordMutation to authApi.resetPassword", async () => {
        const payload = { email: "user@example.com", otp: "654321", newPassword: "NewSecret123" };
        useResetPasswordMutation();
        const [options] = useMutationMock.mock.calls.at(-1) ?? [];
        const mutationFn = (options as { mutationFn: (data: typeof payload) => Promise<unknown> }).mutationFn;

        await mutationFn(payload);

        expect(authApi.resetPassword).toHaveBeenCalledWith(payload);
    });
});
