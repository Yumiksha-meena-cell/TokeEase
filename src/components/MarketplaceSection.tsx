"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Contract, formatEther, parseEther } from "ethers";
import {
  Tag,
  ShoppingBag,
  PlusCircle,
  XCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "../context/WalletContext";
import { ASSET_ABI, isZeroAddress } from "../lib/contract";
import { shortAddress, formatInr, formatEth } from "../lib/format";
import { getFriendlyErrorMessage } from "../lib/errors";

export interface MarketplaceListing {
  id: number;
  seller: string;
  amount: number;
  pricePerTokenWei: bigint;
  pricePerTokenEth: string;
  pricePerTokenInr: number;
  totalCostEth: string;
  totalCostInr: number;
  active: boolean;
  isOwnerListing: boolean;
}

interface MarketplaceSectionProps {
  assetSymbol: string;
  assetAddress: string;
  userTokenBalance?: number;
  onOpenKycModal?: () => void;
}

export const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({
  assetSymbol,
  assetAddress,
  userTokenBalance = 0,
  onOpenKycModal,
}) => {
  const { isConnected, address, signer, kycStatus } = useWallet();

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [listAmount, setListAmount] = useState<number>(1);
  const [listPriceEth, setListPriceEth] = useState<string>("0.0001");
  const [submitting, setSubmitting] = useState(false);

  // Mock demo listings when contract is in placeholder mode
  const loadMockListings = useCallback(() => {
    const isGold = assetSymbol === "TGOLD";
    const sample: MarketplaceListing[] = [
      {
        id: 0,
        seller: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        amount: isGold ? 10 : 5,
        pricePerTokenWei: isGold ? 30000000000000n : 100000000000000n,
        pricePerTokenEth: isGold ? "0.00003" : "0.0001",
        pricePerTokenInr: isGold ? 150 : 500,
        totalCostEth: isGold ? "0.0003" : "0.0005",
        totalCostInr: isGold ? 1500 : 2500,
        active: true,
        isOwnerListing: false,
      },
    ];
    setListings(sample);
  }, [assetSymbol]);

  const fetchListings = useCallback(async () => {
    if (!assetAddress || isZeroAddress(assetAddress)) {
      loadMockListings();
      return;
    }

    try {
      setLoading(true);
      // In real on-chain mode, connect to contract
      if (!signer) {
        loadMockListings();
        return;
      }

      const assetContract = new Contract(assetAddress, ASSET_ABI, signer);
      const count = await assetContract.listingsCount();
      const countNum = Number(count);

      const items: MarketplaceListing[] = [];
      for (let i = 0; i < countNum; i++) {
        const item = await assetContract.listings(i);
        if (item.active) {
          const amt = Number(item.amount);
          const priceWei = BigInt(item.pricePerTokenWei);
          const totalWei = priceWei * BigInt(amt);
          const ethCost = formatEther(totalWei);
          const priceEth = formatEther(priceWei);
          const priceInr = Math.round((Number(priceEth) / 0.0001) * 500);
          const totalInr = Math.round((Number(ethCost) / 0.0001) * 500);

          items.push({
            id: i,
            seller: item.seller,
            amount: amt,
            pricePerTokenWei: priceWei,
            pricePerTokenEth: priceEth,
            pricePerTokenInr: priceInr,
            totalCostEth: ethCost,
            totalCostInr: totalInr,
            active: item.active,
            isOwnerListing:
              address?.toLowerCase() === item.seller.toLowerCase(),
          });
        }
      }
      setListings(items);
    } catch (err) {
      console.error("Failed to load listings:", err);
      loadMockListings();
    } finally {
      setLoading(false);
    }
  }, [assetAddress, signer, address, loadMockListings]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle Create Listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (kycStatus !== "Approved") {
      toast.error("Compliance: Only KYC approved wallets can list tokens.");
      onOpenKycModal?.();
      return;
    }
    if (listAmount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      if (assetAddress && !isZeroAddress(assetAddress) && signer) {
        toast.info("Waiting for MetaMask signature...");
        const assetContract = new Contract(assetAddress, ASSET_ABI, signer);
        const priceWei = parseEther(listPriceEth);
        const tx = await assetContract.createListing(listAmount, priceWei);
        toast.info("Transaction sent: Escrowing tokens...");
        await tx.wait();
        toast.success("Listing created successfully on Sepolia!");
        fetchListings();
      } else {
        // Simulated local listing
        const priceWei = parseEther(listPriceEth);
        const priceInr = Math.round((Number(listPriceEth) / 0.0001) * 500);
        const newListing: MarketplaceListing = {
          id: listings.length + 1,
          seller: address || "0xMyWallet",
          amount: listAmount,
          pricePerTokenWei: priceWei,
          pricePerTokenEth: listPriceEth,
          pricePerTokenInr: priceInr,
          totalCostEth: (Number(listPriceEth) * listAmount).toFixed(6),
          totalCostInr: priceInr * listAmount,
          active: true,
          isOwnerListing: true,
        };
        setListings((prev) => [newListing, ...prev]);
        toast.success(`Demo listing created: ${listAmount} ${assetSymbol} tokens.`);
      }
      setIsCreating(false);
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Buy Listing
  const handleBuyListing = async (listing: MarketplaceListing) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to purchase listings.");
      return;
    }
    if (kycStatus !== "Approved") {
      toast.error("Compliance Check Reverted: Recipient is not KYC approved.");
      onOpenKycModal?.();
      return;
    }

    setSubmitting(true);
    try {
      if (assetAddress && !isZeroAddress(assetAddress) && signer) {
        toast.info("Waiting for MetaMask confirmation...");
        const assetContract = new Contract(assetAddress, ASSET_ABI, signer);
        const totalWei = listing.pricePerTokenWei * BigInt(listing.amount);
        const tx = await assetContract.buyListing(listing.id, { value: totalWei });
        toast.info("Executing peer-to-peer settlement on Sepolia...");
        await tx.wait();
        toast.success(`Purchased ${listing.amount} ${assetSymbol} tokens!`);
        fetchListings();
      } else {
        // Simulated purchase
        toast.success(`Purchased ${listing.amount} ${assetSymbol} tokens in demo mode!`);
        setListings((prev) => prev.filter((l) => l.id !== listing.id));
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Cancel Listing
  const handleCancelListing = async (listingId: number) => {
    setSubmitting(true);
    try {
      if (assetAddress && !isZeroAddress(assetAddress) && signer) {
        toast.info("Cancelling listing on Sepolia...");
        const assetContract = new Contract(assetAddress, ASSET_ABI, signer);
        const tx = await assetContract.cancelListing(listingId);
        await tx.wait();
        toast.success("Listing cancelled and tokens returned from escrow!");
        fetchListings();
      } else {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
        toast.success("Demo listing cancelled.");
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0c0908] border border-white/5 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#f6f5f0]">
              P2P Marketplace · {assetSymbol}
            </h3>
            <p className="text-xs text-[#8e887d]">
              Trade fractional tokens directly with other KYC-approved holders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isCreating ? "Close Form" : "List for Sale"}</span>
          </button>
          <button
            onClick={fetchListings}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8e887d] hover:text-white transition-colors"
            title="Refresh listings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Create Listing Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateListing}
          className="p-4 rounded-xl bg-[#14100e] border border-amber-500/25 space-y-4 animate-in fade-in duration-150"
        >
          <div className="text-xs font-mono font-semibold text-amber-400">
            Create Peer-to-Peer Listing (Tokens held in contract escrow)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-[#8e887d] block mb-1">
                Amount of Tokens to Sell:
              </label>
              <input
                type="number"
                min={1}
                value={listAmount}
                onChange={(e) => setListAmount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#0a0807] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#8e887d] block mb-1">
                Asking Price Per Token (ETH):
              </label>
              <input
                type="text"
                value={listPriceEth}
                onChange={(e) => setListPriceEth(e.target.value)}
                className="w-full bg-[#0a0807] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8e887d]">
            <span>
              Total Listing Value:{" "}
              <span className="text-amber-300 font-semibold">
                {(Number(listPriceEth || 0) * listAmount).toFixed(6)} ETH
              </span>{" "}
              (≈ {formatInr(Math.round(((Number(listPriceEth || 0) * listAmount) / 0.0001) * 500))})
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {submitting ? "Confirming..." : "Confirm & Escrow Tokens"}
            </button>
          </div>
        </form>
      )}

      {/* Listings Table */}
      {listings.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#787268] space-y-1">
          <ShoppingBag className="w-6 h-6 text-[#787268] mx-auto mb-2 opacity-50" />
          <p>No active marketplace listings for {assetSymbol}.</p>
          <p className="text-[11px] text-[#5a554d]">
            Verified holders can list their tokens for sale at custom prices anytime.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#817b71] text-[10px] uppercase">
                <th className="pb-2.5">Seller</th>
                <th className="pb-2.5">Quantity</th>
                <th className="pb-2.5">Price / Token</th>
                <th className="pb-2.5">Total Value</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#d6d0c4]">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 text-amber-300">
                    {shortAddress(l.seller)}
                    {l.isOwnerListing && (
                      <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        You
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-white font-semibold">
                    {l.amount} {assetSymbol}
                  </td>
                  <td className="py-3">
                    <div>{formatInr(l.pricePerTokenInr)}</div>
                    <div className="text-[10px] text-[#817b71]">{l.pricePerTokenEth} ETH</div>
                  </td>
                  <td className="py-3">
                    <div className="text-emerald-400 font-semibold">
                      {formatInr(l.totalCostInr)}
                    </div>
                    <div className="text-[10px] text-[#817b71]">{l.totalCostEth} ETH</div>
                  </td>
                  <td className="py-3 text-right">
                    {l.isOwnerListing ? (
                      <button
                        onClick={() => handleCancelListing(l.id)}
                        disabled={submitting}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] transition-colors"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyListing(l)}
                        disabled={submitting}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] transition-colors"
                      >
                        Buy Listing
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
  );
};
