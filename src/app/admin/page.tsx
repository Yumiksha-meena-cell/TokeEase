"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Crown,
  Wallet,
  Users,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Coins,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  DollarSign,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Contract, formatEther, parseEther } from "ethers";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { WalletModal } from "../../components/WalletModal";
import { useWallet } from "../../context/WalletContext";
import {
  REGISTRY_ADDRESS,
  REGISTRY_ABI,
  ASSET_ABI,
  ASSETS,
  isZeroAddress,
} from "../../lib/contract";
import { shortAddress, formatInr, formatEth } from "../../lib/format";
import { getFriendlyErrorMessage } from "../../lib/errors";

interface PendingApplicant {
  address: string;
  dataHash: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function AdminPage() {
  const { isConnected, isOwner, address, signer, refreshState } =
    useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Pending KYC state
  const [applicants, setApplicants] = useState<PendingApplicant[]>([]);
  const [loadingKyc, setLoadingKyc] = useState(false);

  // Asset price update state
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>("jaipur-flat");
  const [newPriceEth, setNewPriceEth] = useState<string>("0.000108");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  // Income distribution state
  const [incomeEth, setIncomeEth] = useState<string>("0.001");
  const [isDistributingIncome, setIsDistributingIncome] = useState(false);

  // Withdraw state
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const canAccessAdmin = isOwner || demoMode;

  // Load applicants
  const fetchApplicants = useCallback(async () => {
    if (!isZeroAddress(REGISTRY_ADDRESS) && signer) {
      try {
        setLoadingKyc(true);
        const registry = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
        const requesters: string[] = await registry.getKycRequesters();
        const list: PendingApplicant[] = [];

        for (const reqAddr of requesters) {
          const statusNum = await registry.kycStatus(reqAddr);
          let statusText: "Pending" | "Approved" | "Rejected" = "Pending";
          if (Number(statusNum) === 2) statusText = "Approved";
          if (Number(statusNum) === 3) statusText = "Rejected";

          let hash = "";
          try {
            hash = await registry.kycHash(reqAddr);
          } catch {
            hash = "0x" + "0".repeat(64);
          }

          list.push({
            address: reqAddr,
            dataHash: hash,
            status: statusText,
          });
        }
        setApplicants(list);
      } catch (err) {
        console.error("Failed to load requesters from registry:", err);
      } finally {
        setLoadingKyc(false);
      }
    } else {
      // Demo fallback requesters
      setApplicants([
        {
          address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          dataHash: "0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
          status: "Pending",
        },
        {
          address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          dataHash: "0x89c5643444458d927a42b083c6b29d4993ecdf73f001ef06774c8c7d41f71df1",
          status: "Pending",
        },
      ]);
    }
  }, [signer]);

  useEffect(() => {
    if (canAccessAdmin) {
      fetchApplicants();
    }
  }, [canAccessAdmin, fetchApplicants]);

  // Handle KYC Approval
  const handleApproveKyc = async (userAddr: string) => {
    try {
      if (!isZeroAddress(REGISTRY_ADDRESS) && signer) {
        toast.info(`Approving KYC for ${shortAddress(userAddr)} on Sepolia...`);
        const registry = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
        const tx = await registry.approveKyc(userAddr);
        await tx.wait();
        toast.success(`KYC Approved for ${shortAddress(userAddr)}!`);
        fetchApplicants();
        refreshState();
      } else {
        // Local simulation
        setApplicants((prev) =>
          prev.map((a) =>
            a.address.toLowerCase() === userAddr.toLowerCase()
              ? { ...a, status: "Approved" }
              : a
          )
        );
        toast.success(`Demo KYC Approved for ${shortAddress(userAddr)}!`);
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    }
  };

  // Handle KYC Rejection
  const handleRejectKyc = async (userAddr: string) => {
    try {
      if (!isZeroAddress(REGISTRY_ADDRESS) && signer) {
        toast.info(`Rejecting KYC for ${shortAddress(userAddr)}...`);
        const registry = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
        const tx = await registry.rejectKyc(userAddr);
        await tx.wait();
        toast.success(`KYC Rejected for ${shortAddress(userAddr)}.`);
        fetchApplicants();
        refreshState();
      } else {
        setApplicants((prev) =>
          prev.map((a) =>
            a.address.toLowerCase() === userAddr.toLowerCase()
              ? { ...a, status: "Rejected" }
              : a
          )
        );
        toast.success(`Demo KYC Rejected for ${shortAddress(userAddr)}.`);
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    }
  };

  // Handle Price Update (+8% per demo prompt in Section 8.6)
  const handleUpdatePrice = async () => {
    const targetAsset = ASSETS.find((a) => a.key === selectedAssetKey) || ASSETS[0];
    try {
      setIsUpdatingPrice(true);
      const newWei = parseEther(newPriceEth);

      if (!isZeroAddress(targetAsset.address) && signer) {
        toast.info(`Updating price for ${targetAsset.name} on Sepolia...`);
        const assetContract = new Contract(targetAsset.address, ASSET_ABI, signer);
        const tx = await assetContract.updatePrice(newWei);
        await tx.wait();
        toast.success(`Price updated to ${newPriceEth} ETH for ${targetAsset.symbol}!`);
      } else {
        toast.success(
          `Demo: Price for ${targetAsset.name} updated to ${newPriceEth} ETH (+8% demo appreciation).`
        );
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Handle Quick +8% Bump
  const setQuickEightPercent = () => {
    const targetAsset = ASSETS.find((a) => a.key === selectedAssetKey) || ASSETS[0];
    const base = parseFloat(targetAsset.initialPriceEth || "0.0001");
    const bumped = (base * 1.08).toFixed(6);
    setNewPriceEth(bumped);
    toast.info(`Set price to ${bumped} ETH (+8% demo increment per PRD Section 8.6)`);
  };

  // Handle Income Distribution (Rent or Coupon, F10)
  const handleDistributeIncome = async () => {
    const targetAsset = ASSETS.find((a) => a.key === selectedAssetKey) || ASSETS[0];
    const isBond = targetAsset.type === "Bond";
    const label = isBond ? "Coupon payout" : "Rental yield";

    try {
      setIsDistributingIncome(true);
      const wei = parseEther(incomeEth);

      if (!isZeroAddress(targetAsset.address) && signer) {
        toast.info(`Distributing ${incomeEth} ETH ${label} to token holders...`);
        const assetContract = new Contract(targetAsset.address, ASSET_ABI, signer);
        const tx = await assetContract.distributeIncome({ value: wei });
        await tx.wait();
        toast.success(`${label} distributed successfully on Sepolia!`);
      } else {
        toast.success(
          `Demo: Distributed ${incomeEth} ETH ${label} to ${targetAsset.symbol} holders!`
        );
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsDistributingIncome(false);
    }
  };

  // Handle Contract ETH Withdraw
  const handleWithdrawEth = async () => {
    const targetAsset = ASSETS.find((a) => a.key === selectedAssetKey) || ASSETS[0];
    try {
      setIsWithdrawing(true);
      if (!isZeroAddress(targetAsset.address) && signer) {
        toast.info(`Withdrawing contract balance for ${targetAsset.symbol}...`);
        const assetContract = new Contract(targetAsset.address, ASSET_ABI, signer);
        const tx = await assetContract.withdraw();
        await tx.wait();
        toast.success(`Withdrawn primary sale funds to owner wallet!`);
      } else {
        toast.success(`Demo: Primary sale funds withdrawn to admin wallet.`);
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const selectedAsset = ASSETS.find((a) => a.key === selectedAssetKey) || ASSETS[0];
  const pendingCount = applicants.filter((a) => a.status === "Pending").length;

  return (
    <div className="min-h-screen bg-[#080706] text-[#f6f5f0] selection:bg-amber-500/30 selection:text-amber-200 flex flex-col justify-between">
      <Navbar onConnectWallet={() => setIsWalletModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {!canAccessAdmin ? (
          /* Access Guard Screen for Non-Admins */
          <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-[#120e0c] border border-amber-900/30 shadow-2xl shadow-black/80 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-mono uppercase tracking-widest text-rose-400 mb-3">
              <span>RESTRICTED ACCESS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-[#f6f5f0] mb-3">
              Admin Only Protocol Dashboard
            </h1>

            <p className="text-sm text-[#9a9489] leading-relaxed mb-6">
              The TokeEase administrative dashboard is protected by on-chain access controls. Only the contract deployer address on Sepolia can approve KYC hashes and distribute property rental yields.
            </p>

            <div className="p-4 rounded-xl bg-[#090706] border border-white/5 text-xs font-mono text-[#817b71] mb-6 space-y-1.5 text-left">
              <div className="flex justify-between">
                <span>Connected Account:</span>
                <span className="text-[#d6d0c4]">
                  {isConnected && address ? shortAddress(address) : "Not connected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Registry Contract:</span>
                <span className="text-amber-400">
                  {isZeroAddress(REGISTRY_ADDRESS)
                    ? "Placeholder mode (0x00...00)"
                    : REGISTRY_ADDRESS.slice(0, 10) + "..."}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!isConnected ? (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Owner Wallet</span>
                </button>
              ) : (
                <button
                  onClick={() => setDemoMode(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enter Demo Admin Mode</span>
                </button>
              )}

              <Link
                href="/"
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#d6d0c4] hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Full Admin Dashboard for Contract Owner */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Admin Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-900/20">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-semibold">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{demoMode ? "Demo Admin Mode" : "Contract Owner Verified"}</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">
                    Sepolia Live
                  </span>
                </div>
                <h1 className="text-3xl font-semibold text-[#f6f5f0]">
                  TokeEase Protocol Admin
                </h1>
                <p className="text-xs text-[#9a9489] mt-1">
                  Owner address: <span className="font-mono text-amber-300">{address || "0xOwnerDeployer"}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchApplicants}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#d6d0c4] border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingKyc ? "animate-spin" : ""}`} />
                  <span>Refresh Data</span>
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#d6d0c4] border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Public App</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#120e0c] border border-white/5">
                <div className="flex items-center justify-between text-[#817b71] text-xs font-mono mb-2">
                  <span>PENDING KYC</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-semibold text-[#f6f5f0]">
                  {pendingCount}
                </div>
                <div className="text-[11px] text-[#787268] mt-1">
                  Awaiting on-chain registry approval
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#120e0c] border border-white/5">
                <div className="flex items-center justify-between text-[#817b71] text-xs font-mono mb-2">
                  <span>ACTIVE ASSETS</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-semibold text-[#f6f5f0]">
                  {ASSETS.length}
                </div>
                <div className="text-[11px] text-[#787268] mt-1">
                  JFT, JPT, TGOLD, TBOND
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#120e0c] border border-white/5">
                <div className="flex items-center justify-between text-[#817b71] text-xs font-mono mb-2">
                  <span>REGISTRY TARGET</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-sm font-semibold text-[#f6f5f0] font-mono truncate">
                  {isZeroAddress(REGISTRY_ADDRESS)
                    ? "Local Sandbox / Sepolia"
                    : shortAddress(REGISTRY_ADDRESS)}
                </div>
                <div className="text-[11px] text-[#787268] mt-1">
                  Chain ID 11155111
                </div>
              </div>
            </div>

            {/* Section 1: Pending KYC Requests (Phase 4 integration) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#120e0c] border border-amber-900/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#f6f5f0]">
                    KYC Registry Approvals · F4
                  </h2>
                  <p className="text-xs text-[#9a9489]">
                    Review hashed investor credentials. One approval grants access to all 4 assets.
                  </p>
                </div>

                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {pendingCount} Pending
                </span>
              </div>

              {applicants.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#090706] border border-white/5 text-center text-xs text-[#8e887d]">
                  <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p>No pending KYC requests at this moment.</p>
                  <p className="text-[11px] text-[#6d685f] mt-1">
                    When a user submits KYC on the marketplace, their SHA-256 hash will appear here for one-click contract approval.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full text-left text-xs font-mono bg-[#090706]">
                    <thead>
                      <tr className="border-b border-white/5 text-[#817b71] text-[10px] uppercase">
                        <th className="p-3">Applicant Wallet</th>
                        <th className="p-3">Identity Data Hash</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[#d6d0c4]">
                      {applicants.map((applicant, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-semibold text-white">
                            {shortAddress(applicant.address)}
                          </td>
                          <td className="p-3 text-[#787268] max-w-[180px] truncate">
                            {applicant.dataHash}
                          </td>
                          <td className="p-3">
                            {applicant.status === "Approved" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Approved
                              </span>
                            ) : applicant.status === "Rejected" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                Pending Review
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {applicant.status !== "Approved" && (
                              <button
                                onClick={() => handleApproveKyc(applicant.address)}
                                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {applicant.status !== "Rejected" && (
                              <button
                                onClick={() => handleRejectKyc(applicant.address)}
                                className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: Asset Pricing & Yield Controls (Phase 5 & Phase 6 integration) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#120e0c] border border-white/5 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#f6f5f0]">
                    Asset Pricing & Yield Distribution · F8 & F10
                  </h2>
                  <p className="text-xs text-[#9a9489]">
                    Broadcast price revisions (chart updates) and send rental yields / bond coupons to token holders.
                  </p>
                </div>

                {/* Asset Picker Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-[#090706] p-1 rounded-xl border border-white/10 text-xs font-mono">
                  {ASSETS.map((asset) => (
                    <button
                      key={asset.key}
                      onClick={() => {
                        setSelectedAssetKey(asset.key);
                        setNewPriceEth(asset.initialPriceEth || "0.0001");
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        selectedAssetKey === asset.key
                          ? "bg-amber-500 text-stone-950 font-semibold"
                          : "text-[#8e887d] hover:text-white"
                      }`}
                    >
                      {asset.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Asset Control Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Price Update (F8) */}
                <div className="p-5 rounded-2xl bg-[#090706] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono uppercase text-amber-400 font-semibold">
                        Price Update · {selectedAsset.symbol}
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        {selectedAsset.name}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#817b71]">
                      Current: {selectedAsset.initialPriceEth} ETH
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e887d] block mb-1 font-mono">
                      New Price Per Token (ETH):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPriceEth}
                        onChange={(e) => setNewPriceEth(e.target.value)}
                        className="flex-1 bg-[#14100e] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                      />
                      <button
                        type="button"
                        onClick={setQuickEightPercent}
                        className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs transition-colors"
                        title="Set +8% appreciation for demo"
                      >
                        +8% Demo
                      </button>
                    </div>
                    <p className="text-[10px] text-[#787268] mt-1 font-mono">
                      Equivalent to {formatInr(Math.round((Number(newPriceEth || 0) / 0.0001) * 500))} per unit.
                    </p>
                  </div>

                  <button
                    onClick={handleUpdatePrice}
                    disabled={isUpdatingPrice}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isUpdatingPrice ? "Broadcasting..." : "Broadcast Price Revision"}</span>
                  </button>
                </div>

                {/* Right Card: Income Distribution (F10) */}
                <div className="p-5 rounded-2xl bg-[#090706] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono uppercase text-emerald-400 font-semibold">
                        {selectedAsset.type === "Bond"
                          ? "Coupon Payment · F10"
                          : selectedAsset.type === "RealEstate"
                          ? "Rental Yield Distribution · F10"
                          : "Asset Cashflow Status"}
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        {selectedAsset.type === "Bond"
                          ? "Pay 8% Bond Coupon"
                          : selectedAsset.type === "RealEstate"
                          ? "Distribute Property Rent"
                          : "No Regular Income"}
                      </div>
                    </div>
                  </div>

                  {selectedAsset.type === "RealEstate" || selectedAsset.type === "Bond" ? (
                    <>
                      <div>
                        <label className="text-[11px] text-[#8e887d] block mb-1 font-mono">
                          Total Distribution Pool (ETH to deposit):
                        </label>
                        <input
                          type="text"
                          value={incomeEth}
                          onChange={(e) => setIncomeEth(e.target.value)}
                          className="w-full bg-[#14100e] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
                        />
                        <p className="text-[10px] text-[#787268] mt-1 font-mono">
                          Contract loops all holders and sends ETH proportional to token balance. (Default: 0.001 ETH).
                        </p>
                      </div>

                      <button
                        onClick={handleDistributeIncome}
                        disabled={isDistributingIncome}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>
                          {isDistributingIncome
                            ? "Sending ETH..."
                            : selectedAsset.type === "Bond"
                            ? "Pay Coupon to Bondholders"
                            : "Distribute Rent to Flat Owners"}
                        </span>
                      </button>
                    </>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#787268] space-y-1">
                      <p>
                        {selectedAsset.name} ({selectedAsset.type}) is a pure capital appreciation asset.
                      </p>
                      <p className="text-[11px] text-[#58524a]">
                        Income distribution (F10) is active only for Real Estate (Rent) and Bonds (Coupons).
                      </p>
                    </div>
                  )}

                  {/* Withdraw Contract ETH button */}
                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <button
                      onClick={handleWithdrawEth}
                      disabled={isWithdrawing}
                      className="text-xs font-mono text-[#8e887d] hover:text-amber-300 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isWithdrawing ? "Processing..." : "Withdraw Primary Sales Balance"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}
