"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Asset } from "../lib/types";
import { inrToTokens, formatInr, formatEth } from "../lib/format";
import { RiskModal } from "./RiskModal";

interface AssetModalProps {
  asset: Asset | null;
  onClose: () => void;
  onSimulatedBuy: (asset: Asset, tokens: number, costInr: number) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  asset,
  onClose,
  onSimulatedBuy,
}) => {
  const [mode, setMode] = useState<"inr" | "tokens">("inr");
  const [inrAmount, setInrAmount] = useState<number>(asset?.priceInr ? asset.priceInr * 10 : 5000);
  const [tokenCount, setTokenCount] = useState<number>(10);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [simulatedTxHash, setSimulatedTxHash] = useState<string>("");
  const [isRiskModalOpen, setIsRiskModalOpen] = useState<boolean>(false);

  if (!asset) return null;

  // Pricing calculations
  const priceWei = asset.pricePerTokenWei;
  const inrResult = inrToTokens(inrAmount, priceWei);
  
  const tokensToBuy = mode === "inr" ? Number(inrResult.tokens) : tokenCount;
  const totalCostWei = BigInt(tokensToBuy) * priceWei;
  const totalCostInr = tokensToBuy * asset.priceInr;
  const leftoverInr = mode === "inr" ? inrResult.leftoverInr : 0;
  const formattedEth = formatEth(totalCostWei, 6);

  const presets = asset.type === "Gold" 
    ? [150, 450, 1500, 3000, 7500] 
    : [500, 1500, 5000, 10000, 25000];

  const handleConfirmPurchase = () => {
    if (tokensToBuy <= 0) return;
    const randomHash = `0x${Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;
    setSimulatedTxHash(randomHash);
    setPurchaseSuccess(true);
    onSimulatedBuy(asset, tokensToBuy, totalCostInr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#130f0d] border border-amber-500/30 shadow-2xl shadow-black/90 p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#8e887d] hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {purchaseSuccess ? (
          <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Simulated Transaction Confirmed
              </span>
              <h3 className="text-2xl font-semibold text-[#f6f5f0]">
                {tokensToBuy} {asset.symbol} Tokens Minted
              </h3>
              {asset.type === "Gold" && (
                <p className="text-sm font-mono text-amber-400">
                  Equivalent to {(tokensToBuy * 0.01).toFixed(2)} grams of gold
                </p>
              )}
              <p className="text-sm text-[#9a9489] max-w-md mx-auto">
                Your simulated purchase of {formatInr(totalCostInr)} ({formattedEth}) was signed and minted on the Sepolia testnet sandbox.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0d0a08] border border-white/5 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[#817b71]">
                <span>Status</span>
                <span className="text-emerald-400">Success (Block #6,928,114)</span>
              </div>
              <div className="flex justify-between text-[#817b71]">
                <span>Tx Hash</span>
                <span className="text-[#f6f5f0] truncate max-w-[200px] sm:max-w-[280px]">
                  {simulatedTxHash}
                </span>
              </div>
              <div className="flex justify-between text-[#817b71]">
                <span>Network</span>
                <span className="text-amber-400">Sepolia Testnet (Chain ID 11155111)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setPurchaseSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors"
              >
                Back to Catalogue
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto space-y-6 pr-1">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  {asset.symbol}
                </span>
                <span className="text-xs text-[#8e887d]">
                  {asset.typeLabel} · ERC-20
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-[#f6f5f0]">
                {asset.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#969085] mt-1.5 leading-relaxed">
                {asset.description}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsRiskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain Risk (AI)</span>
                </button>
                <Link
                  href={`/assets/${asset.symbol.toLowerCase()}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#d6d0c4] border border-white/10 transition-colors"
                >
                  <span>Full Asset Page & Market</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Asset Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0c0908] border border-white/5 text-xs">
              <div>
                <span className="text-[#787268] text-[10px] uppercase font-mono">
                  Asset Location / Unit
                </span>
                <div className="text-[#eae6dd] font-medium mt-0.5">
                  {asset.assetLocation}
                </div>
              </div>
              <div>
                <span className="text-[#787268] text-[10px] uppercase font-mono">
                  Price Per Token
                </span>
                <div className="text-amber-400 font-semibold font-mono mt-0.5">
                  {formatInr(asset.priceInr)} ({asset.priceEth})
                </div>
              </div>
              <div>
                <span className="text-[#787268] text-[10px] uppercase font-mono">
                  Tokens Remaining
                </span>
                <div className="text-[#eae6dd] font-mono mt-0.5">
                  {asset.primarySaleRemaining.toLocaleString("en-IN")} of {asset.totalSupply.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span className="text-[#787268] text-[10px] uppercase font-mono">
                  Highlight
                </span>
                <div className="text-[#eae6dd] font-medium mt-0.5">
                  {asset.highlight}
                </div>
              </div>
            </div>

            {/* Interactive Buy Panel */}
            <div className="p-4 rounded-xl bg-amber-950/10 border border-amber-500/25 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Buy Tokens
                </span>

                {/* INR | Tokens toggle */}
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("inr")}
                    className={`px-2.5 py-1 rounded font-medium transition-all ${
                      mode === "inr"
                        ? "bg-amber-500 text-stone-950 font-semibold"
                        : "text-[#8e887d] hover:text-white"
                    }`}
                  >
                    Enter INR
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("tokens")}
                    className={`px-2.5 py-1 rounded font-medium transition-all ${
                      mode === "tokens"
                        ? "bg-amber-500 text-stone-950 font-semibold"
                        : "text-[#8e887d] hover:text-white"
                    }`}
                  >
                    Enter Tokens
                  </button>
                </div>
              </div>

              {/* Presets in INR mode */}
              {mode === "inr" && (
                <div className="flex flex-wrap gap-2">
                  {presets.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setInrAmount(amt)}
                      type="button"
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                        inrAmount === amt
                          ? "bg-amber-500 text-stone-950 shadow-sm"
                          : "bg-white/5 text-[#c4beb3] hover:bg-white/10"
                      }`}
                    >
                      {formatInr(amt)}
                    </button>
                  ))}
                </div>
              )}

              {/* Input field */}
              {mode === "inr" ? (
                <div className="space-y-1">
                  <label className="text-xs text-[#8e887d] flex justify-between">
                    <span>Investment budget:</span>
                    <span className="font-mono text-white font-semibold">
                      {formatInr(inrAmount)}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={asset.priceInr}
                    step={asset.priceInr}
                    value={inrAmount}
                    onChange={(e) => setInrAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#0a0807] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#f6f5f0] focus:outline-none focus:border-amber-500/50"
                  />
                  {leftoverInr > 0 && (
                    <div className="text-[11px] text-amber-400/90 font-mono">
                      Leftover budget: {formatInr(leftoverInr)} (rounded down to whole tokens)
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs text-[#8e887d] flex justify-between">
                    <span>Number of tokens:</span>
                    <span className="font-mono text-white font-semibold">
                      {tokenCount} {asset.symbol}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={asset.primarySaleRemaining}
                    step={1}
                    value={tokenCount}
                    onChange={(e) => setTokenCount(Math.max(1, Math.min(asset.primarySaleRemaining, Number(e.target.value))))}
                    className="w-full bg-[#0a0807] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#f6f5f0] focus:outline-none focus:border-amber-500/50"
                  />
                  <div className="text-[11px] text-[#8e887d]">
                    Capped at primary sale remaining ({asset.primarySaleRemaining.toLocaleString("en-IN")} tokens).
                  </div>
                </div>
              )}

              {/* Live Result Row */}
              <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8e887d]">
                  Live Calculation
                </span>
                <div className="text-sm font-mono font-semibold text-[#f6f5f0] flex flex-wrap items-center gap-2">
                  <span>{formatInr(totalCostInr)}</span>
                  <span className="text-amber-400">=</span>
                  <span className="text-amber-300">{tokensToBuy} tokens</span>
                  <span className="text-amber-400">=</span>
                  <span className="text-emerald-400">{formattedEth}</span>
                </div>
                {asset.type === "Gold" && (
                  <div className="text-xs font-mono text-amber-400 pt-0.5">
                    Gold weight: {(tokensToBuy * 0.01).toFixed(2)} grams
                  </div>
                )}
                <div className="text-[10px] text-[#736e65]">
                  Demo conversion, not a real exchange rate.
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] text-[#787268] leading-tight">
                {asset.disclaimer}
              </div>
            </div>

            {/* Buy Action Button */}
            <div className="pt-2">
              <button
                onClick={handleConfirmPurchase}
                disabled={tokensToBuy <= 0}
                type="button"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Simulate Buy ({formattedEth})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-[#736e65] mt-2 font-mono">
                * Testnet transaction on Sepolia. No real funds or fiat currency involved.
              </p>
            </div>
          </div>
        )}
      </div>

      <RiskModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        asset={asset}
      />
    </div>
  );
};
