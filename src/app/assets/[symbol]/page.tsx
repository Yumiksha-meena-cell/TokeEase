"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Coins,
  FileText,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Tag,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Contract } from "ethers";
import { MOCK_ASSETS } from "../../../data/mockData";
import { inrToTokens, formatInr, formatEth, shortAddress } from "../../../lib/format";
import { useWallet } from "../../../context/WalletContext";
import { ASSET_ABI, ASSETS, FLAT_ADDRESS, getReadOnlyProvider, isZeroAddress } from "../../../lib/contract";
import { formatEther } from "ethers";
import { getFriendlyErrorMessage } from "../../../lib/errors";
import { PriceChart } from "../../../components/PriceChart";
import { RiskModal } from "../../../components/RiskModal";
import { KycModal } from "../../../components/KycModal";
import { WalletModal } from "../../../components/WalletModal";
import { MarketplaceSection } from "../../../components/MarketplaceSection";

interface AssetDetailPageProps {
  params: Promise<{ symbol: string }>;
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

function AssetDetailContent({ params }: AssetDetailPageProps) {
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol?.toUpperCase();
  const baseAsset = MOCK_ASSETS.find((a) => a.symbol.toUpperCase() === symbol) || MOCK_ASSETS[0];
  const contractAddress = FLAT_ADDRESS;

  const { isConnected, address, signer, kycStatus, refreshState } = useWallet();

  // Live on-chain asset data
  const [liveName, setLiveName] = useState<string>("Jaipur Flat");
  const [livePriceWei, setLivePriceWei] = useState<bigint>(baseAsset.pricePerTokenWei);
  const [liveTotalSupply, setLiveTotalSupply] = useState<number>(baseAsset.totalSupply);
  const [liveRemaining, setLiveRemaining] = useState<number>(baseAsset.primarySaleRemaining);
  const [userTokenBalance, setUserTokenBalance] = useState<number>(0);

  // Fetch live on-chain data
  React.useEffect(() => {
    let active = true;
    const fetchLive = async () => {
      try {
        const provider = getReadOnlyProvider();
        const contract = new Contract(contractAddress, ASSET_ABI, provider);
        const [onChainName, onChainPrice, onChainSupply, onChainRemaining] = await Promise.all([
          contract.assetName().catch(() => ""),
          contract.pricePerTokenWei().catch(() => BigInt("100000000000000")),
          contract.totalSupply().catch(() => BigInt(10000)),
          contract.primarySaleRemaining().catch(() => BigInt(10000)),
        ]);

        if (!active) return;
        const displayName =
          onChainName && typeof onChainName === "string" && onChainName.trim() !== ""
            ? onChainName.trim()
            : "Jaipur Flat";

        setLiveName(displayName);
        setLivePriceWei(BigInt(onChainPrice.toString()));
        setLiveTotalSupply(Number(onChainSupply));
        setLiveRemaining(Number(onChainRemaining));

        if (address) {
          const bal = await contract.balanceOf(address).catch(() => BigInt(0));
          if (active) setUserTokenBalance(Number(bal));
        }
      } catch (err) {
        console.warn("Could not fetch live contract state:", err);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 12000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [contractAddress, address]);

  const priceEthFloat = parseFloat(formatEther(livePriceWei));
  const priceInr = Math.round((priceEthFloat / 0.0001) * 500);

  const asset: typeof baseAsset = {
    ...baseAsset,
    name: liveName,
    pricePerTokenWei: livePriceWei,
    priceInr,
    priceEth: `${priceEthFloat} ETH`,
    totalSupply: liveTotalSupply,
    primarySaleRemaining: liveRemaining,
    address: contractAddress,
  };

  const [mode, setMode] = useState<"inr" | "tokens">("inr");
  const [inrAmount, setInrAmount] = useState<number>(asset.priceInr * 10);
  const [tokenCount, setTokenCount] = useState<number>(10);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [simulatedTxHash, setSimulatedTxHash] = useState<string>("");
  const [isBuying, setIsBuying] = useState<boolean>(false);

  // Modals state
  const [isRiskModalOpen, setIsRiskModalOpen] = useState<boolean>(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  // Math calculations
  const priceWei = asset.pricePerTokenWei;
  const inrResult = inrToTokens(inrAmount, priceWei);
  const tokensToBuy = mode === "inr" ? Number(inrResult.tokens) : tokenCount;
  const totalCostWei = BigInt(tokensToBuy) * priceWei;
  const totalCostInr = tokensToBuy * asset.priceInr;
  const leftoverInr = mode === "inr" ? inrResult.leftoverInr : 0;
  const formattedEthCost = formatEth(totalCostWei, 6);

  const presets = [500, 1500, 5000, 10000, 25000];

  const tokensSold = asset.totalSupply - asset.primarySaleRemaining;
  const soldPercentage = Math.round((tokensSold / asset.totalSupply) * 100);

  // Execute on-chain buy with MetaMask signer
  const handleBuyTokens = async () => {
    if (tokensToBuy <= 0) return;

    if (!isConnected) {
      setIsWalletModalOpen(true);
      toast.info("Please connect your wallet first.");
      return;
    }

    // Friendly error check: unverified wallet cannot buy
    if (kycStatus !== "Approved") {
      toast.error("This wallet is not KYC verified yet.");
      setIsKycModalOpen(true);
      return;
    }

    if (!signer) {
      toast.error("Signer not ready. Please check MetaMask.");
      return;
    }

    setIsBuying(true);
    try {
      toast.info("Waiting for MetaMask signature...");
      const assetContract = new Contract(contractAddress, ASSET_ABI, signer);
      const tx = await assetContract.buy(tokensToBuy, { value: totalCostWei });
      toast.info("Transaction sent to Sepolia! Minting tokens...");
      const receipt = await tx.wait();
      setSimulatedTxHash(receipt?.hash || tx.hash);
      setPurchaseSuccess(true);
      toast.success(`Successfully bought ${tokensToBuy} ${asset.symbol} tokens!`);
      refreshState();
    } catch (err: unknown) {
      console.error("Buy error:", err);
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080706] text-[#f6f5f0] py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between">
          <Link
            href="/#marketplace"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#8e887d] hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Asset Catalogue</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRiskModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all shadow-sm shadow-amber-500/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain Risk (AI)</span>
            </button>

            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/5 text-[#8e887d] border border-white/10 hidden sm:inline-block">
              Sepolia Testnet
            </span>
          </div>
        </div>

        {/* Top Asset Identity Card */}
        <div className="relative rounded-3xl bg-[#120f0d]/90 border border-amber-900/30 backdrop-blur-2xl p-6 sm:p-10 overflow-hidden shadow-2xl shadow-black/80">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <AssetIconBadge type={asset.type} className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/25">
                    {asset.symbol}
                  </span>
                  <span className="text-xs font-mono text-[#8e887d]">ERC-20</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#a8a295]">
                    {asset.typeLabel}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f6f5f0]">
                  {asset.name}
                </h1>
                <p className="text-sm text-[#958f84] mt-1.5 max-w-xl leading-relaxed">
                  {asset.description}
                </p>
              </div>
            </div>

            <div className="lg:text-right">
              <span className="text-[11px] uppercase font-mono tracking-wider text-[#817b71]">
                Token Price
              </span>
              <div className="text-3xl font-bold text-[#f6f5f0] mt-0.5 font-mono">
                {formatInr(asset.priceInr)}
              </div>
              <div className="text-sm font-mono text-amber-400 font-semibold">
                {asset.priceEth}
              </div>
              <span className="text-[10px] text-[#736e65]">Demo conversion, not a real exchange rate.</span>
            </div>
          </div>

          {/* Asset Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-white/5 text-xs">
            <div className="p-3 rounded-xl bg-[#0c0908] border border-white/5">
              <span className="text-[#817b71] uppercase font-mono text-[10px]">
                {asset.type === "Gold" ? "Unit Text" : "Asset Location"}
              </span>
              <div className="text-[#eae6dd] font-medium mt-1">
                {asset.assetLocation}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0c0908] border border-white/5">
              <span className="text-[#817b71] uppercase font-mono text-[10px]">
                Highlight
              </span>
              <div className="text-amber-400 font-semibold font-mono mt-1">
                {asset.highlight}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0c0908] border border-white/5">
              <span className="text-[#817b71] uppercase font-mono text-[10px]">
                Tokens Remaining
              </span>
              <div className="text-[#eae6dd] font-mono mt-1">
                {asset.primarySaleRemaining.toLocaleString("en-IN")}{" "}
                <span className="text-[#736e65]">/ {asset.totalSupply.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0c0908] border border-white/5">
              <span className="text-[#817b71] uppercase font-mono text-[10px]">
                Document Proof
              </span>
              <div className="mt-1">
                <a
                  href={asset.documentUri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 text-xs"
                >
                  <span>View Contract</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Tokens Sold Progress Bar */}
          <div className="py-6 border-b border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#817b71]">Tokens Sold Progress</span>
              <span className="font-mono text-[#eae6dd]">
                {tokensSold.toLocaleString("en-IN")} sold ({soldPercentage}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
          </div>

          {/* Extra section for Bond or Gold */}
          {asset.type === "Gold" && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono space-y-1 my-6">
              <div className="text-amber-300 font-semibold">1 token = 0.01 g (Simulated gold unit)</div>
              <div className="text-[#9a9489]">Simulated gold rate, not a live price. Prototype only. No physical gold is stored.</div>
            </div>
          )}

          {asset.type === "Bond" && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono space-y-1.5 my-6">
              <div className="text-amber-300 font-semibold flex items-center justify-between">
                <span>Sample Bond: 8% Annual Coupon</span>
                <span className="text-emerald-400">Current Yield: {asset.currentYield || "8.0%"}</span>
              </div>
              <div className="text-[#9a9489]">
                Face value: 0.0001 ETH (₹500). Annual coupon: 0.000008 ETH per token. Sample bond for demo. Not a real issuer, rating or security.
              </div>
            </div>
          )}

          {/* Price History Line Chart (PRD F9) */}
          <div className="my-6 p-5 rounded-2xl bg-[#0c0908] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono uppercase text-[#eae6dd] font-semibold">
                  Price History & Valuation Performance
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#817b71]">
                On-Chain Recorded Trend
              </span>
            </div>
            <PriceChart symbol={asset.symbol} />
          </div>

          {/* KYC Compliance Status Warning (PRD F6) */}
          {isConnected && kycStatus !== "Approved" && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 font-semibold">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>KYC Approval Required Before Buying</span>
                </div>
                <button
                  onClick={() => setIsKycModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-colors"
                >
                  Verify Now (Free)
                </button>
              </div>
              <p className="text-[#c4beb3] text-[11px] leading-relaxed">
                Smart contract enforcement is active: the AssetToken contract will automatically revert any transfer to an unverified wallet. Complete the one-time demo KYC to unlock this asset.
              </p>
            </div>
          )}

          {/* Interactive Buy Panel */}
          <div className="mt-8 p-6 rounded-2xl bg-[#0c0908] border border-amber-500/25 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Buy {asset.symbol} Tokens (Primary Sale)
              </span>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("inr")}
                  className={`px-3 py-1 rounded font-medium transition-all ${
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
                  className={`px-3 py-1 rounded font-medium transition-all ${
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

            {/* Input Field */}
            {mode === "inr" ? (
              <div className="space-y-1">
                <label className="text-xs text-[#8e887d] flex justify-between">
                  <span>Investment budget (INR):</span>
                  <span className="font-mono text-white font-semibold">{formatInr(inrAmount)}</span>
                </label>
                <input
                  type="number"
                  min={asset.priceInr}
                  step={asset.priceInr}
                  value={inrAmount}
                  onChange={(e) => setInrAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#14100e] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-[#f6f5f0] focus:outline-none focus:border-amber-500/50"
                />
                {leftoverInr > 0 && (
                  <div className="text-[11px] text-amber-400 font-mono">
                    Leftover: {formatInr(leftoverInr)} (rounded down to whole tokens)
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
                  className="w-full bg-[#14100e] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-[#f6f5f0] focus:outline-none focus:border-amber-500/50"
                />
              </div>
            )}

            {/* Live Calculation Row */}
            <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#8e887d]">
                Live Calculation
              </span>
              <div className="text-base font-mono font-semibold text-[#f6f5f0] flex flex-wrap items-center gap-2">
                <span>{formatInr(totalCostInr)}</span>
                <span className="text-amber-400">=</span>
                <span className="text-amber-300">{tokensToBuy} tokens</span>
                <span className="text-amber-400">=</span>
                <span className="text-emerald-400">{formattedEthCost}</span>
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

            {/* Action Button */}
            <div>
              {purchaseSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Purchase Confirmed!</span>
                  </div>
                  <div className="text-[#c4beb3]">
                    Purchased {tokensToBuy} {asset.symbol} tokens for {formatInr(totalCostInr)} ({formattedEthCost}).
                  </div>
                  <div className="text-[10px] text-[#787268] truncate">
                    Tx Hash: {simulatedTxHash}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBuyTokens}
                  disabled={tokensToBuy <= 0 || isBuying}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>
                    {isBuying
                      ? "Executing Transaction..."
                      : isConnected
                      ? `Buy ${tokensToBuy} Tokens (${formattedEthCost})`
                      : "Connect Wallet to Buy"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Card Disclaimer */}
            <div className="flex items-start gap-2 pt-2 text-[11px] text-[#787268]">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-amber-500/70 mt-0.5" />
              <span>{asset.disclaimer}</span>
            </div>
          </div>

          {/* Peer-to-Peer Marketplace Section (PRD F11) */}
          <div className="mt-8">
            <MarketplaceSection
              assetSymbol={asset.symbol}
              assetAddress={contractAddress}
              onOpenKycModal={() => setIsKycModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <RiskModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        asset={asset}
      />

      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        onKycComplete={() => {
          toast.success("KYC submission registered! Ready for admin verification.");
        }}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#080706] text-amber-400 p-8 font-mono flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Loading asset details...</span>
          </div>
        </div>
      }
    >
      <AssetDetailContent params={params} />
    </React.Suspense>
  );
}
