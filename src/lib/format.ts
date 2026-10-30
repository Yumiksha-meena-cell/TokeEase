import { formatEther } from "ethers";

export const DEMO_INR_PER_ETH = 5_000_000;
// 1 ETH (10^18 Wei) = 5,000,000 INR => 1 INR = 200,000,000,000 Wei
const WEI_PER_INR = BigInt("200000000000");

/**
 * Converts an INR amount to equivalent Wei (BigInt)
 */
export function inrToWei(inrAmount: number | bigint): bigint {
  const inrBig = typeof inrAmount === "bigint" ? inrAmount : BigInt(Math.floor(inrAmount));
  return inrBig * WEI_PER_INR;
}

/**
 * Converts Wei (BigInt) to equivalent INR number
 */
export function weiToInr(weiAmount: bigint): number {
  if (weiAmount <= BigInt(0)) return 0;
  return Number(weiAmount / WEI_PER_INR);
}

/**
 * Calculates whole tokens that can be purchased for a given INR amount.
 * Rounds tokens down. Returns tokens, leftover INR, and exact cost in Wei.
 */
export function inrToTokens(
  inrAmount: number,
  pricePerTokenWei: bigint
): { tokens: bigint; leftoverInr: number; totalCostWei: bigint } {
  if (inrAmount <= 0 || pricePerTokenWei <= BigInt(0)) {
    return { tokens: BigInt(0), leftoverInr: inrAmount, totalCostWei: BigInt(0) };
  }

  const budgetWei = inrToWei(inrAmount);
  const tokens = budgetWei / pricePerTokenWei; // rounds down automatically
  const totalCostWei = tokens * pricePerTokenWei;
  const totalCostInr = weiToInr(totalCostWei);
  const leftoverInr = Math.max(0, inrAmount - totalCostInr);

  return {
    tokens,
    leftoverInr,
    totalCostWei,
  };
}

/**
 * Formats a number or bigint as Indian Rupee currency (e.g., ₹5,000 or ₹1,50,000)
 */
export function formatInr(amount: number | bigint): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formats Wei as human readable ETH
 */
export function formatEth(wei: bigint, decimals: number = 4): string {
  try {
    const ethStr = formatEther(wei);
    const parsed = parseFloat(ethStr);
    return parsed.toFixed(decimals) + " ETH";
  } catch {
    return "0 ETH";
  }
}

/**
 * Shortens an Ethereum address (e.g. 0x71C8...49b2)
 */
export function shortAddress(address: string): string {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
