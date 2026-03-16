"use client";

import { PropsWithChildren, useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthSessionSync } from "../components/auth/auth-session-sync";

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                gcTime: 5 * 60_000,
                retry: 1,
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}

export function AppProviders({ children }: PropsWithChildren) {
    const [queryClient] = useState(createQueryClient);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
                <AuthSessionSync />
                {children}
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
