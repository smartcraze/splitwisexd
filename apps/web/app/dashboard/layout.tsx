"use client";

import { IconLogout, IconMoon, IconSun, IconWallet } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-lg shadow-md">
              W
            </div>
            <span className="text-xl font-bold tracking-tight">
              Splitwise<span className="text-primary">XD</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl cursor-pointer"
            >
              <IconSun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <IconMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <div className="flex items-center gap-3 border-l border-border pl-4">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="font-bold bg-primary/10 text-primary">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-xs">
                <span className="font-bold leading-none">{user.name}</span>
                <span className="text-muted-foreground mt-0.5">
                  {user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  logout();
                  router.push("/auth/login");
                }}
                className="rounded-xl hover:text-destructive cursor-pointer"
                title="Log Out"
              >
                <IconLogout size={18} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        {children}
      </main>

      <footer className="py-6 border-t border-border/40 text-center text-[10px] text-muted-foreground font-mono">
        <span>SplitwiseXD &bull; Precision Ledger Systems</span>
      </footer>
    </div>
  );
}
