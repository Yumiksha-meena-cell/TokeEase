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

// Sepolia RPC configuration
export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

export function getReadOnlyProvider(): JsonRpcProvider {
  return new JsonRpcProvider(SEPOLIA_RPC_URL);
}

export function isZeroAddress(addr: string | null | undefined): boolean {
  if (!addr) return true;
  return addr.toLowerCase() === "0x0000000000000000000000000000000000000000";
}

// Registry contract placeholder
export const REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  "event KycRejected(address indexed user)"
];

// Asset contract ABI matching AssetToken.sol
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
  "event ListingCancelled(uint256 indexed id)"
];

// The 4 PRD Assets (Section 8.7)
export const ASSETS: AssetConfig[] = [
  {
    key: "jaipur-flat",
    symbol: "JFT",
    name: "Jaipur Flat",
    type: "RealEstate",
    address: "0x0000000000000000000000000000000000000000",
    deployBlock: 0,
    initialPriceEth: "0.0001",
  },
  {
    key: "jaipur-plot",
    symbol: "JPT",
    name: "Jaipur Plot",
    type: "Plot",
    address: "0x0000000000000000000000000000000000000000",
    deployBlock: 0,
    initialPriceEth: "0.0001",
  },
  {
    key: "digital-gold",
    symbol: "TGOLD",
    name: "Digital Gold",
    type: "Gold",
    address: "0x0000000000000000000000000000000000000000",
    deployBlock: 0,
    initialPriceEth: "0.00003",
  },
  {
    key: "sample-bond",
    symbol: "TBOND",
    name: "Sample Bond",
    type: "Bond",
    address: "0x0000000000000000000000000000000000000000",
    deployBlock: 0,
    initialPriceEth: "0.0001",
  },
];
