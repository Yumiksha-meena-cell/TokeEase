import { NextResponse } from "next/server";
import { formatEther } from "ethers";
import {
  REGISTRY_ADDRESS,
  ASSETS,
  isZeroAddress,
  getReadOnlyProvider,
} from "../../../lib/contract";

export async function GET() {
  try {
    const isLive = !isZeroAddress(REGISTRY_ADDRESS);

    // Mock overview when contracts are in sandbox mode
    return NextResponse.json({
      success: true,
      protocol: "TokeEase",
      tagline: "Tokenised Micro-Investing & Digital-Assets Wallet",
      network: "Sepolia Testnet (Chain ID 11155111)",
      status: isLive ? "Contracts Live on Sepolia" : "Sandbox / Ready for Deploy",
      stats: {
        totalSupportedAssets: ASSETS.length,
        assetClasses: ["Real Estate", "Land Plot", "Digital Gold", "Bond"],
        totalTokenSupply: 45000,
        minInvestmentInr: 150,
        minInvestmentEth: "0.00003 ETH",
        demoConversion: "0.0001 ETH = 500 INR",
      },
      features: {
        F1_AssetToken: "ERC-20, 0 decimals, unified contract engine",
        F3_FakeKycRequest: "keccak256 proof hash submitted to shared registry",
        F4_AdminApproval: "One KYC approval validates wallet across all 4 assets",
        F6_ComplianceRule: "Smart contract hook _update rejects unapproved wallets",
        F8_AdminPriceUpdate: "Timestamped price updates with on-chain history",
        F10_IncomeDistribution: "Automatic ETH distribution (Rent for Flat, Coupon for Bond)",
        F11_Marketplace: "Peer-to-peer listing & whole-order buying with escrow",
        F12_AiRiskExplainer: "/api/explain-risk LLM integration with fallback profiles",
        F17_BondTokens: "8% coupon, 3 years maturity, automated yield tracking",
        F18_BondMaturity: "settleMaturity function implemented in contract",
        F19_CombinedPortfolio: "Cross-asset holdings table with real P/L calculations",
      },
      disclaimer: "Prototype on Sepolia testnet. No real money. No real property, gold or bonds. Not financial advice.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate stats" },
      { status: 500 }
    );
  }
}
