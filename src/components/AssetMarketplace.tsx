"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Contract, formatEther } from "ethers";
import { ASSETS, ASSET_ABI, FLAT_ADDRESS, getReadOnlyProvider } from "../lib/contract";
import { Asset } from "../lib/types";
import { formatInr } from "../lib/format";

interface AssetMarketplaceProps {
  onSelectAsset: (asset: Asset) => void;
}

export const AssetMarketplace: React.FC<AssetMarketplaceProps> = ({
  onSelectAsset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [flatStats, setFlatStats] = useState<{
    displayName: string;
    symbol: string;
    priceWei: bigint;
    priceEth: string;
    priceInr: number;
    totalSupply: number;
    primarySaleRemaining: number;
    loading: boolean;
  }>({
    displayName: "Jaipur Flat",
    symbol: "JFT",
    priceWei: BigInt("100000000000000"),
    priceEth: "0.0001 ETH",
    priceInr: 500,
    totalSupply: 10000,
    primarySaleRemaining: 10000,
    loading: true,
  });

  const categories = [
    { id: "all", label: "All Assets" },
    { id: "RealEstate", label: "Real Estate" },
  ];

  // Fetch real on-chain stats from Sepolia contract
  const fetchLiveContractData = useCallback(async () => {
    try {
      const provider = getReadOnlyProvider();
      const contract = new Contract(FLAT_ADDRESS, ASSET_ABI, provider);

      const [assetName, symbol, priceWei, totalSupply, remaining] =
        await Promise.all([
          contract.assetName().catch(() => ""),
          contract.symbol().catch(() => "JFT"),
          contract.pricePerTokenWei().catch(() => BigInt("100000000000000")),
          contract.totalSupply().catch(() => BigInt(10000)),
          contract.primarySaleRemaining().catch(() => BigInt(10000)),
        ]);

      // If contract's assetName is empty, hardcode 'Jaipur Flat'
      const displayName =
        assetName && typeof assetName === "string" && assetName.trim() !== ""
          ? assetName.trim()
          : "Jaipur Flat";

      const priceWeiBig = BigInt(priceWei.toString());
      const priceEthFloat = parseFloat(formatEther(priceWeiBig));
      const priceInr = Math.round((priceEthFloat / 0.0001) * 500);

      setFlatStats({
        displayName,
        symbol: symbol || "JFT",
        priceWei: priceWeiBig,
        priceEth: `${priceEthFloat} ETH`,
        priceInr,
        totalSupply: Number(totalSupply),
        primarySaleRemaining: Number(remaining),
        loading: false,
      });
    } catch (err) {
      console.warn("Failed fetching live contract stats:", err);
      setFlatStats((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchLiveContractData();
    const interval = setInterval(fetchLiveContractData, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveContractData]);

  const tokensSold = flatStats.totalSupply - flatStats.primarySaleRemaining;
  const soldPercentage =
    flatStats.totalSupply > 0
      ? Math.round((tokensSold / flatStats.totalSupply) * 100)
      : 0;

  // Build current Asset object for modal & navigation
  const currentAsset: Asset = {
    key: "jaipur-flat",
    symbol: flatStats.symbol,
    name: flatStats.displayName,
    type: "RealEstate",
    typeLabel: "Real Estate",
    description:
      "Fractional share in a prime 3BHK residential rental apartment located in Vaishali Nagar, Jaipur.",
    priceInr: flatStats.priceInr,
    priceEth: flatStats.priceEth,
    pricePerTokenWei: flatStats.priceWei,
    totalSupply: flatStats.totalSupply,
    primarySaleRemaining: flatStats.primarySaleRemaining,
    assetLocation: "Vaishali Nagar, Jaipur, Rajasthan",
    documentUri: `https://sepolia.etherscan.io/address/${FLAT_ADDRESS}`,
    highlight: "Earns rent",
    disclaimer:
      "Simulated rental yield. Fractional token deployed on Sepolia testnet at " +
      FLAT_ADDRESS +
      ".",
    address: FLAT_ADDRESS,
  };

  const isVisible =
    selectedCategory === "all" || selectedCategory === "RealEstate";

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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sepolia Live Contract</span>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f6f5f0]">
              Explore tokenised assets.
            </h2>
            <p className="text-sm sm:text-base text-[#9a9489] mt-2 max-w-xl">
              Inspect real-world testnet tokens with on-chain KYC enforcement. Prices read live from the deployed Sepolia smart contract.
            </p>
            <div className="text-[11px] font-mono text-[#787268] mt-1">
              * Demo conversion rate (1 ETH = ₹50,00,000). Contract: {FLAT_ADDRESS}
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

        {/* Live Asset Grid (Flat only) */}
        {isVisible && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <div className="group relative rounded-2xl bg-[#120f0d]/85 border border-amber-900/20 backdrop-blur-xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80">
              <div>
                {/* Top Bar: Icon, Symbol, Standard, and Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {currentAsset.symbol}
                        </span>
                        <span className="text-[10px] font-mono text-[#736e65]">
                          · ERC-20
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8e887d]">
                        {currentAsset.typeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Highlight Pill */}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25">
                    {currentAsset.highlight}
                  </span>
                </div>

                {/* Asset Title */}
                <h3 className="text-lg font-medium text-[#f6f5f0] group-hover:text-amber-200 transition-colors">
                  {currentAsset.name}
                </h3>

                {/* One-line Description */}
                <p className="text-xs text-[#958f84] mt-1.5 line-clamp-2 leading-relaxed">
                  {currentAsset.description}
                </p>

                {/* Price per token in INR and ETH */}
                <div className="mt-5 p-3 rounded-xl bg-[#0d0a08]/70 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#817b71]">
                      Price per token (Live Contract)
                    </span>
                    {flatStats.loading && (
                      <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                    )}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-[#f6f5f0]">
                      {formatInr(currentAsset.priceInr)}
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-semibold">
                      {currentAsset.priceEth}
                    </span>
                  </div>
                </div>

                {/* Tokens Sold Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#817b71]">Tokens remaining (On-chain)</span>
                    <span className="font-mono text-[#eae6dd]">
                      {currentAsset.primarySaleRemaining.toLocaleString("en-IN")}{" "}
                      <span className="text-[#736e65]">
                        / {currentAsset.totalSupply.toLocaleString("en-IN")}
                      </span>
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
                  {currentAsset.disclaimer}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] text-[#736e65] font-mono">
                  1 token minimum
                </div>

                <Link
                  href={`/assets/${currentAsset.symbol}`}
                  onClick={(e) => {
                    if (onSelectAsset) {
                      e.preventDefault();
                      onSelectAsset(currentAsset);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 group/btn transition-all"
                >
                  <span>View & Buy</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Global Catalog Disclaimer Bar */}
        <div className="mt-8 p-3 rounded-xl bg-[#110e0c]/60 border border-amber-900/20 text-center text-xs text-[#817b71] font-mono">
          <span>* Connected to deployed Sepolia Contract ({FLAT_ADDRESS}). KYC enforcement is live via KycRegistry.</span>
        </div>
      </div>
    </section>
  );
};
