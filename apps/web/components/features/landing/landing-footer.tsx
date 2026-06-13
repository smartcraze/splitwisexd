"use client";

import { Landmark } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 font-black text-base tracking-tight">
            <div className="p-1 bg-primary text-white rounded">
              <Landmark className="h-4 w-4" />
            </div>
            <span>
              Splitwise<span className="text-primary">XD</span>
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Premium modern expense splitting and transparent debt ledger.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Product
          </h4>
          <ul className="space-y-2 text-[11.5px] text-zinc-500">
            <li>
              <a
                href="#features"
                className="hover:text-white transition-colors"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="hover:text-white transition-colors"
              >
                Workflow
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Resources
          </h4>
          <ul className="space-y-2 text-[11.5px] text-zinc-500">
            <li>
              <a href="/login" className="hover:text-white transition-colors">
                Login
              </a>
            </li>
            <li>
              <a
                href="/register"
                className="hover:text-white transition-colors"
              >
                Register
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            About
          </h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            SplitwiseXD MVP - built on clean architecture, dynamic client-side
            socket synchronization, and Next.js 16.
          </p>
          <p className="text-[10px] text-zinc-600 font-bold pt-2">
            © 2026 SplitwiseXD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
