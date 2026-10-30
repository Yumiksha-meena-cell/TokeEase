import { NextResponse } from "next/server";
import { Contract, keccak256, toUtf8Bytes } from "ethers";
import {
  REGISTRY_ADDRESS,
  REGISTRY_ABI,
  isZeroAddress,
  getReadOnlyProvider,
} from "../../../lib/contract";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { error: "Query parameter 'wallet' is required" },
        { status: 400 }
      );
    }

    if (isZeroAddress(REGISTRY_ADDRESS)) {
      return NextResponse.json({
        wallet,
        isDeployed: false,
        status: "None",
        isApproved: false,
        notice: "Registry is in local sandbox/placeholder mode.",
      });
    }

    const provider = getReadOnlyProvider();
    const registry = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);

    const [isApproved, statusCode, dataHash] = await Promise.all([
      registry.isApproved(wallet),
      registry.kycStatus(wallet),
      registry.kycHash(wallet),
    ]);

    const statusMap = ["None", "Pending", "Approved", "Rejected"];
    const statusText = statusMap[Number(statusCode)] || "None";

    return NextResponse.json({
      wallet,
      isDeployed: true,
      status: statusText,
      statusCode: Number(statusCode),
      isApproved: Boolean(isApproved),
      dataHash,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to query KYC status on Sepolia" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, idNumber, wallet } = body;

    if (!name || !idNumber || !wallet) {
      return NextResponse.json(
        { error: "name, idNumber, and wallet are required" },
        { status: 400 }
      );
    }

    // Compute keccak256 data hash (F3 compliance)
    const rawPayload = `${name.trim()}:${idNumber.trim()}:${wallet.trim().toLowerCase()}`;
    const hash = keccak256(toUtf8Bytes(rawPayload));

    return NextResponse.json({
      success: true,
      dataHash: hash,
      wallet: wallet.toLowerCase(),
      notice: "Zero personal data stored on-chain. Only cryptographic proof hash is submitted.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to hash KYC data" },
      { status: 500 }
    );
  }
}
