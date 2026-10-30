"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

interface VideoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreAssets: () => void;
}

export const VideoTourModal: React.FC<VideoTourModalProps> = ({
  isOpen,
  onClose,
  onExploreAssets,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Demo Compliance",
      heading: "Hash-only verification",
      desc: "Experience how modern Web3 platforms verify credentials without storing personal identity data. Only a hash of your form is stored on-chain, no personal data.",
      mockVisual: (
        <div className="p-4 rounded-xl bg-[#0c0908] border border-amber-500/20 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400">
            <span>Identity Proof</span>
            <span>Hash-Recorded</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-full" />
          </div>
          <div className="text-[10px] text-[#8e887d]">
            Status: Level-2 Testnet Investor (Sepolia Sandbox)
          </div>
        </div>
      ),
    },
    {
      title: "2. Asset Details",
      heading: "Inspect simulated asset backing",
      desc: "Each asset shows its name, unit, and a document link. Nothing is backed by a real asset in this prototype, designed safely for learning.",
      mockVisual: (
        <div className="p-4 rounded-xl bg-[#0c0908] border border-amber-500/20 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[#eae6dd]">
            <span className="text-amber-400">Digital Gold (TGOLD)</span>
            <span>1 token = 0.01 g (₹150 / 0.00003 ETH)</span>
          </div>
          <div className="text-[10px] text-[#8e887d]">
            Simulated asset for demo. No real reserves.
          </div>
          <div className="text-[10px] text-emerald-400">
            Gold appreciation simulation
          </div>
        </div>
      ),
    },
    {
      title: "3. Fractional Ownership",
      heading: "Mint micro-shares from ₹150",
      desc: "Split assets into affordable fractions. Track simulated yield distributions directly in your self-custodial testnet wallet.",
      mockVisual: (
        <div className="p-4 rounded-xl bg-[#0c0908] border border-amber-500/20 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400">
            <span>Portfolio Balance</span>
            <span className="text-white font-semibold">₹12,500 (0.0025 ETH)</span>
          </div>
          <div className="flex justify-between text-[10px] text-amber-400">
            <span>Simulated Growth</span>
            <span>+₹240 (+1.95%)</span>
          </div>
          <div className="text-[10px] text-[#8e887d]">
            Smart Contract: ERC-20 on Sepolia
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#130f0d] border border-amber-500/30 shadow-2xl shadow-black/90 p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#8e887d] hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase text-amber-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>INTERACTIVE PRODUCT TOUR</span>
        </div>

        <h3 className="text-2xl font-semibold text-[#f6f5f0] mb-6">
          How TokeEase Works on Testnet
        </h3>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`pb-3 px-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === idx
                  ? "border-amber-400 text-amber-300 font-semibold"
                  : "border-transparent text-[#8e887d] hover:text-white"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium text-[#f6f5f0]">
              {steps[activeTab].heading}
            </h4>
            <p className="text-xs sm:text-sm text-[#9a9489] mt-1.5 leading-relaxed">
              {steps[activeTab].desc}
            </p>
          </div>

          <div className="pt-2">{steps[activeTab].mockVisual}</div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#787268]">
            Step {activeTab + 1} of {steps.length}
          </div>

          <div className="flex gap-2">
            {activeTab < steps.length - 1 ? (
              <button
                onClick={() => setActiveTab(activeTab + 1)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onExploreAssets();
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Explore Assets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
