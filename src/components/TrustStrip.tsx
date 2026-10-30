import React from "react";
import { Coins, KeyRound, ShieldCheck, Sparkles } from "lucide-react";

export const TrustStrip: React.FC = () => {
  const items = [
    {
      icon: Coins,
      title: "Fractional ownership",
      desc: "Start from ₹150",
    },
    {
      icon: KeyRound,
      title: "Secure wallet",
      desc: "Your keys, your control",
    },
    {
      icon: ShieldCheck,
      title: "Testnet ready",
      desc: "Learn without risk",
    },
    {
      icon: Sparkles,
      title: "Plain-language insights",
      desc: "Understand every asset",
    },
  ];

  return (
    <section className="relative border-y border-amber-900/20 bg-[#0d0a08]/80 backdrop-blur-md py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3.5 group p-2 rounded-lg transition-colors hover:bg-white/[0.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:border-amber-500/40 group-hover:text-amber-300 transition-colors flex-shrink-0">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-medium text-[#f0ede6] tracking-tight">
                    {item.title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#8e897e] mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
