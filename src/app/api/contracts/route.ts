import { NextResponse } from "next/server";
import {
  REGISTRY_ADDRESS,
  REGISTRY_ABI,
  ASSET_ABI,
  ASSETS,
  SEPOLIA_RPC_URL,
  isZeroAddress,
} from "../../../lib/contract";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      network: {
        name: "Sepolia Testnet",
        chainId: 11155111,
        hexChainId: "0xaa36a7",
        rpcUrl: SEPOLIA_RPC_URL,
      },
      contracts: {
        registry: {
          name: "KycRegistry",
          address: REGISTRY_ADDRESS,
          isDeployed: !isZeroAddress(REGISTRY_ADDRESS),
          abi: REGISTRY_ABI,
        },
        assets: ASSETS.map((asset) => ({
          key: asset.key,
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          address: asset.address,
          isDeployed: !isZeroAddress(asset.address),
          initialPriceEth: asset.initialPriceEth,
        })),
        assetAbi: ASSET_ABI,
      },
      demoExchangeRate: {
        rate: "0.0001 ETH = 500 INR",
        inrPerEth: 5000000,
        notice: "Demo conversion, not a real exchange rate.",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch contract configuration" },
      { status: 500 }
    );
  }
}
