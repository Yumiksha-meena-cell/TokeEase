"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RotateCw,
  AlertTriangle,
} from "lucide-react";
import { Contract } from "ethers";
import { toast } from "sonner";
import { Asset } from "../lib/types";
import { inrToTokens, formatInr, formatEth } from "../lib/format";
import { RiskModal } from "./RiskModal";
import { useWallet } from "../context/WalletContext";
import { ASSET_ABI, FLAT_ADDRESS } from "../lib/contract";
import { getFriendlyErrorMessage } from "../lib/errors";

interface AssetModalProps {
  asset: Asset | null;
  onClose: () => void;
  onSimulatedBuy?: (asset: Asset, tokens: number, costInr: number) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  asset,
  onClose,
  onSimulatedBuy,
}) => {
  const {
    isConnected,
    isCorrectNetwork,
    signer,
    kycStatus,
    connect,
    switchToSepolia,
    refreshState,
  } = useWallet();

  const [mode, setMode] = useState<"inr" | "tokens">("inr");
  const [inrAmount, setInrAmount] = useState<number>(
    asset?.priceInr ? asset.priceInr * 10 : 5000
  );
  const [tokenCount, setTokenCount] = useState<number>(10);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [isBuying, setIsBuying] = useState<boolean>(false);
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

  const presets = [500, 1500, 5000, 10000, 25000];

  const handleConfirmPurchase = async () => {
    if (tokensToBuy <= 0) return;

    if (!isConnected) {
      toast.info("Please connect your MetaMask wallet first.");
      connect();
      return;
    }

    if (!isCorrectNetwork) {
      toast.error("Please switch your wallet network to Sepolia testnet.");
      switchToSepolia();
      return;
    }

    if (kycStatus !== "Approved") {
      toast.error("This wallet is not KYC verified yet.");
      return;
    }

    if (!signer) {
      toast.error("Signer not ready. Please check MetaMask.");
      return;
    }

    setIsBuying(true);
    try {
      toast.info("Waiting for MetaMask signature...");
      const targetAddress = asset.address || FLAT_ADDRESS;
      const contract = new Contract(targetAddress, ASSET_ABI, signer);

      const tx = await contract.buy(tokensToBuy, { value: totalCostWei });
      toast.info("Transaction sent to Sepolia! Waiting for confirmation...");
      const receipt = await tx.wait();

      const finalHash = receipt?.hash || tx.hash;
      setTxHash(finalHash);
      setPurchaseSuccess(true);
      toast.success(
        `Successfully bought ${tokensToBuy} ${asset.symbol} tokens on Sepolia!`
      );

      if (onSimulatedBuy) {
        onSimulatedBuy(asset, tokensToBuy, totalCostInr);
      }
      refreshState();
    } catch (err: unknown) {
      console.error("Buy error:", err);
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsBuying(false);
    }
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
                Transaction Confirmed on Sepolia
              </span>
              <h3 className="text-2xl font-semibold text-[#f6f5f0]">
                {tokensToBuy} {asset.symbol} Tokens Purchased
              </h3>
              <p className="text-sm text-[#9a9489] max-w-md mx-auto">
                Your on-chain purchase of {formatInr(totalCostInr)} ({formattedEth}) was executed against the real AssetToken smart contract.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0d0a08] border border-white/5 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[#817b71]">
                <span>Status</span>
                <span className="text-emerald-400">Success (On-chain)</span>
              </div>
              <div className="flex justify-between items-center text-[#817b71]">
                <span>Tx Hash</span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 truncate max-w-[200px] sm:max-w-[280px]"
                >
                  <span className="truncate">{txHash}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
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
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Sepolia Live Contract
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
                  <span>Full Asset Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Price & Primary Sale Bar */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#0d0a08] border border-white/5 text-xs">
              <div>
                <span className="text-[#817b71] uppercase tracking-wider text-[10px]">
                  Price per token
                </span>
                <div className="text-base font-semibold text-[#f6f5f0] mt-0.5">
                  {formatInr(asset.priceInr)}{" "}
                  <span className="text-amber-400 font-mono text-xs">
                    ({asset.priceEth})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[#817b71] uppercase tracking-wider text-[10px]">
                  Primary Remaining
                </span>
                <div className="text-base font-mono font-semibold text-[#f6f5f0] mt-0.5">
                  {asset.primarySaleRemaining.toLocaleString("en-IN")}{" "}
                  <span className="text-[#736e65] text-xs">
                    / {asset.totalSupply.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning if wallet not approved */}
            {isConnected && kycStatus !== "Approved" && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-200">
                    This wallet is not KYC verified yet.
                  </div>
                  <div className="text-[11px] text-rose-300/80 mt-0.5">
                    The smart contract strictly prevents unverified wallets from receiving or buying tokens. Please submit KYC to proceed.
                  </div>
                </div>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase font-mono tracking-wider text-[#8e887d]">
                  Purchase Mode
                </label>
                <div className="inline-flex rounded-lg bg-black/40 p-1 border border-white/5">
                  <button
                    type="button"
                    onClick={() => setMode("inr")}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${
                      mode === "inr"
                        ? "bg-amber-500/20 text-amber-300 font-semibold"
                        : "text-[#8e887d] hover:text-white"
                    }`}
                  >
                    INR Budget (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("tokens")}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${
                      mode === "tokens"
                        ? "bg-amber-500/20 text-amber-300 font-semibold"
                        : "text-[#8e887d] hover:text-white"
                    }`}
                  >
                    Token Count
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#817b71]">Quick Select:</span>
                <div className="flex flex-wrap gap-2">
                  {presets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        if (mode === "inr") {
                          setInrAmount(val);
                        } else {
                          const tks = Math.floor(val / asset.priceInr);
                          setTokenCount(Math.max(1, tks));
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/10 text-xs font-mono text-[#d6d0c4] hover:text-amber-300 border border-white/5 hover:border-amber-500/30 transition-all"
                    >
                      {formatInr(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Slider / Field */}
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
                    onChange={(e) =>
                      setTokenCount(
                        Math.max(1, Math.min(asset.primarySaleRemaining, Number(e.target.value)))
                      )
                    }
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
                <div className="text-[10px] text-[#736e65]">
                  Live rate from Sepolia contract. 1 ETH = ₹50,00,000 demo conversion.
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
                disabled={tokensToBuy <= 0 || isBuying}
                type="button"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isBuying ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Signing & Confirming on Sepolia...</span>
                  </>
                ) : (
                  <>
                    <span>Buy on Sepolia ({formattedEth})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-[#736e65] mt-2 font-mono">
                * Real testnet contract buy on Sepolia ({FLAT_ADDRESS}).
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
