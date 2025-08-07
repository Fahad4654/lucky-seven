
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { Home, User, Wallet } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const menuItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || pathname === '/login' || pathname === '/register') {
    return null; // Don't show sidebar if not logged in or on auth pages
  }

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link
          href="/home"
          className="flex items-center gap-2 font-bold text-lg font-headline text-primary"
        >
          <Logo className="w-8 h-8" />
          <span className="group-data-[collapsible=icon]:hidden">
            Lucky Sevens
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} asChild>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right" }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Play History</SidebarGroupLabel>
          <div className="text-xs text-muted-foreground p-2 space-y-2">
            <p>Slot: Won 50 credits.</p>
            <p>Dice: Rolled 12.</p>
            <p>Slot: Lost 10 credits.</p>
          </div>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
