export function LandingTrustedBy() {
  return (
    <section className="border-t border-b border-white/5 bg-black/30 relative z-10 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Trusted by teams at
        </span>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-zinc-600 text-sm font-black tracking-tight select-none">
          <span className="hover:text-zinc-400 transition-colors">Google</span>
          <span className="hover:text-zinc-400 transition-colors">
            Microsoft
          </span>
          <span className="hover:text-zinc-400 transition-colors">airbnb</span>
          <span className="hover:text-zinc-400 transition-colors">Spotify</span>
          <span className="hover:text-zinc-400 transition-colors">amazon</span>
        </div>
      </div>
    </section>
  );
}
