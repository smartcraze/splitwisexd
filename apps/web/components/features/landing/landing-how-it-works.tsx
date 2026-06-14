import { Coins, Users, Wallet } from "lucide-react";

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-zinc-100 bg-zinc-50 relative z-10 py-28"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-[11px] bg-primary/6 text-primary border border-primary/20 font-black tracking-widest uppercase px-4 py-1.5 rounded-full">
            Workflow
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900 leading-tight mt-4">
            Three steps to
            <br className="hidden sm:block" /> complete clarity.
          </h2>
          <p className="text-base md:text-lg text-zinc-500 max-w-md mx-auto leading-relaxed mt-2">
            No complex setup. Start splitting in under a minute.
          </p>
        </div>

        {/* Step cards — no numbered labels, use the icon + word as anchor */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              title: "Create a Group",
              desc: "Set up a shared space for any scenario — a trip, a flat, a team dinner. Invite members by email.",
              icon: Users,
              accent: "from-rose-50 to-white",
            },
            {
              title: "Add Expenses",
              desc: "Log who paid, input the amount, choose your split method. The math resolves immediately.",
              icon: Coins,
              accent: "from-rose-50 to-white",
            },
            {
              title: "Settle Debts",
              desc: "See the minimal transactions needed to clear all balances, then record payments as they happen.",
              icon: Wallet,
              accent: "from-rose-50 to-white",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="bg-white border border-zinc-200 p-8 rounded-2xl space-y-5 group hover:border-primary/25 hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${s.accent} border border-primary/15 flex items-center justify-center text-primary`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-xl text-zinc-900">
                    {s.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
