import React from "react";
import { Check, Scale } from "lucide-react";

export const ImpactStats: React.FC = () => {
  const stats = [
    {
      value: "₹150",
      label: "Minimum simulated ticket",
      subtext: "Gold at ₹150, others ₹500",
      glowColor: "from-amber-500/20 to-orange-500/5",
    },
    {
      value: "4",
      label: "Tokenised asset categories",
      subtext: "Real estate, Land plots, Gold, Bonds",
      glowColor: "from-amber-600/20 to-amber-500/5",
    },
    {
      value: "1",
      label: "Unified wallet",
      subtext: "Non-custodial testnet custody",
      glowColor: "from-orange-500/20 to-amber-600/5",
    },
    {
      value: "0",
      label: "Real funds involved",
      subtext: "Zero-risk financial sandbox",
      glowColor: "from-emerald-500/15 to-emerald-600/5",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Context & Editorial narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#a39e94]">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Democratising Asset Access</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f6f5f0] leading-[1.15]">
              Big assets.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Smaller starting points.
              </span>
            </h2>

            <p className="text-base text-[#a39e94] leading-relaxed">
              Historically, the most resilient asset classes—such as physical
              vaulted bullion, infrastructure bonds, and prime real estate—have
              demanded steep entry barriers. Minimum tickets are often too high for ordinary savers.
            </p>

            <p className="text-sm text-[#8c867c] leading-relaxed">
              TokeEase uses cryptographic token standards to split whole assets into
              fractional tokens. Each fraction retains proportional economic rights,
              projected yield, and underlying backing—allowing you to experiment,
              diversify, and learn in a controlled testnet environment.
            </p>

            {/* Prototype pledge box */}
            <div className="p-4 rounded-xl bg-[#14100e] border border-amber-900/30 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-[#b8b3a7] leading-relaxed">
                <strong className="text-white font-medium">Educational Playground:</strong>{" "}
                Practice position sizing, portfolio allocation, and yield calculations
                without risking hard-earned capital.
              </p>
            </div>
          </div>

          {/* Right Column: Statistics Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {stats.map((s, idx) => (
                <div
                  key={idx}
                  className="group relative p-6 sm:p-7 rounded-2xl bg-[#130f0d]/85 border border-amber-900/25 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/70 overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${s.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                    <span className="text-4xl sm:text-5xl font-mono font-semibold text-[#f6f5f0] tracking-tight group-hover:text-amber-300 transition-colors">
                      {s.value}
                    </span>

                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-[#eae6dd]">
                        {s.label}
                      </h3>
                      <p className="text-xs text-[#8e887d] mt-1 font-mono">
                        {s.subtext}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
