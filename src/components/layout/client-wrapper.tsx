
"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "./app-sidebar";
import AppHeader from "./app-header";
import { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";

export default function ClientWrapper({ children }: { children: ReactNode }) {
    const { user, initialLoading } = useAuth();
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (initialLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
    if (isAuthPage || !user) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
                <AppHeader />
                <main className="flex flex-1 flex-col p-4 md:p-8 items-center justify-center">
                    {children}
                </main>
            </div>
        </div>
    );
}
