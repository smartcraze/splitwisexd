"use client";

import Link from "next/link";
import { useAuth } from "@/components/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  const { user } = useAuth();

  return (
    <section className="relative z-10 py-28 border-t border-zinc-100 overflow-hidden bg-white">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.95]">
          Start splitting<br />
          <span className="bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
            smarter today.
          </span>
        </h2>
        <p className="text-base md:text-lg text-zinc-500 max-w-md mx-auto leading-relaxed">
          Track expenses, manage roommates, and settle outings. Zero friction,
          zero debt confusion.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={user ? "/dashboard" : "/register"}>
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-base px-10 py-6 rounded-xl shadow-[0_6px_30px_rgba(220,38,38,0.35)] transition-all hover:scale-[1.02]">
              Get Started — It's Free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-zinc-200 text-zinc-600 hover:border-zinc-300 font-bold text-base px-10 py-6 rounded-xl">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
