"use client";

import { Landmark } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-100 bg-white py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 font-black text-lg tracking-tight text-zinc-900">
            <div className="p-1.5 bg-primary text-white rounded-lg">
              <Landmark className="h-4 w-4" />
            </div>
            <span>
              Splitwise<span className="text-primary">XD</span>
            </span>
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Shared expense tracking with clean relational math and real-time
            balance sync.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-4">
            Product
          </h4>
          <ul className="space-y-3 text-sm text-zinc-500">
            <li>
              <a
                href="#features"
                className="hover:text-zinc-900 transition-colors"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="hover:text-zinc-900 transition-colors"
              >
                Workflow
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-4">
            Account
          </h4>
          <ul className="space-y-3 text-sm text-zinc-500">
            <li>
              <Link
                href="/login"
                className="hover:text-zinc-900 transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="hover:text-zinc-900 transition-colors"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
            About
          </h4>
          <p className="text-sm text-zinc-500 leading-relaxed">
            An MVP built on clean architecture, Next.js 16, and real-time
            WebSocket balance sync.
          </p>
          <p className="text-xs text-zinc-300 font-semibold pt-2">
            © 2026 SplitwiseXD
          </p>
        </div>
      </div>
    </footer>
  );
}
