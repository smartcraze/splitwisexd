"use client";

import { Landmark, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-black text-lg tracking-tight shrink-0"
        >
          <div className="p-1.5 bg-primary text-primary-foreground rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.4)]">
            <Landmark className="h-4.5 w-4.5" />
          </div>
          <span>
            Splitwise<span className="text-primary">XD</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors"
          >
            How It Works
          </a>
        </nav>

        {/* Nav CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all hover:scale-[1.02]">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-zinc-400 hover:text-white transition-colors px-3 py-2"
              >
                Log in
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all hover:scale-[1.02]">
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/5 bg-[#050505]/95 backdrop-blur-lg px-6 py-6 space-y-4 flex flex-col text-sm font-semibold">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-white py-1"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-white py-1"
          >
            How It Works
          </a>
          <div className="h-px bg-white/5 my-2" />
          {user ? (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-sm py-2.5 rounded-xl shadow-lg">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-zinc-400 hover:text-white py-2"
              >
                Log in
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-sm py-2.5 rounded-xl shadow-lg">
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
