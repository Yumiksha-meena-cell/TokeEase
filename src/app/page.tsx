"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { TrustStrip } from "../components/TrustStrip";
import { ImpactStats } from "../components/ImpactStats";
import { HowItWorks } from "../components/HowItWorks";
import { AssetMarketplace } from "../components/AssetMarketplace";
import { WalletPreview } from "../components/WalletPreview";
import { AiAssistantSection } from "../components/AiAssistantSection";
import { SecurityGrid } from "../components/SecurityGrid";
import { FooterCta } from "../components/FooterCta";
import { Footer } from "../components/Footer";
import { AssetModal } from "../components/AssetModal";
import { WalletModal } from "../components/WalletModal";
import { KycModal } from "../components/KycModal";
import { VideoTourModal } from "../components/VideoTourModal";
import { Asset } from "../lib/types";
import { formatInr } from "../lib/format";
import { useWallet } from "../context/WalletContext";

export default function Home() {
  const { isConnected, address, shortAddress } = useWallet();

  // Application State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [isVideoTourOpen, setIsVideoTourOpen] = useState<boolean>(false);

  const handleScrollToMarketplace = () => {
    const el = document.getElementById("marketplace");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToWallet = () => {
    const el = document.getElementById("wallet-preview");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSimulatedBuy = (asset: Asset, tokens: number, costInr: number) => {
    toast.success(`Minted ${tokens} ${asset.symbol} tokens (${formatInr(costInr)})`);
  };

  return (
    <div className="relative min-h-screen bg-[#080706] text-[#f6f5f0] overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navigation Bar (Wallet is login) */}
      <Navbar
        isWalletConnected={isConnected}
        walletAddress={address || undefined}
        onConnectWallet={() => setIsWalletModalOpen(true)}
      />

      {/* Hero Section with Dashboard Mockup */}
      <HeroSection
        onExploreClick={handleScrollToMarketplace}
        onWatchHowItWorks={() => setIsVideoTourOpen(true)}
      />

      {/* Trust & Value Strip directly below Hero */}
      <TrustStrip />

      {/* Impact & Honest Prototype Statistics */}
      <ImpactStats />

      {/* Three Steps: Verify, Choose (Featured Glow), Own */}
      <HowItWorks
        onOpenKycModal={() => setIsKycModalOpen(true)}
        onExploreAssets={handleScrollToMarketplace}
        onOpenWallet={handleScrollToWallet}
      />

      {/* Asset Marketplace Preview */}
      <AssetMarketplace
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />

      {/* Dedicated Wallet & Digital Assets Preview */}
      <WalletPreview
        onOpenConnectModal={() => setIsWalletModalOpen(true)}
        isWalletConnected={isConnected}
        walletAddress={shortAddress}
      />

      {/* Plain Language AI Assistant ("TokeEase Guide") */}
      <AiAssistantSection />

      {/* Security, Testnet Contracts, and Technical Foundation */}
      <SecurityGrid />

      {/* Footer Call-to-Action */}
      <FooterCta
        onLaunchWallet={() => setIsWalletModalOpen(true)}
      />

      {/* Global Footer with Compliance Disclaimer */}
      <Footer />

      {/* Interactive Modals */}
      <AssetModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onSimulatedBuy={handleSimulatedBuy}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        onKycComplete={() => {
          toast.success("Demo KYC Hash Recorded on Sepolia Sandbox");
        }}
      />

      <VideoTourModal
        isOpen={isVideoTourOpen}
        onClose={() => setIsVideoTourOpen(false)}
        onExploreAssets={handleScrollToMarketplace}
      />
    </div>
  );
}
