"use client";

import { Bell, Landmark, Menu, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { CreateGroupModal } from "@/components/features/dashboard/create-group-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

interface TopNavbarProps {
  onGroupCreated?: () => void;
}

export function TopNavbar({ onGroupCreated }: TopNavbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="md:ml-64 sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-6 py-3.5 shadow-sm">
        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
          onClick={() => setMobileOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Greeting — matches reference "Hello, Suraj vishwakarma" */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xl">👋</span>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Hello, {user?.name ?? "User"}
          </h2>
        </div>

        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 font-extrabold text-lg tracking-tight">
          <div className="p-1.5 bg-primary text-primary-foreground rounded-lg">
            <Landmark className="h-4 w-4" />
          </div>
          <span>Splitwise<span className="text-primary">XD</span></span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <CreateGroupModal onGroupCreated={onGroupCreated} />
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4.5 w-4.5" />
            </Button>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
                <div className="p-1.5 bg-primary text-primary-foreground rounded-lg">
                  <Landmark className="h-4 w-4" />
                </div>
                <span>Splitwise<span className="text-primary">XD</span></span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
