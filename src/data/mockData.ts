import { Asset, PortfolioHolding } from "../lib/types";
import { inrToWei } from "../lib/format";
import { FLAT_ADDRESS } from "../lib/contract";

// ASSETS list containing ONLY Flat (name: 'Jaipur Flat', type: RealEstate)
export const MOCK_ASSETS: Asset[] = [
  {
    key: "jaipur-flat",
    symbol: "JFT",
    name: "Jaipur Flat",
    type: "RealEstate",
    typeLabel: "Real Estate",
    description: "Fractional share in a prime 3BHK residential rental apartment located in Vaishali Nagar, Jaipur.",
    priceInr: 500,
    priceEth: "0.0001 ETH",
    pricePerTokenWei: inrToWei(500),
    totalSupply: 10000,
    primarySaleRemaining: 10000,
    assetLocation: "Vaishali Nagar, Jaipur, Rajasthan",
    documentUri: `https://sepolia.etherscan.io/address/${FLAT_ADDRESS}`,
    highlight: "Earns rent",
    disclaimer: "Simulated rental yield. Tokenized on Sepolia testnet at 0x67c71f57b36de075523ce1502f8f8d46b39164f0.",
    address: FLAT_ADDRESS,
  },
];

export const MOCK_HOLDINGS: PortfolioHolding[] = [
  {
    id: "jft",
    symbol: "JFT",
    name: "Jaipur Flat",
    type: "Real Estate",
    tokens: 0,
    valueInr: 0,
    valueEth: "0.0000 ETH",
    color: "#10b981",
  },
];

export const AI_PROMPTS = [
  {
    question: "Is this asset high risk?",
    answer:
      "Jaipur Flat (JFT) is a fractional real-world real estate asset deployed on the Sepolia Ethereum testnet. It tracks tenant rental yields and property value in Vaishali Nagar, Jaipur. Since this is deployed on the Sepolia testnet sandbox, all transactions use test ETH with zero real financial risk.",
  },
  {
    question: "How does the Jaipur Flat token work?",
    answer:
      "The Jaipur Flat (JFT) contract is deployed on Sepolia (0x67c71f57b36de075523ce1502f8f8d46b39164f0). Each token is priced at 0.0001 ETH (approx ₹500). Only KYC-approved wallets can hold or buy tokens, enforced directly by the KycRegistry smart contract.",
  },
  {
    question: "How do I earn rental income?",
    answer:
      "When the asset admin distributes rental income via distributeIncome(), test ETH is sent proportionately to all token holders based on their balance at that block.",
  },
];
