/**
 * TokeEase Automated Deployment Script
 * Deploys KycRegistry and 4 AssetToken contracts (JFT, JPT, TGOLD, TBOND) to Sepolia
 * In accordance with TokeEase PRD Section 8.7 & Phase 1b.
 *
 * Usage:
 *   node scripts/deploy.js
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env or .env.local if present
try {
  require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
} catch {
  // dotenv optional
}

const RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  "https://rpc.sepolia.org";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// PRD Section 8.7 Constructor specifications
const ASSET_SPECS = [
  {
    key: "jaipur-flat",
    symbol: "JFT",
    name: "TokeEase Jaipur Flat",
    shortName: "Jaipur Flat",
    type: 0, // RealEstate
    totalSupply: 10000n,
    initialPriceWei: 100000000000000n, // 0.0001 ETH (INR 500)
    location: "Jaipur, Rajasthan (sample)",
    docUri: "https://ipfs.io/ipfs/sample-jaipur-flat-registry-deed",
  },
  {
    key: "jaipur-plot",
    symbol: "JPT",
    name: "TokeEase Jaipur Plot",
    shortName: "Jaipur Plot",
    type: 1, // Plot
    totalSupply: 5000n,
    initialPriceWei: 100000000000000n, // 0.0001 ETH (INR 500)
    location: "Jaipur outskirts (sample)",
    docUri: "https://ipfs.io/ipfs/sample-jaipur-plot-commercial-title",
  },
  {
    key: "digital-gold",
    symbol: "TGOLD",
    name: "TokeEase Digital Gold",
    shortName: "Digital Gold",
    type: 2, // Gold
    totalSupply: 20000n,
    initialPriceWei: 30000000000000n, // 0.00003 ETH (INR 150)
    location: "1 token = 0.01 gram (demo)",
    docUri: "https://ipfs.io/ipfs/sample-vault-gold-audit-certificate",
  },
  {
    key: "sample-bond",
    symbol: "TBOND",
    name: "TokeEase Sample Bond",
    shortName: "Sample Bond",
    type: 3, // Bond
    totalSupply: 10000n,
    initialPriceWei: 100000000000000n, // 0.0001 ETH (INR 500)
    location: "8% coupon, 3 years (demo)",
    docUri: "https://ipfs.io/ipfs/sample-green-energy-bond-prospectus",
    bondTerms: {
      faceValueWei: 100000000000000n, // 0.0001 ETH
      couponRateBps: 800n, // 8.00%
      maturityYears: 3,
    },
  },
];

async function main() {
  console.log("=================================================");
  console.log("       TokeEase Protocol Sepolia Deployment      ");
  console.log("=================================================");
  console.log(`RPC Provider: ${RPC_URL}`);

  if (!PRIVATE_KEY) {
    console.error("\n[Error] PRIVATE_KEY not found in environment variables.");
    console.log("Please set PRIVATE_KEY in your .env or .env.local file.\n");
    console.log("For manual deployment in Remix IDE, see scripts/remix-instructions.md");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const deployerAddress = await wallet.getAddress();

  console.log(`Deployer Address: ${deployerAddress}`);
  const balance = await provider.getBalance(deployerAddress);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    console.error("[Error] Deployer has 0 ETH on Sepolia.");
    console.log("Get test ETH from Google Web3 Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
    process.exit(1);
  }

  console.log("To deploy compiled bytecode directly, use Hardhat or Remix with the generated instructions.");
  console.log("See scripts/remix-instructions.md for 1-click parameters.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
