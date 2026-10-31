"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  Building2,
  MapPin,
  Coins,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Contract, formatEther } from "ethers";
import { formatInr, formatEth, shortAddress } from "../lib/format";
import { useWallet } from "../context/WalletContext";
import { ASSETS, ASSET_ABI, isZeroAddress, getReadOnlyProvider } from "../lib/contract";

interface PortfolioRow {
  key: string;
  symbol: string;
  name: string;
  type: "RealEstate" | "Plot" | "Gold" | "Bond";
  balance: number;
  grams?: number;
  ownershipPercent: string;
  priceInr: number;
  priceEth: string;
  currentValueInr: number;
  currentValueEth: string;
  totalSpentInr: number;
  totalSpentEth: string;
  pnlInr: number;
  pnlEth: string;
  isProfit: boolean;
}

interface WalletPreviewProps {
  onOpenConnectModal?: () => void;
  isWalletConnected?: boolean;
  walletAddress?: string;
}

export const WalletPreview: React.FC<WalletPreviewProps> = ({
  onOpenConnectModal,
}) => {
  const {
    isConnected,
    address,
    shortAddress: walletShort,
    ethBalance,
    isCorrectNetwork,
    connect,
  } = useWallet();

  const [activeTab, setActiveTab] = useState<"table" | "activity">("table");
  const [copied, setCopied] = useState(false);
  const [portfolioRows, setPortfolioRows] = useState<PortfolioRow[]>([]);

  const displayAddress = isConnected && address ? address : "0x0000...0000";
  const displayShort = isConnected && walletShort ? walletShort : "Not connected";

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build combined portfolio data (F19 & F7)
  const loadPortfolioData = useCallback(async () => {
    try {
      const readProvider = getReadOnlyProvider();
      const asset = ASSETS[0];
      const contract = new Contract(asset.address, ASSET_ABI, readProvider);

      const [onChainName, priceWei, totalSupply, bal, totalSpentWei] = await Promise.all([
        contract.assetName().catch(() => ""),
        contract.pricePerTokenWei().catch(() => BigInt("100000000000000")),
        contract.totalSupply().catch(() => BigInt(10000)),
        address ? contract.balanceOf(address).catch(() => BigInt(0)) : Promise.resolve(BigInt(0)),
        address ? contract.totalSpentWei(address).catch(() => BigInt(0)) : Promise.resolve(BigInt(0)),
      ]);

      const displayName =
        onChainName && typeof onChainName === "string" && onChainName.trim() !== ""
          ? onChainName.trim()
          : "Jaipur Flat";

      const balNum = Number(bal);
      const priceEthNum = parseFloat(formatEther(priceWei));
      const priceInr = Math.round((priceEthNum / 0.0001) * 500);

      const valWei = BigInt(balNum) * BigInt(priceWei);
      const valEthNum = parseFloat(formatEther(valWei));
      const valInr = balNum * priceInr;

      const spentEthNum = parseFloat(formatEther(totalSpentWei));
      const spentInr = Math.round((spentEthNum / 0.0001) * 500);

      const pnlInr = valInr - spentInr;
      const pnlEthNum = valEthNum - spentEthNum;

      const supplyNum = Number(totalSupply) || 10000;
      const ownershipPercent = ((balNum / supplyNum) * 100).toFixed(2);

      setPortfolioRows([
        {
          key: asset.key,
          symbol: asset.symbol,
          name: displayName,
          type: asset.type,
          balance: balNum,
          ownershipPercent,
          priceInr,
          priceEth: `${priceEthNum} ETH`,
          currentValueInr: valInr,
          currentValueEth: `${valEthNum.toFixed(6)} ETH`,
          totalSpentInr: spentInr,
          totalSpentEth: `${spentEthNum.toFixed(6)} ETH`,
          pnlInr,
          pnlEth: `${pnlEthNum >= 0 ? "+" : ""}${pnlEthNum.toFixed(6)} ETH`,
          isProfit: pnlInr >= 0,
        },
      ]);
    } catch (err) {
      console.warn("Could not query on-chain holdings:", err);
      setPortfolioRows([
        {
          key: "jaipur-flat",
          symbol: "JFT",
          name: "Jaipur Flat",
          type: "RealEstate",
          balance: 0,
          ownershipPercent: "0.00",
          priceInr: 500,
          priceEth: "0.0001 ETH",
          currentValueInr: 0,
          currentValueEth: "0.000000 ETH",
          totalSpentInr: 0,
          totalSpentEth: "0.000000 ETH",
          pnlInr: 0,
          pnlEth: "+0.000000 ETH",
          isProfit: true,
        },
      ]);
    }
  }, [address]);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // Aggregate totals (F19)
  const totalValueInr = portfolioRows.reduce((acc, r) => acc + r.currentValueInr, 0);
  const totalSpentInr = portfolioRows.reduce((acc, r) => acc + r.totalSpentInr, 0);
  const totalPnlInr = totalValueInr - totalSpentInr;
  const totalValueEth = ((totalValueInr / 500) * 0.0001).toFixed(6);

  const mockActivity = [
    {
      id: "tx-1",
      type: "Coupon Payout (F10)",
      asset: "Sample Bond (TBOND)",
      amount: "+0.000040 ETH (₹200)",
      date: "Today, 14:22",
      status: "Confirmed",
      isPositive: true,
    },
    {
      id: "tx-2",
      type: "Primary Buy (F5)",
      asset: "Digital Gold (TGOLD)",
      amount: "-0.000600 ETH (₹3,000)",
      date: "Today, 11:05",
      status: "Confirmed",
      isPositive: false,
    },
    {
      id: "tx-3",
      type: "Rent Yield (F10)",
      asset: "Jaipur Flat (JFT)",
      amount: "+0.000060 ETH (₹300)",
      date: "Yesterday, 09:15",
      status: "Confirmed",
      isPositive: true,
    },
    {
      id: "tx-4",
      type: "Primary Buy (F5)",
      asset: "Jaipur Flat (JFT)",
      amount: "-0.001000 ETH (₹5,000)",
      date: "Oct 28, 2026",
      status: "Confirmed",
      isPositive: false,
    },
  ];

  return (
    <section id="wallet-preview" className="relative py-24 md:py-32 scroll-mt-20">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[300px] bg-amber-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase tracking-widest text-amber-400">
              <Wallet className="w-3.5 h-3.5" />
              <span>UNIFIED PORTFOLIO · F19</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Live Cross-Asset Record
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f6f5f0]">
            Your digital-assets portfolio.
          </h2>
          <p className="text-sm sm:text-base text-[#9a9489]">
            A single, immutable view of your holdings across Real Estate, Land Plots, Gold, and Bonds on Sepolia.
          </p>
        </div>

        {/* Big Glass Wallet Box */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#120e0c]/90 border border-amber-900/30 backdrop-blur-2xl shadow-2xl shadow-black/80 p-6 sm:p-10 overflow-hidden">
          {/* Top Wallet Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#f6f5f0]">
                    TokeEase Sandbox Vault
                  </span>
                  {isConnected && isCorrectNetwork && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      Sepolia Live
                    </span>
                  )}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-mono text-[#8e887d] hover:text-white mt-0.5"
                  title={displayAddress}
                >
                  <span>{displayShort}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={isConnected ? onOpenConnectModal : connect}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
              >
                {isConnected ? "Wallet Options" : "Connect Testnet Wallet"}
              </button>
            </div>
          </div>

          {/* Balance Summary Row */}
          <div className="py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-white/5">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-[#817b71]">
                Total Portfolio Value
              </span>
              <div className="text-3xl font-semibold text-[#f6f5f0] mt-1 font-mono">
                {formatInr(totalValueInr)}
              </div>
              <div className="text-xs font-mono text-amber-400 mt-0.5">
                {totalValueEth} ETH
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-[#817b71]">
                Net Profit / Loss (P/L)
              </span>
              <div
                className={`text-2xl font-semibold mt-1 font-mono flex items-center gap-1.5 ${
                  totalPnlInr >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {totalPnlInr >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span>
                  {totalPnlInr >= 0 ? "+" : ""}
                  {formatInr(totalPnlInr)}
                </span>
              </div>
              <div className="text-[11px] text-[#787268] mt-0.5">
                Cost Basis: {formatInr(totalSpentInr)}
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-[#817b71]">
                Sepolia Test ETH Balance
              </span>
              <div className="text-2xl font-semibold text-[#eae6dd] mt-1 font-mono">
                {isConnected ? ethBalance : "Connect wallet"}
              </div>
              <span className="text-xs text-[#787268]">
                {isConnected ? "Live MetaMask balance" : "Connect wallet to view"}
              </span>
            </div>
          </div>

          {/* Tabs: Assets Combined Table vs Activity */}
          <div className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab("table")}
                className={`text-xs font-medium pb-2 border-b-2 transition-all ${
                  activeTab === "table"
                    ? "border-amber-400 text-amber-300 font-semibold"
                    : "border-transparent text-[#8e887d] hover:text-white"
                }`}
              >
                Combined Holdings Table · F19 ({portfolioRows.length})
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`text-xs font-medium pb-2 border-b-2 transition-all ${
                  activeTab === "activity"
                    ? "border-amber-400 text-amber-300 font-semibold"
                    : "border-transparent text-[#8e887d] hover:text-white"
                }`}
              >
                Income & Distribution History ({mockActivity.length})
              </button>
            </div>

            {activeTab === "table" ? (
              /* F19 Combined Portfolio Table */
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left text-xs font-mono bg-[#090706]">
                  <thead>
                    <tr className="border-b border-white/5 text-[#817b71] text-[10px] uppercase">
                      <th className="p-3">Asset</th>
                      <th className="p-3">Holdings</th>
                      <th className="p-3">Ownership %</th>
                      <th className="p-3">Price / Unit</th>
                      <th className="p-3">Current Value</th>
                      <th className="p-3">Total Cost</th>
                      <th className="p-3 text-right">Profit / Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#d6d0c4]">
                    {portfolioRows.map((r) => (
                      <tr key={r.key} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white">{r.name}</div>
                          <div className="text-[10px] text-amber-400">{r.symbol} · {r.type}</div>
                        </td>
                        <td className="p-3 font-semibold text-white">
                          {r.balance} tokens
                          {r.grams && (
                            <div className="text-[10px] text-amber-300">
                              {r.grams.toFixed(2)} grams
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-[#9a9489]">
                          {r.ownershipPercent}%
                        </td>
                        <td className="p-3">
                          <div>{formatInr(r.priceInr)}</div>
                          <div className="text-[10px] text-[#787268]">{r.priceEth}</div>
                        </td>
                        <td className="p-3 font-semibold text-white">
                          <div>{formatInr(r.currentValueInr)}</div>
                          <div className="text-[10px] text-[#787268]">{r.currentValueEth}</div>
                        </td>
                        <td className="p-3 text-[#9a9489]">
                          <div>{formatInr(r.totalSpentInr)}</div>
                        </td>
                        <td className="p-3 text-right font-semibold">
                          <span
                            className={r.isProfit ? "text-emerald-400" : "text-rose-400"}
                          >
                            {r.pnlInr >= 0 ? "+" : ""}
                            {formatInr(r.pnlInr)}
                          </span>
                          <div className="text-[10px] text-[#787268]">{r.pnlEth}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Table Footer with Combined Totals (F19) */}
                  <tfoot>
                    <tr className="border-t-2 border-white/10 bg-[#120e0c] font-semibold text-white">
                      <td className="p-3 uppercase text-[10px] text-[#817b71]">
                        Combined Total
                      </td>
                      <td className="p-3">
                        {portfolioRows.reduce((acc, r) => acc + r.balance, 0)} tokens
                      </td>
                      <td className="p-3 text-[#817b71]">--</td>
                      <td className="p-3 text-[#817b71]">--</td>
                      <td className="p-3 text-amber-300">
                        {formatInr(totalValueInr)} ({totalValueEth} ETH)
                      </td>
                      <td className="p-3 text-[#9a9489]">
                        {formatInr(totalSpentInr)}
                      </td>
                      <td
                        className={`p-3 text-right ${
                          totalPnlInr >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {totalPnlInr >= 0 ? "+" : ""}
                        {formatInr(totalPnlInr)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="space-y-3">
                {mockActivity.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-[#0c0908] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-400">
                        {tx.isPositive ? (
                          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-[#f6f5f0]">
                          {tx.type} — {tx.asset}
                        </div>
                        <div className="text-[11px] text-[#736e65]">
                          {tx.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div
                        className={`font-semibold ${
                          tx.isPositive ? "text-emerald-400" : "text-stone-300"
                        }`}
                      >
                        {tx.amount}
                      </div>
                      <div className="text-[10px] text-emerald-500/80">
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-[10px] text-[#787268] font-mono flex items-center justify-between">
              <span>* P/L is calculated against cost basis recorded on-chain.</span>
              <span>Demo rate: 0.0001 ETH = ₹500</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
