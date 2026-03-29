import { useMutation } from "@tanstack/react-query";
import { 
    login, 
    register, 
    verifyEmail, 
    resendVerification, 
    forgotPassword, 
    resetPassword,
    LoginPayload,
    RegisterPayload
} from "@/lib/api/auth.api";

// Helper types
type VerifyEmailPayload = Parameters<typeof verifyEmail>[0];
type ResendVerificationPayload = Parameters<typeof resendVerification>[0];
type ForgotPasswordPayload = Parameters<typeof forgotPassword>[0];
type ResetPasswordPayload = Parameters<typeof resetPassword>[0];

export function useLoginMutation() {
    return useMutation({
        mutationFn: (payload: LoginPayload) => login(payload),
    });
}

export function useRegisterMutation() {
    return useMutation({
        mutationFn: (payload: RegisterPayload) => register(payload),
    });
}

export function useVerifyEmailMutation() {
    return useMutation({
        mutationFn: (payload: VerifyEmailPayload) => verifyEmail(payload),
    });
}

export function useResendVerificationMutation() {
    return useMutation({
        mutationFn: (payload: ResendVerificationPayload) => resendVerification(payload),
    });
}

export function useForgotPasswordMutation() {
    return useMutation({
        mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
    });
}

export function useResetPasswordMutation() {
    return useMutation({
        mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
    });
}
