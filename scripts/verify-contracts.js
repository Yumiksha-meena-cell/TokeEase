const { ethers } = require("ethers");

const RPC_URLS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
  "https://rpc2.sepolia.org",
  "https://1rpc.io/sepolia",
  "https://sepolia.drpc.org",
];

const KYCREGISTRY_ADDRESS = "0xb59EcE2e95d92F7edB468518111B429B59dE2DC9";
const FLAT_ADDRESS = "0x67c71f57b36de075523ce1502f8f8d46b39164f0";

const FLAT_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function owner() external view returns (address)",
  "function registry() external view returns (address)",
  "function pricePerTokenWei() external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function primarySaleRemaining() external view returns (uint256)",
  "function assetName() external view returns (string)",
];

const REGISTRY_ABI = [
  "function owner() external view returns (address)",
];

async function check() {
  let provider;
  for (const url of RPC_URLS) {
    try {
      console.log(`Connecting to RPC: ${url}...`);
      const p = new ethers.JsonRpcProvider(url);
      await p.getBlockNumber();
      provider = p;
      console.log(`Successfully connected to ${url}`);
      break;
    } catch (e) {
      console.log(`Failed connecting to ${url}: ${e.message}`);
    }
  }

  if (!provider) {
    console.error("Could not connect to any Sepolia RPC provider.");
    process.exit(1);
  }

  const flat = new ethers.Contract(FLAT_ADDRESS, FLAT_ABI, provider);
  const registry = new ethers.Contract(KYCREGISTRY_ADDRESS, REGISTRY_ABI, provider);

  console.log("\n--- Reading Flat Contract on Sepolia ---");
  const [name, symbol, flatOwner, regAddress, price, totalSupply, remaining, assetName] = await Promise.all([
    flat.name().catch((e) => "Error: " + e.message),
    flat.symbol().catch((e) => "Error: " + e.message),
    flat.owner().catch((e) => "Error: " + e.message),
    flat.registry().catch((e) => "Error: " + e.message),
    flat.pricePerTokenWei().catch((e) => "Error: " + e.message),
    flat.totalSupply().catch((e) => "Error: " + e.message),
    flat.primarySaleRemaining().catch((e) => "Error: " + e.message),
    flat.assetName().catch((e) => "Error: " + e.message),
  ]);

  const regOwner = await registry.owner().catch((e) => "Error: " + e.message);

  console.log(`Flat Name: ${name}`);
  console.log(`Flat Symbol: ${symbol}`);
  console.log(`Flat Owner: ${flatOwner}`);
  console.log(`Flat Registry: ${regAddress}`);
  console.log(`Flat Price (wei): ${price.toString()}`);
  console.log(`Flat Total Supply: ${totalSupply.toString()}`);
  console.log(`Flat Primary Remaining: ${remaining.toString()}`);
  console.log(`Flat Asset Name: "${assetName}"`);
  console.log(`\nRegistry Owner: ${regOwner}`);

  // Check owner pattern: 0xb6b388fd... and ...104E478 (case insensitive)
  const ownerLower = (flatOwner || "").toLowerCase();
  const expectedStart = "0xb6b388fd";
  const expectedEnd = "104e478";

  const ownerMatches = ownerLower.startsWith(expectedStart.toLowerCase()) && ownerLower.endsWith(expectedEnd.toLowerCase());
  console.log(`\nOwner check (starts with 0xb6b388fd and ends with 104E478): ${ownerMatches ? "MATCHES!" : "DOES NOT MATCH!"} (Actual: ${flatOwner})`);

  // Check registry matches
  const regMatches = (regAddress || "").toLowerCase() === KYCREGISTRY_ADDRESS.toLowerCase();
  console.log(`Registry address check (matches ${KYCREGISTRY_ADDRESS}): ${regMatches ? "MATCHES!" : "DOES NOT MATCH!"} (Actual: ${regAddress})`);
}

check().catch((err) => {
  console.error(err);
  process.exit(1);
});
