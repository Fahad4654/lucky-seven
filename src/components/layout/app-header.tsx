"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Can add page title here later */}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold text-primary">
            1,000
          </span>
        </div>
        <Button variant="outline" size="sm">
          Add Funds
        </Button>
      </div>
    </header>
  );
}
