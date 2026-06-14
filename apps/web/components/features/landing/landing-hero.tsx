"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  const { user } = useAuth();

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 md:pt-28 pb-20 grid gap-16 lg:grid-cols-12 items-center">
      {/* Left Side */}
      <div className="lg:col-span-5 space-y-8 text-center lg:text-left">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/6 text-primary text-[11px] font-black tracking-widest uppercase mx-auto lg:mx-0"
        >
          🚀 Smart. Simple. Shared.
        </motion.div>

        {/* Headline — bold, large, decisive */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-5xl md:text-6xl lg:text-[64px] font-black tracking-tighter leading-[0.97] text-zinc-900"
        >
          Split expenses.
          <br />
          <span className="bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
            Not friendships.
          </span>
        </motion.h1>

        {/* Subheadline — readable, not tiny */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg text-zinc-500 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed"
        >
          Track shared expenses, split them four ways, and settle debts — with
          mathematically guaranteed accuracy.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
        >
          <Link href={user ? "/dashboard" : "/register"}>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold text-base px-7 py-6 rounded-xl shadow-[0_6px_28px_rgba(220,38,38,0.35)] transition-all hover:scale-[1.02] flex items-center gap-2">
              Create Your First Group <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-zinc-200 hover:border-primary/30 hover:bg-rose-50 text-zinc-700 font-bold text-base px-7 py-6 rounded-xl"
            >
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Stats — the signature: oversized numbers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="flex items-center justify-center lg:justify-start gap-8 pt-4 border-t border-zinc-100"
        >
          {[
            { value: "4", label: "Split methods" },
            { value: "Live", label: "Balance sync" },
            { value: "₹0", label: "Cost to use" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-black text-zinc-900 leading-none">{stat.value}</p>
                <p className="text-xs text-zinc-400 font-semibold mt-1 uppercase tracking-wide">{stat.label}</p>
              </div>
              {i < 2 && <div className="h-8 w-px bg-zinc-150" />}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Side — Dashboard Screenshot */}
      <div className="lg:col-span-7 flex justify-center items-center relative">
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[75%] h-12 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
          className="relative z-10 w-full"
        >
          <Image
            src="/dashboard.png"
            alt="SplitwiseXD Dashboard — group balances and expense tracking"
            width={1280}
            height={800}
            className="w-full h-auto rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.06)] border border-zinc-200/70"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
