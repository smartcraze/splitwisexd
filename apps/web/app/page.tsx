"use client";

import {
  IconArrowRight,
  IconShieldCheck,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      <div className="absolute top-[15%] left-[20%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[20%] right-[15%] h-[200px] w-[200px] rounded-full bg-destructive/5 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-lg shadow-sm">
              W
            </div>
            <span className="text-xl font-bold tracking-tight">
              Splitwise<span className="text-primary">XD</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-4 rounded-xl cursor-pointer">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-xs sm:text-sm font-bold rounded-xl h-9 px-3 cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-4 rounded-xl cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 max-w-5xl mx-auto text-center py-20 relative z-10 space-y-10">
        <div className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs font-bold text-primary select-none animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Accuracy Engineered MVP
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
            Precision Expense Sharing.
            <br />
            <span className="text-primary">Mathematically</span> Correct.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Eliminate debts with a ledger-centric tracking application. Split
            equally, by percentages, exact amounts, or shares with real-time
            balance calculations.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 shrink-0">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-6 rounded-xl shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm sm:text-base">
                Go to Dashboard
                <IconArrowRight size={18} />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-6 rounded-xl shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm sm:text-base">
                  Get Started for Free
                  <IconArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-border bg-card text-foreground hover:bg-muted font-bold h-11 px-6 rounded-xl cursor-pointer text-sm sm:text-base"
                >
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 sm:grid-cols-3 w-full pt-10 text-left">
          <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <IconWallet size={20} />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Directional Debt Engine
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Maintains mathematical consistency: total paid always equals total
              owed. Directional ledgers resolve debts in minimum steps.
            </p>
          </div>

          <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <IconUsers size={20} />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Flexible Splits
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Support for equal divisions, exact amounts, percentages, and share
              weights (e.g. A owes twice as much as B).
            </p>
          </div>

          <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <IconShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Real-time Collaboration
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discussion threads on expenses update instantly via WebSockets,
              allowing group members to verify transaction details.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/40 text-center text-[10px] text-muted-foreground font-mono">
        <span>
          SplitwiseXD &copy; {new Date().getFullYear()} &bull; Accurate shared
          ledger MVPs.
        </span>
      </footer>
    </div>
  );
}
