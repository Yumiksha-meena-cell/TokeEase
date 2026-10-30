/**
 * Converts contract reverts and wallet errors into friendly, plain-English messages (PRD 9.2)
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  let message = "";
  if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    const reason = typeof errObj.reason === "string" ? errObj.reason : "";
    const msg = typeof errObj.message === "string" ? errObj.message : "";
    const short = typeof errObj.shortMessage === "string" ? errObj.shortMessage : "";
    const dataMsg =
      typeof errObj.data === "object" && errObj.data !== null && "message" in errObj.data
        ? String((errObj.data as Record<string, unknown>).message)
        : "";
    message = `${reason} ${msg} ${short} ${dataMsg}`.toLowerCase();
  } else {
    message = String(error).toLowerCase();
  }

  if (message.includes("not kyc approved") || message.includes("kyc")) {
    return "This wallet is not KYC verified yet.";
  }

  if (
    message.includes("user rejected") ||
    message.includes("action_rejected") ||
    message.includes("user denied") ||
    message.includes("4001")
  ) {
    return "You cancelled the transaction.";
  }

  if (
    message.includes("insufficient funds") ||
    message.includes("exceeds balance") ||
    message.includes("not enough eth")
  ) {
    return "Not enough test ETH in this wallet.";
  }

  if (message.includes("sold out") || message.includes("insufficient supply")) {
    return "No primary tokens remaining for this asset.";
  }

  if (message.includes("network") || message.includes("chain")) {
    return "Please switch your wallet network to Sepolia testnet.";
  }

  return "Something went wrong. Please check your transaction and try again.";
}
