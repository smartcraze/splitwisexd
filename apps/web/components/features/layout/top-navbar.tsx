"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, Landmark, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { CreateGroupModal } from "@/components/features/dashboard/create-group-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

interface TopNavbarProps {
  onGroupCreated?: () => void;
}

export function TopNavbar({ onGroupCreated }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <>
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-6 shadow-sm">
        {/* Left: hamburger (mobile) | greeting (desktop) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile: logo */}
          <div className="flex md:hidden items-center gap-2 font-extrabold text-lg tracking-tight">
            <div className="p-1.5 bg-primary text-primary-foreground rounded-lg">
              <Landmark className="h-4 w-4" />
            </div>
            <span>
              Splitwise<span className="text-primary">XD</span>
            </span>
          </div>

          {/* Desktop: greeting */}
          <div className="hidden md:flex items-center gap-2.5">
            <span className="text-xl leading-none" aria-hidden>
              👋
            </span>
            <span className="text-base font-bold tracking-tight text-foreground">
              Hello, {user?.name ?? "User"}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <CreateGroupModal onGroupCreated={onGroupCreated} />

          {/* Bell with badge */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          </Button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border flex flex-col shadow-xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight">
                  <div className="p-1.5 bg-primary text-primary-foreground rounded-lg">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <span>
                    Splitwise<span className="text-primary">XD</span>
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Separator className="bg-sidebar-border" />

              {/* Nav links */}
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active && "text-primary",
                          )}
                        />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <Separator className="bg-sidebar-border" />

              {/* User row at bottom */}
              <div className="p-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Log out"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
