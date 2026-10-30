"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Asset } from "../lib/types";
import { ASSET_RISK_PROFILES, getRiskFallback } from "../lib/riskFallback";

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const RiskModal: React.FC<RiskModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const [loading, setLoading] = useState(false);
  const [riskText, setRiskText] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  useEffect(() => {
    if (!isOpen || !asset) return;

    let isMounted = true;
    setLoading(true);

    const fetchExplanation = async () => {
      try {
        const res = await fetch("/api/explain-risk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetName: asset.name,
            assetType: asset.type,
          }),
        });

        if (!res.ok) {
          throw new Error("API error");
        }

        const data = await res.json();
        if (isMounted) {
          setRiskText(data.text);
          setIsAiGenerated(!data.isFallback);
        }
      } catch (err) {
        if (isMounted) {
          setRiskText(getRiskFallback(asset.type, asset.name));
          setIsAiGenerated(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, asset]);

  if (!isOpen || !asset) return null;

  const profile =
    ASSET_RISK_PROFILES[asset.type] || ASSET_RISK_PROFILES["RealEstate"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#130f0d] border border-amber-500/30 shadow-2xl shadow-black/90 p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#8e887d] hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-semibold">
                Risk Analysis
              </span>
              {isAiGenerated ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> AI Powered
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#9a9489] border border-white/10">
                  Standard Profile
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-[#f6f5f0]">
              {asset.name} ({asset.symbol})
            </h2>
          </div>
        </div>

        {/* Key Risk Factors Badges */}
        <div className="mb-5">
          <span className="text-xs font-mono text-[#8e887d] block mb-2">
            PRIMARY RISK VECTORS
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.keyRisks.map((risk, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#1a1411] border border-white/5 text-[#d6d0c4]"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400/80" />
                {risk}
              </span>
            ))}
          </div>
        </div>

        {/* Main Risk Explanation Body */}
        <div className="p-4 rounded-xl bg-[#0a0807] border border-white/5 mb-5 min-h-[120px] flex items-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full py-6 space-y-3">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
              <p className="text-xs font-mono text-[#8e887d]">
                Evaluating asset risk parameters...
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#d6d0c4] leading-relaxed">
              {riskText}
            </p>
          )}
        </div>

        {/* Mandatory Regulatory / Educational Notice */}
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-start gap-2.5 mb-6 text-[11px] text-[#9a9489]">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            {profile.disclaimer} Always do your own research before participating in testnet simulations.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Understood & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
