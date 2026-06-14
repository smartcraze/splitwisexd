export function LandingTrustedBy() {
  const highlights = [
    { value: "4", label: "Split methods" },
    { value: "Live", label: "Balance sync" },
    { value: "CSV", label: "Import & export" },
    { value: "₹0", label: "Cost to use" },
  ];

  return (
    <section className="border-t border-b border-zinc-100 bg-zinc-50 relative z-10 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-10 md:gap-20">
        <span className="text-xs font-black uppercase tracking-widest text-zinc-300 shrink-0">
          Built with
        </span>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
          {highlights.map((h, i) => (
            <div key={h.label} className="flex items-center gap-12 md:gap-20">
              <div className="text-center">
                <p className="text-3xl font-black text-zinc-900 leading-none">
                  {h.value}
                </p>
                <p className="text-[11px] text-zinc-400 font-semibold mt-1.5 uppercase tracking-widest">
                  {h.label}
                </p>
              </div>
              {i < highlights.length - 1 && (
                <div className="hidden sm:block h-10 w-px bg-zinc-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
