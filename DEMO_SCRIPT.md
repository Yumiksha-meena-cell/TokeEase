# TokeEase: 4-Minute Live Hackathon Demo Script & Judge Q&A

> Reference: **TokeEase PRD Section 13 & 14**  
> Total Demo Time: **4 minutes**  
> Core Pitch: *"Own a piece of real estate, land, gold or a bond from INR 500. Rules enforced by code, income paid automatically."*

---

## 🎭 4 Demo Personas / Accounts

Prepare 4 test accounts in MetaMask:
1. **Admin** (Deployer wallet with test ETH)
2. **Investor A** (Verified user)
3. **Investor B** (Verified user)
4. **Outsider C** (Never approved — used for the live star rejection moment)

---

## ⏱️ Timeline & Actions (4 Minutes)

| Time | Step | Action & UI View | What to Say |
|---|---|---|---|
| **0:00 - 0:25** | **Hook** | Open Homepage ([`http://localhost:3000`](http://localhost:3000)), scroll through Asset Marketplace showing all 4 assets (Flat, Plot, Gold, Bond). | *"A student with ₹5,000 can't invest in real estate, land plots, gold or corporate bonds in India today. TokeEase splits them into fractional digital tokens on Sepolia testnet, letting anyone start investing from ₹150 to ₹500."* |
| **0:25 - 0:40** | **KYC Submission** | Click **"Verify Identity"**, enter sample name and demo ID, click **"Submit On-Chain KYC Request"**. Status turns to `Pending`. | *"Before investing, the user completes a demo KYC. We do not store any personal data on-chain; only a cryptographic keccak256 hash is recorded."* |
| **0:40 - 0:55** | **Admin Approval** | Open [**`/admin`**](http://localhost:3000/admin), locate the pending requester, click **"Approve"**. Status becomes `Approved`. | *"Switching to the Admin dashboard, we verify the user with one click. Our big differentiator: one shared KYC registry approves the wallet across all 4 asset classes — no repeated KYC."* |
| **0:55 - 1:15** | **Primary Purchase** | Return to catalog, open **Jaipur Flat (JFT)**, select ₹5,000 (10 tokens), click **"Buy"**. Portfolio balance updates immediately. | *"The investor buys 10 tokens of Jaipur Flat with test ETH. Tokens are transferred from the contract's primary sale pool, and their cost basis is tracked on-chain."* |
| **1:15 - 1:40** | ⭐ **Star Moment: Contract Rejection** | Switch wallet to **Outsider C** (unapproved), attempt to buy **Digital Gold (TGOLD)**. Modal shows compliance warning; contract reverts: *"Recipient is not KYC approved"*. | *"This is our star moment: an unverified wallet tries to buy tokens. The transaction is rejected directly by the smart contract's `_update` hook. Nobody — not even the platform — can bypass this rule."* |
| **1:40 - 2:10** | **Appreciation & Price Chart** | Switch back to Investor A. Open **Digital Gold**, buy 20 tokens. Go to Admin, click **"+8% Demo Bump"** on Gold. Check `/assets/tgold`. | *"Admin simulates a gold rate increase of +8%. The Recharts trend line appends a new point, and the investor immediately sees an unrealized profit in their portfolio."* |
| **2:10 - 2:40** | **Income Distribution (Rent / Coupon)** | Investor buys 10 tokens of **Sample Bond (TBOND)**. In `/admin`, admin clicks **"Pay Coupon to Bondholders"** with 0.001 ETH. | *"Income is shared automatically. With one button, the contract loops all holders and sends ETH directly to their wallets proportional to ownership — rent for properties, coupons for bonds."* |
| **2:40 - 3:10** | **Peer-to-Peer Marketplace** | In `/assets/jft`, Investor A lists 2 tokens for 0.00012 ETH each. Investor B connects and clicks **"Buy Listing"**. | *"Holders aren't locked in. They can list tokens on our peer-to-peer marketplace anytime. Tokens stay safely in escrow until an approved buyer purchases them."* |
| **3:10 - 3:35** | **AI Risk Explainer** | Click **"Explain Risk (AI)"** on the Bond or Gold card. Modal displays risk vectors and under-120-word explanation. | *"Beginners need plain-English risk education. Our AI assistant analyzes specific risks like credit default and interest rate volatility without giving financial advice."* |
| **3:35 - 4:00** | **Closing & Portfolio Table** | Scroll down to the **Combined Holdings Table (F19)** showing holdings, ownership %, and net P/L across all 4 assets. | *"Here is the investor's unified portfolio across real estate, land, gold, and bonds. This prototype proves how transparent, programmable micro-investing works on testnet."* |

---

## 🎯 Top Judge Q&A (Answers to Memorize)

### 1. *"INDmoney and Groww already do fractional investing. Why blockchain?"*
> *"Existing apps keep ownership in a private company database. With TokeEase, ownership is a public, verifiable record on-chain, compliance rules are enforced in code so no unverified wallet can receive tokens, rent and coupons pay out automatically, and holders can trade peer-to-peer 24x7."*

### 2. *"Who backs the gold and bonds?"*
> *"Nobody in this prototype — they are simulated educational assets on the Sepolia testnet. In production, digital gold requires a licensed vault custodian with third-party physical audits, and bonds require a registered corporate debt issuer with credit ratings."*

### 3. *"Why use one contract (`AssetToken.sol`) for four different assets?"*
> *"The core mechanics — fractional tokenisation, KYC transfer enforcement, P2P trading, and dividend payouts — are identical across asset classes. Using one thoroughly tested contract reduces bugs, while asset-specific details (like bond coupon rates or gold grams) are passed during deployment."*

### 4. *"Does the income distribution loop scale to thousands of users?"*
> *"No, a looping payout is a deliberate simplification for a 24-hour hackathon demo. In production, we would use an pull-based claiming pattern (like Merkle trees or staking reward pools) where investors claim their own yield with constant gas."*

### 5. *"Is this legally compliant in India?"*
> *"This is strictly an educational testnet prototype. A commercial launch would require a SEBI-registered framework (such as SM REITs for real estate) and RBI-compliant custodian partnerships. No real money or real KYC documents are ever used."*
