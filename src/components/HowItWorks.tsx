import React from "react";
import {
  UserCheck,
  Search,
  Wallet,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface HowItWorksProps {
  onOpenKycModal: () => void;
  onExploreAssets: () => void;
  onOpenWallet: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onOpenKycModal,
  onExploreAssets,
  onOpenWallet,
}) => {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 scroll-mt-20">
      {/* Background radial glow specifically illuminating the featured middle card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase tracking-widest text-amber-400">
            <span>THE FLOW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f6f5f0]">
            Three steps to fractional ownership.
          </h2>
          <p className="text-sm sm:text-base text-[#9a9489]">
            A seamless path from sandbox onboarding to holding real-world testnet fractions.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Verify */}
          <div className="group relative p-7 rounded-2xl bg-[#120f0d]/80 border border-amber-900/20 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/70">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-semibold text-amber-500/80 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  STEP 01
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-medium text-[#f6f5f0] mb-2.5">
                Verify
              </h3>
              <p className="text-sm text-[#969085] leading-relaxed">
                Demo KYC. Only a hash of your form is stored on-chain, no personal data.
                Experience compliance with smart contract verification.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5">
              <button
                onClick={onOpenKycModal}
                type="button"
                className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 group-hover:gap-2 transition-all"
              >
                <span>Start KYC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Choose (FEATURED CARD with Amber Glow) */}
          <div className="group relative p-7 rounded-2xl featured-card flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-mono text-[10px] font-bold uppercase tracking-wider shadow-md">
              CORE EXPERIENCE
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-semibold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-md border border-amber-400/40">
                  STEP 02
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20">
                  <Search className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-medium text-[#f6f5f0] mb-2.5 flex items-center gap-2">
                <span>Choose</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-sm text-[#b8b2a5] leading-relaxed">
                Browse real estate, land plots, gold and bonds. Compare transparent
                custody details, simulated yields, and risk metrics explained in plain English.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-amber-500/20">
              <button
                onClick={onExploreAssets}
                type="button"
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 group-hover:gap-2 transition-all"
              >
                <span>Browse asset catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Own */}
          <div className="group relative p-7 rounded-2xl bg-[#120f0d]/80 border border-amber-900/20 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/70">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-semibold text-amber-500/80 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  STEP 03
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-medium text-[#f6f5f0] mb-2.5">
                Own
              </h3>
              <p className="text-sm text-[#969085] leading-relaxed">
                Buy fractions and track them in your wallet. Mint simulated ERC tokens,
                inspect smart contract state, and watch simulated distributions.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5">
              <button
                onClick={onOpenWallet}
                type="button"
                className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 group-hover:gap-2 transition-all"
              >
                <span>View simulated wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
