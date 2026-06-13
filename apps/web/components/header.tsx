"use client";

import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info("Signed out successfully.");
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 group hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-lg shadow-md border border-primary/10">
            W
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Splitwise
            <span className="text-primary group-hover:underline decoration-2 underline-offset-4">
              XD
            </span>
          </span>
        </Link>

        {/* User & Theme Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Switcher */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl hover:bg-muted border border-border/40 transition-all duration-200 cursor-pointer active:scale-90"
              title="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <IconSun
                  size={18}
                  className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45"
                />
              ) : (
                <IconMoon
                  size={18}
                  className="text-indigo-600 transition-transform duration-300 rotate-0 hover:-rotate-12"
                />
              )}
            </Button>
          )}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-accent border border-border/40 p-0 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <Avatar className="h-9 w-9">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-popover border-border text-popover-foreground rounded-xl shadow-lg mt-1 p-1"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-2.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60 mx-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive rounded-lg m-1 px-2.5 py-2 transition-colors duration-150"
              >
                <IconLogout className="mr-2 h-4 w-4" />
                <span className="font-medium text-xs">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
