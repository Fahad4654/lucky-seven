
"use client";

import { AuthProvider } from "@/context/auth-context";
import { CreditsProvider } from "@/context/credits-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <CreditsProvider>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
            </CreditsProvider>
        </AuthProvider>
    )
}
