import { LandingCTA } from "@/components/features/landing/landing-cta";
import { LandingFeatures } from "@/components/features/landing/landing-features";
import { LandingFooter } from "@/components/features/landing/landing-footer";
import { LandingHero } from "@/components/features/landing/landing-hero";
import { LandingHowItWorks } from "@/components/features/landing/landing-how-it-works";
import { LandingNavbar } from "@/components/features/landing/landing-navbar";
import { LandingTrustedBy } from "@/components/features/landing/landing-trusted-by";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] font-sans antialiased overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* ── Background Glow Effects & Grid ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-primary/20 to-rose-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-[-10%] right-[10%] w-[450px] h-[450px] bg-gradient-to-br from-pink-500/10 to-primary/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111115_1px,transparent_1px),linear-gradient(to_bottom,#111115_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      {/* ── Navbar ── */}
      <LandingNavbar />

      {/* ── Hero Section ── */}
      <LandingHero />

      {/* ── Trusted By Section ── */}
      <LandingTrustedBy />

      {/* ── Features Bento Grid ── */}
      <LandingFeatures />

      {/* ── How It Works Section ── */}
      <LandingHowItWorks />

      {/* ── Final CTA Section ── */}
      <LandingCTA />

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
}
