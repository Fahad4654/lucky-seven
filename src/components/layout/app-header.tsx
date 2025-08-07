"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Coins, LogOut } from "lucide-react";
import { useCredits } from "@/context/credits-context";
import { useAuth } from "@/context/auth-context";

export default function AppHeader() {
  const { credits, setCredits } = useCredits();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Can add page title here later */}
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-bold text-primary">
                {credits.toLocaleString()}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCredits(c => c + 100)}>
              Add Funds
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
