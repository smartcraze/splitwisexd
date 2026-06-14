import { CheckCircle2, Coins, Users, Wallet } from "lucide-react";

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-6 py-28 relative z-10 space-y-16"
    >
      {/* Section Header */}
      <div className="text-center space-y-4">
        <span className="text-[11px] bg-primary/6 text-primary border border-primary/20 font-black tracking-widest uppercase px-4 py-1.5 rounded-full">
          Features
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900 leading-tight mt-4">
          Designed for
          <br className="hidden sm:block" /> financial clarity.
        </h2>
        <p className="text-base md:text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed mt-2">
          Clean relational arithmetic — not a black box. You always know why
          every number is what it is.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid gap-5 md:grid-cols-12 max-w-5xl mx-auto">
        {/* Card 1 */}
        <div className="md:col-span-4 bg-white border border-zinc-200 hover:border-primary/30 rounded-2xl p-7 space-y-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="h-12 w-12 bg-primary/8 text-primary rounded-xl flex items-center justify-center border border-primary/15">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-lg text-zinc-900">Create Groups</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Add friends, roommates, or travel buddies by email. Manage shared
              ledgers under one roof with clear member roles.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="md:col-span-8 bg-white border border-zinc-200 hover:border-primary/30 rounded-2xl p-7 space-y-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="h-12 w-12 bg-primary/8 text-primary rounded-xl flex items-center justify-center border border-primary/15">
            <Coins className="h-6 w-6" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <h3 className="font-black text-lg text-zinc-900">
                Add Expenses Quickly
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Log transactions, select the payer, pick a split method, and
                every member's ledger updates instantly.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 text-[11px]">
              <div className="flex justify-between items-center font-bold border-b border-zinc-200 pb-2.5">
                <span className="text-zinc-700 font-black text-sm">
                  New Expense
                </span>
                <span className="text-primary font-black">₹ —</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payer</span>
                <span className="text-zinc-800 font-bold">You</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Split</span>
                <span className="text-zinc-800 font-bold bg-zinc-100 px-2 py-0.5 rounded">
                  Equal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="md:col-span-7 bg-white border border-zinc-200 hover:border-primary/30 rounded-2xl p-7 space-y-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="h-12 w-12 bg-primary/8 text-primary rounded-xl flex items-center justify-center border border-primary/15">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="grid sm:grid-cols-12 gap-5">
            <div className="sm:col-span-7 space-y-2">
              <h3 className="font-black text-lg text-zinc-900">
                Four Split Methods
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Equal, percentage-based, weighted shares, or custom unequal
                amounts. Every real-world scenario covered.
              </p>
            </div>
            <div className="sm:col-span-5 bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm font-semibold text-zinc-400 flex flex-col gap-2.5 justify-center">
              {[
                "Equal Split",
                "Percentage Split",
                "Weighted Shares",
                "Unequal Amounts",
              ].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${i === 0 ? "bg-primary" : "bg-zinc-200"}`}
                  />
                  <span
                    className={
                      i === 0 ? "text-zinc-900 font-black" : "text-zinc-500"
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="md:col-span-5 bg-white border border-zinc-200 hover:border-primary/30 rounded-2xl p-7 space-y-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="h-12 w-12 bg-primary/8 text-primary rounded-xl flex items-center justify-center border border-primary/15">
            <Wallet className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-lg text-zinc-900">
              Settle Up Instantly
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Record a payment to clear debt. Immutable history means your
              ledger is always auditable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
