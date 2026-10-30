"use client";

import React from "react";
import {
  ArrowRight,
  Play,
  ShieldAlert,
} from "lucide-react";
import { HeroDashboard } from "./HeroDashboard";

interface HeroSectionProps {
  onExploreClick: () => void;
  onWatchHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onWatchHowItWorks,
}) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Editorial warm amber radial glow backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-600/15 via-orange-600/10 to-transparent blur-[120px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-amber-500/10 blur-[100px] -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-medium">
                TOKENISED INVESTING, BUILT FOR EVERYONE
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#f6f5f0] leading-[1.12]">
              Invest in real-world assets,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 font-semibold underline decoration-amber-500/30 decoration-wavy decoration-1 underline-offset-8">
                one fraction at a time.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#a6a094] leading-relaxed max-w-xl">
              Discover fractional access to real estate, land plots, gold and
              bonds—all from a simple digital wallet. Built for learning on
              testnet, not real money.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={onExploreClick}
                type="button"
                className="group w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-orange-600 text-stone-950 font-semibold text-sm hover:brightness-110 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Explore assets</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onWatchHowItWorks}
                type="button"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#16120f] hover:bg-[#201a15] border border-amber-900/30 text-[#e6e2d8] hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Watch how it works</span>
              </button>
            </div>

            {/* Compliance Note */}
            <div className="flex items-center gap-2 pt-3 text-xs text-[#7e786e] font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500/70" />
              <span>Testnet prototype · Simulated KYC · No real funds</span>
            </div>
          </div>

          {/* Right Column: Hero Dashboard Mockup */}
          <div className="lg:col-span-6 w-full mt-6 lg:mt-0">
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
};
