"use client";

import { motion } from "framer-motion";
import { Bell, Landmark, LogOut, Smartphone, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

const EXTRA_NAV = [
  { href: "/friends", label: "Friends", icon: Users2 },
  { href: "/notifications", label: "Notifications", icon: Bell },
] as const;

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer",
          active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-primary" : "")} />
        {label}
      </motion.div>
    </Link>
  );
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar border-r border-sidebar-border z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-sm">
          <Landmark className="h-5 w-5" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-sidebar-foreground">
          Splitwise<span className="text-primary">XD</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <div className="pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-4 mb-1">
            More
          </p>
        </div>

        {EXTRA_NAV.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* Mobile app promo */}
      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-primary/8 border border-primary/15 p-4 flex items-start gap-3">
          <div className="p-2 bg-primary/15 rounded-xl shrink-0">
            <Smartphone className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground leading-tight">Get the mobile app</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Track expenses on the go and settle up anywhere.
            </p>
            <button
              type="button"
              className="mt-2.5 text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Download App
            </button>
          </div>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* User card */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-accent transition-colors">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-sidebar-foreground">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
