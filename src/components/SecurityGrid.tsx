import React from "react";
import {
  ShieldCheck,
  KeyRound,
  FileCode2,
  FileCheck2,
  Cpu,
  Lock,
} from "lucide-react";

export const SecurityGrid: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Demo KYC",
      description:
        "Only a hash of your form is stored on-chain, no personal data.",
      badge: "Hash only",
    },
    {
      icon: KeyRound,
      title: "MetaMask & Web3 Custody",
      description:
        "Connect directly through self-custodial testnet accounts. Private keys never touch any centralized server; transactions execute via client signatures.",
      badge: "Non-Custodial",
    },
    {
      icon: FileCode2,
      title: "Open-Source Smart Contracts",
      description:
        "ERC-20 tokens with a KYC rule built into every transfer. Verifiable on Sepolia Etherscan.",
      badge: "Built on OpenZeppelin, not audited",
    },
    {
      icon: FileCheck2,
      title: "Simulated Asset Details",
      description:
        "Each asset shows its name, unit and a document link. Nothing is backed by a real asset in this prototype.",
      badge: "Simulated",
    },
  ];

  const techBadges = [
    "Solidity + OpenZeppelin v5",
    "Remix deployment",
    "Next.js + TypeScript",
    "ethers v6 + MetaMask",
    "Sepolia testnet",
    "Zero real-money risk",
  ];

  return (
    <section id="security" className="relative py-24 md:py-32 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Lock className="w-3.5 h-3.5" />
            <span>SECURITY & COMPLIANCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f6f5f0]">
            Engineered for trust. Safe by design.
          </h2>
          <p className="text-sm sm:text-base text-[#9a9489]">
            Built with production architectural principles in a safe sandbox where real funds are never at risk.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="group p-7 rounded-2xl bg-[#120f0d]/80 border border-amber-900/20 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/30 hover:bg-[#16120f]/90"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#a8a295] border border-white/5">
                    {p.badge}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-[#f6f5f0] mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-[#958f84] leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Discreet "Built for the prototype" Technical Foundation Panel */}
        <div className="relative rounded-2xl bg-[#0e0b09] border border-amber-900/30 p-6 sm:p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span>Technical Architecture</span>
              </div>
              <h4 className="text-lg font-medium text-[#f6f5f0]">
                Built as a prototype. Real deployment needs a SEBI-compliant structure, licensed custodians and real issuers.
              </h4>
              <p className="text-xs sm:text-sm text-[#8c867c] mt-1 max-w-xl">
                TokeEase is structured using standard ERC-20 smart contract interfaces with on-chain KYC checks, Remix deployment, and non-custodial MetaMask integration.
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 lg:max-w-md">
              {techBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 text-[#c4beb3] border border-white/10 hover:border-amber-500/30 transition-colors"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
