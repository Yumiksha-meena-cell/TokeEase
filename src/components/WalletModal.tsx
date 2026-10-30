"use client";

import React, { useState } from "react";
import {
  X,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  RotateCw,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Crown,
} from "lucide-react";
import { useWallet, RoleType } from "../context/WalletContext";
import { formatInr } from "../lib/format";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional overrides if passed from parent components
  isConnected?: boolean;
  walletAddress?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
}) => {
  const {
    address,
    shortAddress,
    isConnected,
    isCorrectNetwork,
    role,
    ethBalance,
    isConnecting,
    connect,
    disconnect,
    switchToSepolia,
    errorMessage,
  } = useWallet();

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectMetamask = async () => {
    if (onConnect) {
      onConnect();
    }
    await connect();
  };

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
    }
    disconnect();
    onClose();
  };

  // Approximate INR for the test ETH balance (5,000,000 INR per ETH)
  const ethNumeric = parseFloat(ethBalance.replace(" ETH", "").trim()) || 0;
  const inrNumeric = ethNumeric * 5_000_000;

  const getRoleBadge = (currentRole: RoleType) => {
    switch (currentRole) {
      case "Admin":
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-semibold">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Admin</span>
          </div>
        );
      case "Verified":
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Verified</span>
          </div>
        );
      case "Pending":
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-200 border border-amber-400/30 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-amber-400 animate-spin" />
            <span>Pending</span>
          </div>
        );
      case "Not verified":
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 font-mono text-[11px]">
            <ShieldAlert className="w-3 h-3 text-stone-400" />
            <span>Not verified</span>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#130f0d] border border-amber-500/30 shadow-2xl shadow-black/90 p-6 sm:p-7 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#8e887d] hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isConnected ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider text-amber-400">
                    Wallet Connected
                  </span>
                  <h3 className="text-lg font-semibold text-[#f6f5f0]">
                    Sepolia Sandbox
                  </h3>
                </div>
              </div>
              {getRoleBadge(role)}
            </div>

            {/* Account Details Box */}
            <div className="p-4 rounded-xl bg-[#0d0a08] border border-white/5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#817b71]">Account Address</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 font-mono text-amber-300 hover:text-white"
                  title={address || ""}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{shortAddress}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#817b71]">Network Status</span>
                {isCorrectNetwork ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Sepolia (Chain 11155111)</span>
                  </div>
                ) : (
                  <button
                    onClick={switchToSepolia}
                    className="flex items-center gap-1 text-rose-400 font-mono text-[11px] hover:underline"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Wrong network · Switch</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#817b71]">Test ETH Balance</span>
                <span className="font-semibold text-amber-400 font-mono">
                  {ethBalance}{" "}
                  <span className="text-[#8e887d] font-normal">
                    (≈ {formatInr(inrNumeric)})
                  </span>
                </span>
              </div>
              <div className="text-[10px] text-right text-[#787268] italic">
                Demo conversion, not a real exchange rate.
              </div>
            </div>

            {/* Wrong Network Banner */}
            {!isCorrectNetwork && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>MetaMask is not on Sepolia testnet.</span>
                </div>
                <button
                  onClick={switchToSepolia}
                  className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-colors"
                >
                  Switch Network
                </button>
              </div>
            )}

            {/* Faucet Link Box */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  Need Sepolia Test ETH?
                </div>
                <div className="text-[11px] text-[#8e887d]">
                  Get free testnet gas from Google Cloud Web3 Faucet
                </div>
              </div>
              <a
                href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Get ETH</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleDisconnect}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#d6d0c4] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Wallet</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 text-[10px] font-mono uppercase text-amber-400 border border-amber-500/20 mb-2">
                <span>SEPOLIA TESTNET GATEWAY</span>
              </div>
              <h3 className="text-xl font-semibold text-[#f6f5f0]">
                Connect Testnet Wallet
              </h3>
              <p className="text-xs text-[#9a9489] mt-1">
                Connect your browser wallet to verify KYC and buy fractional RWA tokens on Sepolia testnet.
              </p>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                onClick={handleConnectMetamask}
                disabled={isConnecting}
                className="w-full p-3.5 rounded-xl bg-[#0d0a08] hover:bg-[#181310] border border-amber-500/30 hover:border-amber-500/60 text-left transition-all flex items-center justify-between group disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#f0ede6] group-hover:text-amber-200 flex items-center gap-1.5">
                      <span>MetaMask Browser Extension</span>
                    </div>
                    <div className="text-[10px] text-[#7d786e]">
                      Standard Sepolia testnet connection via BrowserProvider
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConnecting && (
                    <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    Recommended
                  </span>
                </div>
              </button>

              <a
                href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl bg-[#0d0a08] hover:bg-[#181310] border border-white/5 hover:border-white/20 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#8e887d] group-hover:text-white transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#d6d0c4]">
                      Sepolia Testnet Faucet
                    </div>
                    <div className="text-[10px] text-[#7d786e]">
                      Get free test ETH if your wallet balance is zero
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#8e887d] group-hover:text-amber-300">
                  Google Faucet ↗
                </span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#817b71] font-mono text-center">
              Prototype on Sepolia testnet. No real money or private keys needed.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
