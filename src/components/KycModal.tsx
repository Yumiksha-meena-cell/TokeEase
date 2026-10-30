"use client";

import React, { useState } from "react";
import {
  X,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Wallet,
  AlertCircle,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Contract, keccak256, toUtf8Bytes } from "ethers";
import { useWallet } from "../context/WalletContext";
import { REGISTRY_ADDRESS, REGISTRY_ABI, isZeroAddress } from "../lib/contract";
import { getFriendlyErrorMessage } from "../lib/errors";

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKycComplete: () => void;
}

export const KycModal: React.FC<KycModalProps> = ({
  isOpen,
  onClose,
  onKycComplete,
}) => {
  const { isConnected, address, signer, refreshState, kycStatus } = useWallet();
  const [step, setStep] = useState<"form" | "verifying" | "complete">("form");
  const [name, setName] = useState("Alex Morgan");
  const [fakeId, setFakeId] = useState("DL-8829-SAMPLE");
  const [generatedHash, setGeneratedHash] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsSubmitting(true);
    setStep("verifying");

    try {
      // 1. Calculate keccak256 hash of details in browser (F3 compliance: no personal data on-chain)
      const rawPayload = `${name.trim()}:${fakeId.trim()}:${address.toLowerCase()}`;
      const dataHash = keccak256(toUtf8Bytes(rawPayload));
      setGeneratedHash(dataHash);

      // 2. If on-chain registry is deployed, execute real transaction
      if (!isZeroAddress(REGISTRY_ADDRESS) && signer) {
        toast.info("Waiting for MetaMask signature...");
        const registry = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
        const tx = await registry.requestKyc(dataHash);
        toast.info("Submitting KYC hash to Sepolia registry...");
        await tx.wait();
        await refreshState();
        toast.success("KYC request registered on Sepolia! Status: Pending Approval.");
      } else {
        // Fallback demo simulation
        await new Promise((resolve) => setTimeout(resolve, 900));
        toast.success("Demo KYC request recorded! Hash broadcasted to local testnet.");
      }

      setStep("complete");
      onKycComplete();
    } catch (err: any) {
      console.error("KYC Request error:", err);
      toast.error(getFriendlyErrorMessage(err));
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
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

        {step === "form" && (
          <form onSubmit={handleSubmitKyc} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-semibold">
                  Compliance Gateway · F3
                </span>
                <h3 className="text-xl font-semibold text-[#f6f5f0]">
                  One-Time KYC Verification
                </h3>
              </div>
            </div>

            {/* Universal Approval Banner per PRD */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block font-medium">One KYC, Many Assets:</strong>
                <span>One approval in the shared registry authorizes you for Real Estate, Land Plots, Gold, and Bonds.</span>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div>
                <label className="block text-[#8e887d] mb-1 font-mono">
                  Full Name (Sample Data)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0807] border border-white/10 rounded-xl px-3.5 py-2.5 text-[#f6f5f0] focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8e887d] mb-1 font-mono">
                  Sample ID / Aadhaar / Passport #
                </label>
                <input
                  type="text"
                  value={fakeId}
                  onChange={(e) => setFakeId(e.target.value)}
                  className="w-full bg-[#0a0807] border border-white/10 rounded-xl px-3.5 py-2.5 text-[#f6f5f0] focus:outline-none focus:border-amber-500/50 font-mono"
                  required
                />
              </div>

              {/* Wallet Address Auto-filled */}
              <div>
                <label className="block text-[#8e887d] mb-1 font-mono">
                  Connected Wallet (Auto-filled)
                </label>
                <div className="w-full bg-[#0a0807] border border-white/5 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono text-[11px] truncate flex items-center justify-between">
                  <span>{address || "Wallet not connected"}</span>
                  <Wallet className="w-3.5 h-3.5 text-[#736e65]" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-[#9a9489] space-y-1">
                <div className="font-semibold text-white">Privacy Guarantee:</div>
                <p>
                  Demo KYC, no real personal data is stored. Your details are hashed locally into a 256-bit proof before transmission.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isConnected ? "Submit On-Chain KYC Request" : "Connect Wallet to Continue"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {step === "verifying" && (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin mx-auto" />
            <h4 className="text-base font-semibold text-[#f6f5f0]">
              Hashing & Recording on Registry...
            </h4>
            <p className="text-xs text-[#8e887d] font-mono">
              Computing keccak256 cryptographic identity hash
            </p>
          </div>
        )}

        {step === "complete" && (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Status: Pending Approval
              </span>
              <h3 className="text-xl font-semibold text-[#f6f5f0]">
                KYC Request Recorded!
              </h3>
              <p className="text-xs text-[#9a9489] max-w-xs mx-auto">
                Your wallet request has been posted to the shared registry. Switch to the Admin wallet to approve it, or wait for on-chain verification.
              </p>
            </div>

            {generatedHash && (
              <div className="p-3 rounded-xl bg-[#090706] border border-white/5 text-left text-[10px] font-mono text-[#817b71] break-all">
                <span className="text-[#9e988c] block mb-0.5">Proof Data Hash:</span>
                <span className="text-amber-400">{generatedHash}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-colors"
            >
              Done & Return to App
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
