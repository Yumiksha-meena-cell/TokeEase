"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Crown,
  Clock,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { useWallet, RoleType } from "../context/WalletContext";

interface NavbarProps {
  isWalletConnected?: boolean;
  walletAddress?: string;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onConnectWallet,
}) => {
  const {
    address,
    shortAddress,
    isConnected,
    isCorrectNetwork,
    isOwner,
    role,
    isConnecting,
    connect,
    disconnect,
    switchToSepolia,
  } = useWallet();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseNavLinks = [
    { name: "Explore Assets", href: "/#marketplace" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Wallet", href: "/#wallet-preview" },
    { name: "Learn", href: "/#toke-ease-guide" },
    { name: "Security", href: "/#security" },
  ];

  // Show Admin link only when the connected wallet is owner
  const navLinks = isOwner
    ? [...baseNavLinks, { name: "Admin", href: "/admin" }]
    : baseNavLinks;

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

  const handleConnectClick = () => {
    if (onConnectWallet) {
      onConnectWallet();
    } else {
      connect();
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#090706]/90 backdrop-blur-md border-b border-amber-900/20 py-3 shadow-2xl shadow-black/70"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none flex-shrink-0"
            aria-label="TokeEase Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-orange-600 p-[1px] flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
              <div className="w-full h-full bg-[#120f0d] rounded-[7px] flex items-center justify-center">
                <span className="font-mono font-bold text-sm tracking-tight text-amber-400">
                  ½
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-medium tracking-tight text-[#f6f5f0] group-hover:text-amber-200 transition-colors">
                TokeEase
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded border border-amber-500/30 text-amber-400 bg-amber-500/10">
                Testnet
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#14100e]/70 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs uppercase tracking-wider font-medium px-3 py-1.5 rounded-full transition-all duration-150 ${
                  link.name === "Admin"
                    ? "text-amber-300 bg-amber-500/15 border border-amber-500/30 font-semibold"
                    : "text-[#9a9489] hover:text-[#f6f5f0] hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Header Status: Network Badge, Role Badge, Connect / Disconnect */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Network Badge */}
            {isConnected && (
              <>
                {isCorrectNetwork ? (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs"
                    title="Connected to Sepolia Ethereum testnet"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Sepolia</span>
                  </div>
                ) : (
                  <button
                    onClick={switchToSepolia}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs hover:bg-rose-500/30 transition-all shadow-sm shadow-rose-950"
                    title="Click to switch your MetaMask to Sepolia"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Wrong network</span>
                    <span className="underline decoration-rose-400/60 ml-0.5 font-sans font-semibold">
                      Switch to Sepolia
                    </span>
                  </button>
                )}

                {/* Role Badge */}
                {getRoleBadge(role)}
              </>
            )}

            {/* Wallet Chip */}
            {isConnected ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleConnectClick}
                  type="button"
                  title={address || ""}
                  className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-2 bg-amber-950/40 text-amber-300 border border-amber-500/40 hover:bg-amber-900/30 shadow-sm transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{shortAddress}</span>
                </button>
                <button
                  onClick={disconnect}
                  type="button"
                  title="Disconnect wallet"
                  className="p-2 rounded-lg text-[#8e887d] hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectClick}
                disabled={isConnecting}
                type="button"
                className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isConnecting ? (
                  <RotateCw className="w-3.5 h-3.5 text-stone-950 animate-spin" />
                ) : (
                  <Wallet className="w-3.5 h-3.5 text-stone-950" />
                )}
                <span>{isConnecting ? "Connecting..." : "Connect Testnet Wallet"}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-[#9a9489] hover:text-white hover:bg-white/5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d0a08] border-b border-amber-900/20 px-4 pt-3 pb-6 mt-2 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  link.name === "Admin"
                    ? "text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20"
                    : "text-[#b5afa4] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/5 flex flex-col gap-2.5">
            {isConnected && (
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  {isCorrectNetwork ? (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Sepolia Live
                    </span>
                  ) : (
                    <button
                      onClick={switchToSepolia}
                      className="text-xs font-mono text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30"
                    >
                      Switch to Sepolia
                    </button>
                  )}
                  {getRoleBadge(role)}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isConnected) {
                  disconnect();
                } else {
                  handleConnectClick();
                }
              }}
              className="w-full text-center py-2.5 text-sm font-semibold rounded-md bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              {isConnected ? `Disconnect (${shortAddress})` : "Connect Testnet Wallet"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
