import { CheckCircle2, Coins, Users, Wallet } from "lucide-react";

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-6 py-24 relative z-10 space-y-12"
    >
      <div className="text-center space-y-3">
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black tracking-widest uppercase px-3 py-1 rounded-full">
          Features
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Designed for financial clarity.
        </h2>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          SplitwiseXD streamlines shared ledgers using modern RELATIONAL
          calculations. No magic, just clean arithmetic.
        </p>
      </div>

      {/* Bento Grid layout */}
      <div className="grid gap-6 md:grid-cols-12 max-w-5xl mx-auto">
        {/* Card 1: Create Groups */}
        <div className="md:col-span-4 bg-white/2 border border-white/5 hover:border-primary/25 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-white">Create Groups</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Add friends, roommates, or travel buddies in seconds. Set custom
              profiles and manage shared ledgers under one roof.
            </p>
          </div>
        </div>

        {/* Card 2: Add Expenses */}
        <div className="md:col-span-8 bg-white/2 border border-white/5 hover:border-primary/25 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-2xl rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
            <Coins className="h-5 w-5" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-white">
                Add Expenses Quickly
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Log transactions, input exact amounts, select the payer, and
                assign custom splits. Everything updates instantly across all
                group members' ledgers.
              </p>
            </div>
            <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2 text-[10px]">
              <div className="flex justify-between items-center font-bold border-b border-white/5 pb-2">
                <span>🚀 New Expense</span>
                <span className="text-primary font-black">₹1,200.00</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Payer</span>
                <span className="text-white font-semibold">
                  Suraj vishwakarma
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Method</span>
                <span className="text-zinc-300 font-semibold bg-white/5 px-1.5 py-0.5 rounded">
                  Equal Split
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Smart Splits */}
        <div className="md:col-span-7 bg-white/2 border border-white/5 hover:border-primary/25 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-2xl rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="grid sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7 space-y-1">
              <h3 className="font-bold text-sm text-white">
                Four Split Methods
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Split expenses equally, unequally by custom amounts, using exact
                percentages, or weighted share weights. Highly versatile for any
                situation.
              </p>
            </div>
            <div className="sm:col-span-5 bg-black/40 border border-white/5 rounded-xl p-3 text-[9.5px] font-semibold text-zinc-500 flex flex-col gap-1.5 justify-center">
              <div className="flex items-center gap-1.5 text-white">
                <span className="h-1 w-1 bg-primary rounded-full" /> Equal Split
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 bg-zinc-600 rounded-full" /> Percentage
                Split
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 bg-zinc-600 rounded-full" /> Weighted
                Shares
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Settle Up */}
        <div className="md:col-span-5 bg-white/2 border border-white/5 hover:border-primary/25 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-white">
              Settle Up Instantly
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Log cash payments or settle up with direct record keeping. Reduces
              directional debt and logs a transparent history of settlements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
