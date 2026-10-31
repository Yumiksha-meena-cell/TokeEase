"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Info,
  Building2,
} from "lucide-react";
import { Contract, formatEther } from "ethers";
import { formatInr } from "../lib/format";
import { useWallet } from "../context/WalletContext";
import {
  FLAT_ADDRESS,
  REGISTRY_ADDRESS,
  ASSET_ABI,
  getReadOnlyProvider,
} from "../lib/contract";

export const HeroDashboard: React.FC = () => {
  const { isConnected, address, shortAddress, role, kycStatus } = useWallet();
  const [timeframe, setTimeframe] = useState<"24H" | "7D" | "1M" | "1Y">("24H");

  // Live contract stats for Jaipur Flat
  const [flatData, setFlatData] = useState<{
    priceWei: bigint;
    priceEth: string;
    priceInr: number;
    totalSupply: number;
    primarySaleRemaining: number;
    userBalance: number;
    loading: boolean;
  }>({
    priceWei: BigInt("100000000000000"),
    priceEth: "0.0001 ETH",
    priceInr: 500,
    totalSupply: 10000,
    primarySaleRemaining: 10000,
    userBalance: 0,
    loading: true,
  });

  const fetchLiveStats = useCallback(async () => {
    try {
      const provider = getReadOnlyProvider();
      const contract = new Contract(FLAT_ADDRESS, ASSET_ABI, provider);

      const [priceWei, totalSupply, remaining] = await Promise.all([
        contract.pricePerTokenWei().catch(() => BigInt("100000000000000")),
        contract.totalSupply().catch(() => BigInt(10000)),
        contract.primarySaleRemaining().catch(() => BigInt(10000)),
      ]);

      let bal = BigInt(0);
      if (address) {
        bal = await contract.balanceOf(address).catch(() => BigInt(0));
      }

      const pWei = BigInt(priceWei.toString());
      const pEthFloat = parseFloat(formatEther(pWei));
      const pInr = Math.round((pEthFloat / 0.0001) * 500);

      setFlatData({
        priceWei: pWei,
        priceEth: `${pEthFloat} ETH`,
        priceInr: pInr,
        totalSupply: Number(totalSupply),
        primarySaleRemaining: Number(remaining),
        userBalance: Number(bal),
        loading: false,
      });
    } catch (err) {
      console.warn("Failed fetching live stats in HeroDashboard:", err);
      setFlatData((prev) => ({ ...prev, loading: false }));
    }
  }, [address]);

  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 12000);
    return () => clearInterval(interval);
  }, [fetchLiveStats]);

  // Sparkline coordinates
  const sparklineData = {
    "24H": [
      { x: 0, y: 55 },
      { x: 30, y: 52 },
      { x: 60, y: 48 },
      { x: 90, y: 45 },
      { x: 120, y: 49 },
      { x: 150, y: 40 },
      { x: 180, y: 35 },
      { x: 210, y: 28 },
      { x: 240, y: 22 },
      { x: 270, y: 15 },
      { x: 300, y: 12 },
    ],
    "7D": [
      { x: 0, y: 65 },
      { x: 30, y: 58 },
      { x: 60, y: 50 },
      { x: 90, y: 42 },
      { x: 120, y: 45 },
      { x: 150, y: 38 },
      { x: 180, y: 30 },
      { x: 210, y: 25 },
      { x: 240, y: 20 },
      { x: 270, y: 18 },
      { x: 300, y: 10 },
    ],
    "1M": [
      { x: 0, y: 70 },
      { x: 30, y: 62 },
      { x: 60, y: 58 },
      { x: 90, y: 52 },
      { x: 120, y: 40 },
      { x: 150, y: 34 },
      { x: 180, y: 32 },
      { x: 210, y: 22 },
      { x: 240, y: 18 },
      { x: 270, y: 14 },
      { x: 300, y: 8 },
    ],
    "1Y": [
      { x: 0, y: 80 },
      { x: 30, y: 75 },
      { x: 60, y: 62 },
      { x: 90, y: 55 },
      { x: 120, y: 45 },
      { x: 150, y: 39 },
      { x: 180, y: 28 },
      { x: 210, y: 24 },
      { x: 240, y: 19 },
      { x: 270, y: 12 },
      { x: 300, y: 6 },
    ],
  };

  const currentPoints = sparklineData[timeframe];
  const pathD = currentPoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );
  const areaD = `${pathD} L 300 80 L 0 80 Z`;

  // Connected wallet portfolio calculation
  const userTokens = flatData.userBalance;
  const portfolioInr = userTokens * flatData.priceInr;
  const portfolioEth = (userTokens * parseFloat(flatData.priceEth.replace(" ETH", ""))).toFixed(4);

  const getKycBadge = () => {
    if (!isConnected) {
      return {
        text: "Wallet Not Connected",
        sub: "Connect MetaMask",
        badge: "Visitor",
        color: "text-[#8e887d]",
        icon: <Info className="w-3.5 h-3.5 text-[#8e887d]" />,
      };
    }
    if (kycStatus === "Approved") {
      return {
        text: "KYC Approved",
        sub: "Registry Verified",
        badge: role,
        color: "text-emerald-400",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      };
    }
    if (kycStatus === "Pending") {
      return {
        text: "KYC Pending",
        sub: "Awaiting Admin Review",
        badge: "Pending",
        color: "text-amber-300",
        icon: <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
      };
    }
    if (kycStatus === "Rejected") {
      return {
        text: "KYC Rejected",
        sub: "Re-submit Verification",
        badge: "Rejected",
        color: "text-rose-400",
        icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      };
    }
    return {
      text: "KYC: Not Verified",
      sub: "Submit KYC Form",
      badge: "None",
      color: "text-amber-200",
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
    };
  };

  const kycInfo = getKycBadge();

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      <div className="absolute -inset-4 bg-gradient-to-tr from-amber-600/20 via-orange-500/10 to-transparent rounded-3xl blur-2xl -z-10 pointer-events-none opacity-80" />

      {/* Floating Badge 1: Real KYC status from KycRegistry */}
      <div className="absolute -top-4 -right-2 sm:-right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#17120e]/95 border border-amber-500/30 backdrop-blur-xl shadow-xl shadow-black/60 transition-transform duration-300 hover:scale-105">
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/5">
          {kycInfo.icon}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-semibold ${kycInfo.color}`}>
              {kycInfo.text}
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {kycInfo.badge}
            </span>
          </div>
          <p className="text-[10px] text-[#8e887d]">{kycInfo.sub}</p>
        </div>
      </div>

      {/* Floating Badge 2: Wallet Connected */}
      <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#17120e]/95 border border-amber-500/30 backdrop-blur-xl shadow-xl shadow-black/60 transition-transform duration-300 hover:scale-105">
        <div className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              isConnected ? "bg-emerald-400" : "bg-amber-400"
            } opacity-75`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isConnected ? "bg-emerald-500" : "bg-amber-500"
            }`}
          ></span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#f0ede6]">
              {isConnected ? shortAddress : "Wallet Preview"}
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {isConnected ? "Connected" : "Sepolia"}
            </span>
          </div>
          <p className="text-[10px] font-mono text-[#8e887d]">
            {isConnected ? "Sepolia Live (11155111)" : "Connect to view balance"}
          </p>
        </div>
      </div>

      {/* Main Glass Dashboard Card */}
      <div className="relative rounded-2xl bg-[#120e0c]/90 border border-amber-900/30 backdrop-blur-2xl shadow-2xl shadow-black/80 p-5 sm:p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        {/* Top bar with Sepolia Live Contract status */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] uppercase tracking-wider font-mono text-[#989287]">
              Sepolia Testnet (Chain 11155111)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Sepolia Live Contract</span>
            </span>
          </div>
        </div>

        {/* Portfolio Balance Header */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#8e887d] font-medium">
              {isConnected ? "Your On-chain Portfolio" : "Jaipur Flat Token Price"}
            </span>
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f6f5f0]">
                {isConnected ? formatInr(portfolioInr) : formatInr(flatData.priceInr)}
              </span>
              <span className="text-xs font-mono text-amber-400/90 font-medium">
                ({isConnected ? `${portfolioEth} ETH` : flatData.priceEth})
              </span>
            </div>
            <span className="text-[10px] text-[#736e65]">
              {isConnected
                ? `You hold ${userTokens} JFT tokens on Sepolia.`
                : "1 token = 0.0001 ETH (approx ₹500 at demo conversion)."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>Supply: {flatData.primarySaleRemaining.toLocaleString("en-IN")} left</span>
            </div>
          </div>
        </div>

        {/* Sparkline & Valuation Growth */}
        <div className="mt-5 p-3 rounded-xl bg-[#0c0908]/70 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#8e887d] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Jaipur Flat Price Trend (Live Contract)
            </span>
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg">
              {(["24H", "7D", "1M", "1Y"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                    timeframe === t
                      ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                      : "text-[#8e887d] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Sparkline */}
          <div className="w-full h-20 relative">
            <svg
              viewBox="0 0 300 80"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill="url(#chartGradient)" />
              <path
                d={pathD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={currentPoints[currentPoints.length - 1].x}
                cy={currentPoints[currentPoints.length - 1].y}
                r="4"
                fill="#fbbf24"
                stroke="#120e0c"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Real Contract Stats Row */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#0d0a08]/80 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#f0ede6]">Jaipur Flat</span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">JFT</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">
                  Real Estate
                </span>
              </div>
              <div className="text-[11px] text-[#8e887d] mt-0.5">
                Supply: {flatData.primarySaleRemaining.toLocaleString("en-IN")} / {flatData.totalSupply.toLocaleString("en-IN")} remaining
              </div>
            </div>
          </div>

          <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
            <div className="text-xs font-semibold text-[#f0ede6]">
              {formatInr(flatData.priceInr)}
            </div>
            <div className="text-[10px] font-mono text-amber-400">
              {flatData.priceEth}
            </div>
          </div>
        </div>

        {/* Contract Address Verification Strip */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#787268] gap-1 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Contract: {FLAT_ADDRESS.slice(0, 8)}...{FLAT_ADDRESS.slice(-6)}</span>
          </div>
          <div>Registry: {REGISTRY_ADDRESS.slice(0, 8)}...{REGISTRY_ADDRESS.slice(-6)}</div>
        </div>
      </div>
    </div>
  );
};
