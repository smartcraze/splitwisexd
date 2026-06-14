import { LandingCTA } from "@/components/features/landing/landing-cta";
import { LandingFeatures } from "@/components/features/landing/landing-features";
import { LandingFooter } from "@/components/features/landing/landing-footer";
import { LandingHero } from "@/components/features/landing/landing-hero";
import { LandingHowItWorks } from "@/components/features/landing/landing-how-it-works";
import { LandingNavbar } from "@/components/features/landing/landing-navbar";
import { LandingTrustedBy } from "@/components/features/landing/landing-trusted-by";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10" />

      {/* Light background glow — very subtle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[5%] w-[500px] h-[400px] bg-primary/5 blur-[140px] rounded-full" />
        <div className="absolute top-[-5%] right-[5%] w-[400px] h-[350px] bg-rose-100/60 blur-[120px] rounded-full" />
      </div>

      <LandingNavbar />
      <LandingHero />
      <LandingTrustedBy />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
