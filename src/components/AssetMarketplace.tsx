"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Coins,
  FileText,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { MOCK_ASSETS } from "../data/mockData";
import { Asset } from "../lib/types";
import { formatInr } from "../lib/format";

interface AssetMarketplaceProps {
  onSelectAsset: (asset: Asset) => void;
}

function AssetIconBadge({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "Gold":
      return <Coins className={className} />;
    case "Bond":
      return <FileText className={className} />;
    case "Plot":
      return <MapPin className={className} />;
    case "RealEstate":
    default:
      return <Building2 className={className} />;
  }
}

export const AssetMarketplace: React.FC<AssetMarketplaceProps> = ({
  onSelectAsset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Assets" },
    { id: "RealEstate", label: "Real Estate" },
    { id: "Plot", label: "Land Plots" },
    { id: "Gold", label: "Gold" },
    { id: "Bond", label: "Bonds" },
  ];

  const filteredAssets =
    selectedCategory === "all"
      ? MOCK_ASSETS
      : MOCK_ASSETS.filter((a) => a.type === selectedCategory);

  return (
    <section id="marketplace" className="relative py-24 md:py-32 scroll-mt-20">
      {/* Background ambient light */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-amber-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Filter Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase tracking-widest text-amber-400">
                <span>ASSET CATALOGUE</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25">
                Sample data, contracts not connected yet
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f6f5f0]">
              Explore tokenised assets.
            </h2>
            <p className="text-sm sm:text-base text-[#9a9489] mt-2 max-w-xl">
              Inspect real-world testnet tokens with on-chain KYC enforcement. Prices displayed in Indian Rupees (₹) and Sepolia test ETH.
            </p>
            <div className="text-[11px] font-mono text-[#787268] mt-1">
              * Demo conversion (1 ETH = ₹50,00,000), not a real exchange rate.
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14100e] border border-white/5 overflow-x-auto self-start md:self-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                type="button"
                className={`text-xs font-medium px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-[#8e887d] hover:text-[#f6f5f0]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 PRD Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {filteredAssets.map((asset) => {
            const tokensSold = asset.totalSupply - asset.primarySaleRemaining;
            const soldPercentage = Math.round((tokensSold / asset.totalSupply) * 100);

            return (
              <div
                key={asset.key}
                className="group relative rounded-2xl bg-[#120f0d]/85 border border-amber-900/20 backdrop-blur-xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80"
              >
                <div>
                  {/* Top Bar: Icon, Symbol, Standard, and Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <AssetIconBadge type={asset.type} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {asset.symbol}
                          </span>
                          <span className="text-[10px] font-mono text-[#736e65]">
                            · ERC-20
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8e887d]">
                          {asset.typeLabel}
                        </span>
                      </div>
                    </div>

                    {/* Highlight Pill */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25">
                      {asset.highlight}
                    </span>
                  </div>

                  {/* Asset Title */}
                  <h3 className="text-lg font-medium text-[#f6f5f0] group-hover:text-amber-200 transition-colors">
                    {asset.name}
                  </h3>

                  {/* One-line Description */}
                  <p className="text-xs text-[#958f84] mt-1.5 line-clamp-2 leading-relaxed">
                    {asset.description}
                  </p>

                  {/* Price per token in INR and ETH */}
                  <div className="mt-5 p-3 rounded-xl bg-[#0d0a08]/70 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#817b71]">
                      Price per token
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold text-[#f6f5f0]">
                        {formatInr(asset.priceInr)}
                      </span>
                      <span className="text-xs font-mono text-amber-400 font-semibold">
                        {asset.priceEth}
                      </span>
                    </div>

                    {/* Bond Current Yield if applicable */}
                    {asset.currentYield && (
                      <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[#8e887d] text-[11px]">Current Yield:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {asset.currentYield}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tokens Sold Progress Bar (Tokens Remaining, not dollar amounts) */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#817b71]">Tokens remaining</span>
                      <span className="font-mono text-[#eae6dd]">
                        {asset.primarySaleRemaining.toLocaleString("en-IN")}{" "}
                        <span className="text-[#736e65]">/ {asset.totalSupply.toLocaleString("en-IN")}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${100 - soldPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Disclaimer */}
                  <div className="mt-4 p-2.5 rounded-lg bg-black/20 border border-white/5 text-[10px] text-[#7d786e] leading-snug">
                    {asset.disclaimer}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[10px] text-[#736e65] font-mono">
                    {asset.unitText ? `1 unit = ${asset.unitText}` : "1 token minimum"}
                  </div>

                  <Link
                    href={`/assets/${asset.symbol}`}
                    onClick={(e) => {
                      if (onSelectAsset) {
                        e.preventDefault();
                        onSelectAsset(asset);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 group/btn transition-all"
                  >
                    <span>View asset</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Catalog Disclaimer Bar */}
        <div className="mt-8 p-3 rounded-xl bg-[#110e0c]/60 border border-amber-900/20 text-center text-xs text-[#817b71] font-mono">
          <span>* All token prices are computed in test ETH and displayed in INR using the demo rate (1 ETH = ₹50,00,000). Real contracts connect in Phase 3.</span>
        </div>
      </div>
    </section>
  );
};
