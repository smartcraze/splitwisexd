"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Coins,
  History,
  Landmark,
  Play,
  Plus,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  const { user } = useAuth();

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 grid gap-12 lg:grid-cols-12 items-center">
      {/* Left Side Info */}
      <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mx-auto lg:mx-0"
        >
          <span>🚀 Smart. Simple. Shared.</span>
        </motion.div>

        {/* Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.05]"
        >
          Split expenses.
          <br />
          <span className="bg-gradient-to-r from-primary via-rose-400 to-[#FF4D8D] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(225,29,72,0.2)]">
            Not friendships.
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base text-zinc-400 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed"
        >
          The easiest way to track shared expenses and settle up with friends,
          family, roommates, or team members with mathematically guaranteed
          accuracy.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2"
        >
          <Link href={user ? "/dashboard" : "/register"}>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-bold text-sm px-6 py-5 rounded-xl shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02] flex items-center gap-1.5">
              Create Your First Group <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-bold text-sm px-6 py-5 rounded-xl flex items-center gap-2 bg-secondary"
            >
              <Play className="h-3.5 w-3.5 fill-white text-white" /> How It
              Works
            </Button>
          </a>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center lg:justify-start gap-4 pt-6 border-t border-white/5"
        >
          <div className="flex -space-x-2.5">
            {[
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
            ].map((url) => (
              <div
                key={url}
                className="h-8.5 w-8.5 rounded-full border border-black overflow-hidden bg-zinc-800 shrink-0"
              >
                {/* biome-ignore lint/img-alt: visual decoration image */}
                <img src={url} className="h-full w-full object-cover" />
              </div>
            ))}
            <div className="h-8.5 w-8.5 rounded-full border border-black bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">
              +2K
            </div>
          </div>
          <div className="text-left">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-[11px] font-bold text-zinc-400 mt-0.5">
              Loved by 2,000+ active users
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side Composition Mockup */}
      <div className="lg:col-span-7 flex justify-center items-center relative">
        {/* Glowing backlights */}
        <div className="absolute w-[350px] h-[350px] bg-primary/20 blur-[100px] rounded-full z-0 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-6 relative z-10 w-full max-w-[620px]"
        >
          {/* Desktop Mockup */}
          <div className="flex-1 bg-[#09090A] border border-white/10 rounded-2xl shadow-2xl p-4.5 text-left select-none overflow-hidden relative min-h-[350px]">
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-primary text-white rounded">
                  <Landmark className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-black">
                  Splitwise<span className="text-primary">XD</span>
                </span>
              </div>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
              </div>
            </div>

            {/* Grid content */}
            <div className="grid grid-cols-12 gap-4">
              {/* Miniature Navigation sidebar */}
              <div className="col-span-3 space-y-1.5 text-[10px] text-zinc-500 font-bold border-r border-white/5 pr-2">
                <div className="px-2 py-1 bg-white/5 text-white rounded-md flex items-center gap-1.5">
                  <Wallet className="h-3 w-3 text-primary" /> Dashboard
                </div>
                <div className="px-2 py-1 flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Groups
                </div>
                <div className="px-2 py-1 flex items-center gap-1.5">
                  <Coins className="h-3 w-3" /> Expenses
                </div>
                <div className="px-2 py-1 flex items-center gap-1.5">
                  <History className="h-3 w-3" /> Activity
                </div>
              </div>

              {/* Dashboard body */}
              <div className="col-span-9 space-y-4">
                {/* Overview Cards */}
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="p-2 bg-white/2 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-zinc-500 font-bold block">
                      Total Balance
                    </span>
                    <span className="font-extrabold text-xs text-rose-500 leading-tight block mt-0.5">
                      -₹1,110.00
                    </span>
                  </div>
                  <div className="p-2 bg-white/2 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-zinc-500 font-bold block">
                      You Are Owed
                    </span>
                    <span className="font-extrabold text-xs text-emerald-500 leading-tight block mt-0.5">
                      ₹0.00
                    </span>
                  </div>
                  <div className="p-2 bg-white/2 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-zinc-500 font-bold block">
                      You Owe
                    </span>
                    <span className="font-extrabold text-xs text-rose-500 leading-tight block mt-0.5">
                      ₹1,110.00
                    </span>
                  </div>
                </div>

                {/* Groups */}
                <div>
                  <span className="text-[9px] font-black text-zinc-400 block mb-2 uppercase tracking-wide">
                    Your Groups
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white/2 border border-white/5 rounded-xl text-[10px] space-y-1">
                      <span className="font-black text-white block">
                        Trip to Ladakh
                      </span>
                      <span className="text-[8px] text-rose-400 font-bold block">
                        You owe ₹1,200
                      </span>
                    </div>
                    <div className="p-2 bg-white/2 border border-white/5 rounded-xl text-[10px] space-y-1">
                      <span className="font-black text-white block">
                        Weekend Goa
                      </span>
                      <span className="text-[8px] text-emerald-400 font-bold block">
                        All settled up
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-zinc-400 block mb-1.5 uppercase tracking-wide">
                    Recent Activity
                  </span>
                  <div className="space-y-1 text-[8.5px] text-zinc-400">
                    <div className="flex justify-between items-center bg-white/2 p-1.5 rounded-lg border border-white/5">
                      <span>✈️ You added "Flight Tickets" in Ladakh</span>
                      <span className="text-white font-bold">₹2,220</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/2 p-1.5 rounded-lg border border-white/5">
                      <span>🤝 Rahul paid you in Weekend Goa</span>
                      <span className="text-emerald-400 font-bold">₹1,110</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile App Mockup */}
          <div className="w-[170px] h-[340px] bg-[#070708] border-[4px] border-[#222] rounded-[28px] shadow-2xl relative overflow-hidden flex flex-col justify-between text-left shrink-0 border-t-[6px] border-b-[6px] -ml-8 -mt-10 border-white/10 select-none">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-[#222] rounded-b-xl z-20" />

            {/* Status bar */}
            <div className="h-6 flex justify-between items-center px-4 pt-1 text-[7px] font-bold text-zinc-500 z-10 relative">
              <span>9:41</span>
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                <span className="w-2 h-1 bg-zinc-500 rounded-sm" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-3.5 pt-1 space-y-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-white block">
                  Hi, Suraj 👋
                </span>
                <span className="text-[7px] text-zinc-500 font-bold block">
                  Here's what's happening
                </span>
              </div>

              {/* Total Balance Card */}
              <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-[9px] text-left">
                <span className="text-[7.5px] text-zinc-400 font-bold block">
                  Total Balance
                </span>
                <span className="font-extrabold text-xs text-rose-500 leading-tight block mt-0.5">
                  -₹1,110.00
                </span>
                <span className="text-[6.5px] text-zinc-500 font-bold block mt-0.5">
                  You owe more than you are owed
                </span>
              </div>

              {/* Groups */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-black text-zinc-400 block uppercase tracking-wide">
                  Your Groups
                </span>
                <div className="space-y-1 text-[8.5px]">
                  <div className="flex justify-between items-center bg-white/2 border border-white/5 p-2 rounded-xl">
                    <span className="font-bold text-white">Trip to Ladakh</span>
                    <span className="text-rose-500 font-black text-[7.5px]">
                      You owe ₹1,200
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 border border-white/5 p-2 rounded-xl">
                    <span className="font-bold text-white">Weekend Goa</span>
                    <span className="text-emerald-500 font-black text-[7.5px]">
                      All settled up
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Bottom Nav Bar */}
            <div className="h-9 border-t border-white/5 bg-black/80 flex items-center justify-around px-2 pb-0.5 text-zinc-500 text-[6.5px] font-bold">
              <div className="flex flex-col items-center text-primary">
                <Wallet className="h-3 w-3" /> Home
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-3 w-3" /> Groups
              </div>
              <div className="h-5.5 w-5.5 bg-primary rounded-full text-white flex items-center justify-center -mt-2.5 shadow-lg">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col items-center">
                <History className="h-3 w-3" /> Activity
              </div>
              <div className="flex flex-col items-center">
                <Star className="h-3 w-3" /> Profile
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
