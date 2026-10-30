export interface RiskDetail {
  category: string;
  description: string;
}

export interface AssetRiskProfile {
  assetType: "RealEstate" | "Plot" | "Gold" | "Bond";
  keyRisks: string[];
  fallbackSummary: string;
  disclaimer: string;
}

export const ASSET_RISK_PROFILES: Record<string, AssetRiskProfile> = {
  RealEstate: {
    assetType: "RealEstate",
    keyRisks: ["Liquidity Risk", "Valuation Uncertainty", "Regulatory Uncertainty", "Tenant Concentration"],
    fallbackSummary:
      "Investing in fractional real estate tokens carries liquidity risk because secondary sales depend on willing buyers on the testnet. Property valuations may fluctuate with market demand and tenant occupancy. Because tokenisation frameworks in India are evolving, legal title deeds remain off-chain. This is educational, not financial advice.",
    disclaimer: "Educational simulation on Sepolia testnet. No real-world property deed is transferred.",
  },
  Plot: {
    assetType: "Plot",
    keyRisks: ["Illiquidity", "Valuation Volatility", "Title & Encroachment", "Regulatory Compliance"],
    fallbackSummary:
      "Land plots generate zero rental cash flow and rely entirely on capital appreciation. Liquidity is constrained as fractional plots cannot be partitioned physically. Real-world land investments face zoning, encroachment, and title verification challenges not represented on a testnet. This is educational, not financial advice.",
    disclaimer: "Educational simulation on Sepolia testnet. Does not represent official land registry records.",
  },
  Gold: {
    assetType: "Gold",
    keyRisks: ["Price Volatility", "Custody & Vault Storage", "No Physical Redemption", "Regulatory Exposure"],
    fallbackSummary:
      "Digital Gold tokens mirror fluctuating commodity bullion market prices. While physical gold has intrinsic value, testnet tokens have no real vaulted bullion backing them and cannot be redeemed for physical gold. Gold also yields zero regular interest income. This is educational, not financial advice.",
    disclaimer: "Educational simulation on Sepolia testnet. No physical gold bars are reserved or vaulted.",
  },
  Bond: {
    assetType: "Bond",
    keyRisks: ["Credit & Default Risk", "Interest Rate Sensitivity", "Secondary Illiquidity", "Regulatory Framework"],
    fallbackSummary:
      "Corporate bond tokens are subject to credit risk if the simulated borrower defaults on periodic coupon or face value repayment. Bond valuations also fall when market interest rates rise. These demo bonds are unrated and lack institutional debt covenants. This is educational, not financial advice.",
    disclaimer: "Educational simulation on Sepolia testnet. Not issued or rated by registered financial authorities.",
  },
};

export function getRiskFallback(assetType: string, assetName?: string): string {
  const normalized = assetType.replace(/\s+/g, "");
  const profile = ASSET_RISK_PROFILES[normalized] || ASSET_RISK_PROFILES["RealEstate"];
  return profile.fallbackSummary;
}
