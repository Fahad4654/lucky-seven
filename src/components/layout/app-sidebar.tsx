
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
import { Gem, Spade, Heart, Dice5, Apple, Award } from "lucide-react";

const menuItems = [
  { href: "/", label: "Slot Machine", icon: Gem },
  { href: "/blackjack", label: "Blackjack", icon: Spade },
  { href: "/poker", label: "Poker", icon: Heart },
  { href: "/dice-roller", label: "Dice Roller", icon: Dice5 },
  { href: "/fortune-apple", label: "Fortune Apple", icon: Apple },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link
          href="/"
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
              <Link href={item.href}>
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
