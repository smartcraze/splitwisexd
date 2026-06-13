import { Coins, Users, Wallet } from "lucide-react";

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-b border-white/5 bg-[#070708] relative z-10 py-24"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black tracking-widest uppercase px-3 py-1 rounded-full">
            Workflow
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Three steps to complete clarity.
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            No complex setup processes. Get started splitting and settling in
            under a minute.
          </p>
        </div>

        {/* Steps columns */}
        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto relative">
          {[
            {
              step: "01",
              title: "Create a Group",
              desc: "Set up a shared space for a trip, flatmates, team event, or outing, and add members.",
              icon: Users,
            },
            {
              step: "02",
              title: "Add Shared Expenses",
              desc: "Input payments, configure how they are split, and let SplitwiseXD handle the math.",
              icon: Coins,
            },
            {
              step: "03",
              title: "Settle Up Balances",
              desc: "See exactly who owes whom and record payments to settle outstanding debt.",
              icon: Wallet,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-black/30 border border-white/5 p-6 rounded-2xl space-y-4 relative group hover:border-primary/10 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-white/10 group-hover:text-primary/20 transition-colors">
                    {s.step}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/15">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">{s.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
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
