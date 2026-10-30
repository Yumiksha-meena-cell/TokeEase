# TokeEase — Tokenised Micro-Investing & Digital-Assets Wallet

> **Disclaimer:** Prototype on Sepolia testnet. No real money. No real property, gold or bonds. Not financial advice.

TokeEase is a Web3 fractional micro-investing platform built on the Ethereum Sepolia testnet. It allows everyday users to invest in tokenized real-world assets (Real Estate, Land Plots, Digital Gold, and Bonds) starting from ₹150–₹500 (0.00003–0.0001 ETH).

Ownership compliance is strictly enforced directly inside smart contracts via a shared on-chain KYC registry, income payouts (rent and bond coupons) are distributed automatically, and holders can trade tokens peer-to-peer 24x7.

---

## 🏛️ Complete Backend Architecture

In compliance with the **TokeEase PRD (Section 7, 8, 10 & 11)**, the platform follows an immutable on-chain state architecture with serverless backend helpers:

```
Browser (React + ethers v6)
   │
   ├── [On-Chain Read/Write] ──> MetaMask ──> Sepolia Testnet
   │                                              │
   │                                              ├── KycRegistry (Shared identity gate)
   │                                              └── AssetToken x4 (JFT, JPT, TGOLD, TBOND)
   │
   └── [Serverless Backend] ──> Next.js App Router API Routes
                                  ├── POST /api/explain-risk  (AI risk explainer via LLM)
                                  ├── GET  /api/contracts     (ABIs, addresses, network specs)
                                  ├── GET  /api/kyc           (On-chain verification & hash utility)
                                  └── GET  /api/stats         (Protocol analytics & TVL metrics)
```

---

## 📜 Smart Contracts (`contracts/`)

Built with **Solidity `^0.8.20`** and **OpenZeppelin `v5.0.2`**:

1. [**`contracts/KycRegistry.sol`**](file:///c:/Users/Lenovo/token/contracts/KycRegistry.sol):
   - Shared identity registry for all assets.
   - Zero personal data on-chain: computes and records `keccak256` identity hashes.
   - One approval authorizes the investor across Real Estate, Land Plots, Gold, and Bonds.
   - Key functions: `requestKyc(bytes32)`, `approveKyc(address)`, `rejectKyc(address)`, `isApproved(address)`, `getKycRequesters()`.

2. [**`contracts/AssetToken.sol`**](file:///c:/Users/Lenovo/token/contracts/AssetToken.sol):
   - Unified tokenisation engine (`ERC20`, `Ownable`, `ReentrancyGuard`, 0 decimals).
   - **`_update` Hook (Compliance):** Automatically rejects transfers or buys from unapproved wallets (`"Recipient is not KYC approved"`).
   - **Holder Registry & Primary Sale:** Tracks unsold supply (`primarySaleRemaining`) and holder balances.
   - **Dividend Payouts (`distributeIncome`):** Loops active holders to distribute ETH rental yield or bond coupons.
   - **Peer-to-Peer Marketplace (`createListing`, `buyListing`, `cancelListing`):** Escrows tokens on-chain for 24x7 P2P trading.
   - **Bond Terms & Settlement (`setBondTerms`, `settleMaturity`):** Configures 8% coupon and settles face value at maturity.

---

## 🌐 Serverless API Endpoints (`src/app/api/`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/explain-risk` | Plain-language AI risk analysis under 120 words per asset class with educational disclaimer. |
| `GET` | `/api/contracts` | Exports deployed contract addresses, ABIs, chain IDs, and demo exchange rate. |
| `GET / POST` | `/api/kyc` | Queries on-chain approval status and computes zero-knowledge `keccak256` identity proofs. |
| `GET` | `/api/stats` | Protocol analytics, active asset classes, min ticket sizes, and feature availability matrix. |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your optional LLM API key for live AI risk generation (falls back gracefully to offline risk profiles if omitted):
```env
LLM_API_KEY=your_key_here
LLM_MODEL=gpt-4o-mini
LLM_API_URL=https://api.openai.com/v1/chat/completions
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🛠️ Deploying Contracts to Sepolia

Refer to [`scripts/remix-instructions.md`](file:///c:/Users/Lenovo/token/scripts/remix-instructions.md) for 1-click Remix IDE instructions and pre-calculated constructor parameters for:
- `JFT` (Jaipur Flat, Real Estate, 10,000 supply, 0.0001 ETH)
- `JPT` (Jaipur Plot, Land Plot, 5,000 supply, 0.0001 ETH)
- `TGOLD` (Digital Gold, 20,000 supply, 0.00003 ETH = 0.01 g)
- `TBOND` (Sample Bond, 10,000 supply, 0.0001 ETH, 8% coupon)

After deploying, update `REGISTRY_ADDRESS` and `ASSETS` in [`src/lib/contract.ts`](file:///c:/Users/Lenovo/token/src/lib/contract.ts).
