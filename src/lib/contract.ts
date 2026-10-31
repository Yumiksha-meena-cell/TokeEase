import { JsonRpcProvider } from "ethers";

export interface AssetConfig {
  key: string;
  symbol: string;
  name: string;
  type: "RealEstate" | "Plot" | "Gold" | "Bond";
  address: string;
  deployBlock: number;
  initialPriceEth?: string;
}

// Sepolia RPC configuration with reliable fallback
export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

export function getReadOnlyProvider(): JsonRpcProvider {
  return new JsonRpcProvider(SEPOLIA_RPC_URL);
}

export function isZeroAddress(addr: string | null | undefined): boolean {
  if (!addr) return true;
  return addr.toLowerCase() === "0x0000000000000000000000000000000000000000";
}

// Deployed Sepolia Contract Addresses
export const REGISTRY_ADDRESS = "0xb59EcE2e95d92F7edB468518111B429B59dE2DC9";
export const FLAT_ADDRESS = "0x67c71f57b36de075523ce1502f8f8d46b39164f0";

// Re-export full ABIs from src/contract.js
export { KYC_REGISTRY_ABI, ASSET_TOKEN_ABI } from "../contract";

// Human-readable ABI strings for lightweight ethers.js usage
export const REGISTRY_ABI = [
  "function isKycApproved(address user) external view returns (bool)",
  "function isApproved(address user) external view returns (bool)",
  "function kycStatus(address user) external view returns (uint8)",
  "function kycHash(address user) external view returns (bytes32)",
  "function requestKyc(bytes32 dataHash) external",
  "function approveKyc(address user) external",
  "function rejectKyc(address user) external",
  "function revokeKyc(address user) external",
  "function getKycRequesters() external view returns (address[])",
  "function owner() external view returns (address)",
  "event KycRequested(address indexed user, bytes32 dataHash)",
  "event KycApproved(address indexed user)",
  "event KycRejected(address indexed user)",
];

export const ASSET_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function pricePerTokenWei() external view returns (uint256)",
  "function primarySaleRemaining() external view returns (uint256)",
  "function totalSpentWei(address account) external view returns (uint256)",
  "function assetType() external view returns (uint8)",
  "function assetName() external view returns (string)",
  "function assetLocation() external view returns (string)",
  "function documentURI() external view returns (string)",
  "function faceValueWei() external view returns (uint256)",
  "function couponRateBps() external view returns (uint256)",
  "function maturityTimestamp() external view returns (uint256)",
  "function bondTermsSet() external view returns (bool)",
  "function owner() external view returns (address)",
  "function registry() external view returns (address)",
  "function buy(uint256 amount) external payable",
  "function setAssetInfo(string memory name, string memory location, string memory docURI) external",
  "function setBondTerms(uint256 _faceValueWei, uint256 _couponRateBps, uint256 _maturityTimestamp) external",
  "function updatePrice(uint256 newPriceWei) external",
  "function distributeIncome() external payable",
  "function settleMaturity() external payable",
  "function withdraw() external",
  "function getPriceHistory() external view returns (uint256[] memory timestamps, uint256[] memory prices)",
  "function createListing(uint256 amount, uint256 priceWei) external",
  "function buyListing(uint256 id) external payable",
  "function cancelListing(uint256 id) external",
  "function listingsCount() external view returns (uint256)",
  "function listings(uint256 id) external view returns (address seller, uint256 amount, uint256 pricePerTokenWei, bool active)",
  "event TokensPurchased(address indexed buyer, uint256 amount, uint256 pricePerToken)",
  "event PriceUpdated(uint256 oldPrice, uint256 newPrice)",
  "event IncomeDistributed(uint256 total, uint256 holderCount)",
  "event IncomeSendFailed(address indexed holder, uint256 amount)",
  "event MaturitySettled(uint256 total, uint256 holderCount)",
  "event ListingCreated(uint256 indexed id, address indexed seller, uint256 amount, uint256 priceWei)",
  "event ListingSold(uint256 indexed id, address indexed buyer)",
  "event ListingCancelled(uint256 indexed id)",
];

// ASSETS list containing ONLY Flat (naam 'Jaipur Flat', type RealEstate)
export const ASSETS: AssetConfig[] = [
  {
    key: "jaipur-flat",
    symbol: "JFT",
    name: "Jaipur Flat",
    type: "RealEstate",
    address: FLAT_ADDRESS,
    deployBlock: 0,
    initialPriceEth: "0.0001",
  },
];
