"use client";

import Link from "next/link";
import { useAuth } from "@/components/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  const { user } = useAuth();

  return (
    <section className="relative z-10 py-24 border-t border-white/5 bg-gradient-to-b from-[#050505] to-[#0D0104]/30 overflow-hidden">
      {/* Soft centered background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
          Start splitting smarter today.
        </h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Join thousands of users tracking expenses, roommates, and outings with
          SplitwiseXD. Zero friction. Zero debt confusion.
        </p>
        <div className="pt-2">
          <Link href={user ? "/dashboard" : "/register"}>
            <Button className="bg-primary hover:bg-primary/95 text-white font-bold text-sm px-8 py-5 rounded-xl shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02]">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
