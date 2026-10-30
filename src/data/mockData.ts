import { Asset, PortfolioHolding } from "../lib/types";
import { inrToWei } from "../lib/format";

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
    primarySaleRemaining: 8200,
    assetLocation: "Jaipur, Rajasthan (sample)",
    documentUri: "https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000",
    highlight: "Earns rent",
    disclaimer: "Simulated rental yield. Token does not represent legal property registry in India.",
  },
  {
    key: "jaipur-plot",
    symbol: "JPT",
    name: "Jaipur Plot",
    type: "Plot",
    typeLabel: "Land Plot",
    description: "Fractional interest in an upcoming plotted commercial-residential corridor in Jagatpura Extension, Jaipur.",
    priceInr: 500,
    priceEth: "0.0001 ETH",
    pricePerTokenWei: inrToWei(500),
    totalSupply: 5000,
    primarySaleRemaining: 3900,
    assetLocation: "Jaipur outskirts (sample)",
    documentUri: "https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000",
    highlight: "Land appreciation",
    disclaimer: "Land plot appreciation model. No live registry deed.",
  },
  {
    key: "digital-gold",
    symbol: "TGOLD",
    name: "Digital Gold",
    type: "Gold",
    typeLabel: "Digital Gold",
    description: "Simulated 99.9% pure gold fractions. 1 token equals 0.01 gram of vaulted gold.",
    priceInr: 150,
    priceEth: "0.00003 ETH",
    pricePerTokenWei: inrToWei(150),
    totalSupply: 20000,
    primarySaleRemaining: 18200,
    assetLocation: "1 token = 0.01 gram (demo)",
    documentUri: "https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000",
    highlight: "1 token = 0.01 g",
    unitText: "0.01 g",
    disclaimer: "Simulated gold rate, not a live price. 1 token = 0.01 g. Prototype only. No physical gold is stored.",
  },
  {
    key: "sample-bond",
    symbol: "TBOND",
    name: "Sample Bond",
    type: "Bond",
    typeLabel: "Bond",
    description: "A simulated renewable energy corporate debt instrument with an 8% coupon payout.",
    priceInr: 500,
    priceEth: "0.0001 ETH",
    pricePerTokenWei: inrToWei(500),
    totalSupply: 10000,
    primarySaleRemaining: 8400,
    assetLocation: "8% coupon, 3 years (demo)",
    documentUri: "https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000",
    highlight: "8% coupon",
    currentYield: "8.0%",
    disclaimer: "Sample corporate bond with 8% coupon. Simulated issuer. Not a real issuer, rating or security.",
  },
];

export const MOCK_HOLDINGS: PortfolioHolding[] = [
  {
    id: "tgold",
    symbol: "TGOLD",
    name: "Digital Gold",
    type: "Digital Gold",
    tokens: 40,
    valueInr: 6000,
    valueEth: "0.0012 ETH",
    color: "#f59e0b",
  },
  {
    id: "jft",
    symbol: "JFT",
    name: "Jaipur Flat",
    type: "Real Estate",
    tokens: 8,
    valueInr: 4000,
    valueEth: "0.0008 ETH",
    color: "#10b981",
  },
  {
    id: "tbond",
    symbol: "TBOND",
    name: "Sample Bond",
    type: "Bond",
    tokens: 5,
    valueInr: 2500,
    valueEth: "0.0005 ETH",
    color: "#fb923c",
  },
];

export const AI_PROMPTS = [
  {
    question: "Is this asset high risk?",
    answer:
      "Asset risk depends on the category. Digital Gold (TGOLD) tracks physical gold prices; Jaipur Flat (JFT) and Jaipur Plot (JPT) depend on real estate rental occupancy and land valuation; and Sample Bond (TBOND) provides fixed coupon payouts. Since this is an educational testnet, all holdings are simulated with zero financial risk.",
  },
  {
    question: "Explain tokenised gold",
    answer:
      "Digital Gold (TGOLD) on TokeEase splits gold into fractional tokens priced at ₹150 (0.00003 ETH). 1 token equals 0.01 g. The smart contract tracks ownership on the Sepolia Ethereum testnet. Simulated gold rate, not a live price.",
  },
  {
    question: "What does current yield mean?",
    answer:
      "Current yield applies to our bond asset (TBOND). It calculates the annual coupon payout relative to the current token price: (faceValueWei × couponRateBps) / (10000 × pricePerTokenWei). For TBOND, the simulated yield is 8.0%.",
  },
  {
    question: "Compare bonds and real estate",
    answer:
      "Bonds (TBOND) offer scheduled coupon payouts with an 8% coupon rate. Real estate (JFT) earns simulated rental distributions from tenant lease models, while land plots (JPT) focus on long-term capital appreciation.",
  },
];
