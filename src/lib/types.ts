export interface Asset {
  key: string;
  symbol: string;
  name: string;
  type: "RealEstate" | "Plot" | "Gold" | "Bond";
  typeLabel: string;
  description: string;
  priceInr: number;
  priceEth: string;
  pricePerTokenWei: bigint;
  totalSupply: number;
  primarySaleRemaining: number;
  assetLocation: string;
  documentUri: string;
  highlight: string;
  disclaimer: string;
  address?: string;
  currentYield?: string; // only for Bond
  unitText?: string;     // e.g. "0.01 g" for gold
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  type: string;
  tokens: number;
  valueInr: number;
  valueEth: string;
  color: string;
}
