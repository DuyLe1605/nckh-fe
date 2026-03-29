import { apiClient } from "@/lib/api/axios-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WalletTransactionType = "DEPOSIT" | "WITHDRAW" | "HOLD" | "RELEASE" | "PAYMENT";
export type TxStatus = "PENDING" | "COMPLETED" | "FAILED";

export type WalletTransaction = {
    id: string;
    walletId: string;
    transactionType: WalletTransactionType;
    amount: string | number;
    balanceBefore: string | number;
    balanceAfter: string | number;
    referenceType: string;
    referenceId?: string | null;
    status: TxStatus;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
};

export type WalletInfo = {
    id: string;
    userId: string;
    availableBalance: string | number;
    heldBalance: string | number;
    currency: string;
    lastUpdated: string;
    transactions: WalletTransaction[];
};

export type DepositPayload = {
    amount: number;
    idempotencyKey?: string;
};

export type WithdrawPayload = {
    amount: number;
    idempotencyKey?: string;
};

type WalletMeResponse = {
    message: string;
    wallet: WalletInfo;
};

type DepositResponse = {
    message: string;
    wallet: WalletInfo;
    transaction: WalletTransaction;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getMyWallet() {
    const response = await apiClient.get<WalletMeResponse>("/wallets/me");
    return response.data;
}

export async function deposit(payload: DepositPayload) {
    const response = await apiClient.post<DepositResponse>(
        "/wallets/deposit",
        payload,
    );
    return response.data;
}

export async function withdraw(payload: WithdrawPayload) {
    const response = await apiClient.post<{ message: string; wallet: WalletInfo; transaction: WalletTransaction }>(
        "/wallets/withdraw",
        payload,
    );
    return response.data;
}

export async function approveWithdrawal(transactionId: string) {
    const response = await apiClient.patch<{ message: string; transaction: WalletTransaction }>(
        `/wallets/transactions/${transactionId}/approve`,
    );
    return response.data;
}
