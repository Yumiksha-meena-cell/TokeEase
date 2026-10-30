"use client";

import React from "react";
import { ArrowRight, Wallet, Sparkles } from "lucide-react";

interface FooterCtaProps {
  onLaunchWallet: () => void;
}

export const FooterCta: React.FC<FooterCtaProps> = ({ onLaunchWallet }) => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background warm radial aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-amber-600/15 via-orange-600/15 to-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#171310] to-[#0f0c0a] border border-amber-500/30 p-8 sm:p-14 text-center shadow-2xl shadow-black/90 overflow-hidden">
          {/* Subtle top amber highlight */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase tracking-widest text-amber-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START EXPERIMENTING</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f6f5f0] max-w-2xl mx-auto leading-tight">
            Your first fraction starts here.
          </h2>

          <p className="text-base sm:text-lg text-[#a6a094] max-w-xl mx-auto mt-4 leading-relaxed">
            Explore a safer way to understand tokenised investing—with simulated
            assets and no real-money risk.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchWallet}
              type="button"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-stone-950 font-semibold text-sm hover:brightness-110 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
              <Wallet className="w-4 h-4 text-stone-950" />
              <span>Launch demo wallet</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
