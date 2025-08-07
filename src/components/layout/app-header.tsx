
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Coins, LogOut, Home } from "lucide-react";
import { useCredits } from "@/context/credits-context";
import { useAuth } from "@/context/auth-context";

export default function AppHeader() {
  const { credits, setCredits } = useCredits();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="max-md:hidden" />
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
      <div className="flex-1">
        <Link href="/home">
            <Button variant="ghost" size="icon" aria-label="Home">
                <Home className="h-5 w-5"/>
            </Button>
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg sm:text-xl font-bold text-primary">
                {credits.toLocaleString()}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCredits(c => c + 100)} className="hidden sm:inline-flex">
              Add Funds
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
