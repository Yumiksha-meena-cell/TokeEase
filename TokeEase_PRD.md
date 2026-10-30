# TokeEase: Tokenised Micro-Investing Platform (Product Requirements Document)

> **How to use this file:** Paste this whole document into your AI coding assistant (Claude, ChatGPT, Cursor, etc.) as the first message. Then follow Section 2 ("Instructions for the AI assistant") and build **one phase at a time** using Section 12.
> **Project name:** "TokeEase". Rename freely.
> **Scope:** four asset classes, all tokenised with the same engine: **Real Estate (flat), Land Plot, Gold, Bonds**.

---

## 1. Overview

### 1.1 One-line pitch
A testnet prototype where an ordinary person can buy a tiny fraction (token) of a real-estate flat, a land plot, digital gold or a bond for about INR 500 or less. Only KYC-approved wallets can hold tokens, the rules are enforced by smart contracts, tokens can be traded peer to peer, and income (rent or bond coupon) is shared automatically among token holders.

### 1.2 Problem
High minimum ticket sizes keep ordinary people out of assets such as real estate, land, bonds and gold. (Source: hackathon problem statement 3.5, "Tokenised Micro-Investing and Digital Assets Wallet".)

### 1.3 Solution
Split four sample assets into small tokens. Each token is one small ownership share (or one small unit of the bond or gold):

| Asset | Type | Token meaning |
|---|---|---|
| Jaipur Flat | Real Estate | 1 token = 1/10,000 of the flat. Earns rent |
| Jaipur Plot | Land Plot | 1 token = 1/5,000 of the plot. Value grows with price updates |
| Digital Gold | Gold | 1 token = 0.01 gram of gold. Value follows the gold price |
| Sample Bond | Bond | 1 token = INR 500 face value. Pays coupon (interest) to holders |

Everything runs on the **Sepolia testnet** with fake money. No real money, no real KYC, no real property, no real gold, no real bond.

### 1.4 Why this is not just another investing app
Existing apps (INDmoney, Groww, Strata, etc.) already offer fractional investing, but they keep ownership records in a company database. Our differentiators:

1. **Rules enforced in code:** a wallet that is not KYC-approved cannot receive tokens. The transaction is rejected by the contract itself.
2. **Public ownership record:** anyone can verify who owns how much on a block explorer.
3. **Automatic income payout:** one button pays every holder their share instantly (rent for property, coupon for bonds).
4. **24x7 peer-to-peer trading:** holders list tokens at their own price; other approved users can buy them.
5. **One KYC, many assets:** one shared KYC registry, so a verified wallet can invest in real estate, land, gold and bonds without repeating KYC.

### 1.5 Hackathon context
- 24-hour build, team of up to 4 people, built mostly with AI-assisted ("vibe") coding.
- Judging criteria: originality, understanding of the problem, viability. A **live demo** matters more than slides.
- Team has only surface-level blockchain knowledge. Every design decision below favours **simplicity and reliability over completeness**.
- To keep it simple, **all four assets use the same contract code** (`AssetToken.sol`), deployed four times with different settings. Only a few small extras differ by asset type.

---

## 2. Instructions for the AI assistant (READ FIRST)

You are helping a beginner team build this project in 24 hours. Follow these rules strictly:

1. **Work in phases.** Build only the phase the user asks for (Section 12). Do not jump ahead. After each phase, tell the user exactly how to run and test it, then wait.
2. **Give complete files**, not fragments, unless the user asks for a small edit. Always state the file path.
3. **Use simple English** in explanations. Assume the user does not know blockchain terms. Explain each smart-contract function in one plain sentence.
4. **Pinned versions (do not use older APIs):**
   - Solidity `^0.8.20`
   - OpenZeppelin Contracts **v5.0.2** (in v5, `Ownable` needs `constructor(address initialOwner)` and token transfers are customised by overriding `_update`, NOT `_beforeTokenTransfer`)
   - ethers **v6** (use `BrowserProvider`, `parseEther`, `formatEther`; NOT `Web3Provider` or `ethers.utils`)
   - React 18 + Vite, Tailwind CSS
5. **Do not add features outside Section 5 or anything in the Cut List (Section 6).**
6. **Never hardcode secrets.** The LLM API key lives only in a server-side environment variable.
7. **When the user pastes an error,** identify the cause in one or two sentences first, then give the fixed code.
8. **Keep the contracts small and readable.** Comment every function. Prefer clear code over clever code.
9. After the contracts are deployed, **do not change function signatures or event names** without warning the user, because the frontend ABI depends on them. (There are two ABIs: `KycRegistry` and `AssetToken`.)
10. If something in this PRD is ambiguous, pick the simplest option and say which one you picked.
11. **One contract code, many assets.** Do not write a separate contract per asset type. Asset-type differences go in the constructor arguments, a few optional fields, and frontend display config (`assetMeta.js`).

---

## 3. Goals and non-goals

### 3.1 Goals
- A working, publicly accessible web app connected to contracts deployed on Sepolia.
- Four tokenised assets (flat, plot, gold, bond) browsable and investable from one app.
- A reliable 4-minute live demo with a clear "wow" moment (unapproved wallet gets rejected).
- A clean, modern, fintech-style UI.
- Honest framing: a prototype, testnet only, not financial advice.

### 3.2 Non-goals
Real KYC or Aadhaar, real money, real property, real gold custody or vaulting, real bond issuance or credit rating, legal compliance, mainnet deployment, mobile app, order book, automatic pricing, price oracles or live gold rates.

### 3.3 Success criteria (Definition of Done)
- [ ] KYC registry and four asset contracts deployed on Sepolia and verified working through the UI.
- [ ] An unapproved wallet's buy and transfer both fail with a readable message, on every asset.
- [ ] One KYC approval lets a wallet buy all four assets.
- [ ] An approved wallet can buy tokens of any asset and see them in its portfolio.
- [ ] Admin can update the price of an asset, and users see profit/loss change.
- [ ] Admin can distribute rent (flat) and coupon (bond) and holders' wallet balances increase.
- [ ] Marketplace listing works between two approved wallets.
- [ ] AI risk explainer returns asset-specific text (or falls back to static text).
- [ ] App is live on a public URL.
- [ ] A screen recording of the full demo exists as a backup.
- [ ] Demo has been rehearsed at least 3 times without breaking.

---

## 4. Users and roles

| Role | Who | What they can do |
|---|---|---|
| **Visitor** | Anyone with a wallet | See asset details, prices, charts, risk explainer. Submit KYC request |
| **Verified Investor** | Wallet with KYC status `Approved` in the registry | Buy tokens of any asset, transfer/trade tokens, list tokens for sale, buy listings, view portfolio |
| **Admin** | Contract owner (deployer wallet) | Approve/reject KYC, update prices, deposit rent or coupon, withdraw ETH |
| **Unverified wallet** | Wallet that is `None`, `Pending`, `Rejected` or revoked | Can only look. Any buy or token receive reverts |

**Demo wallets (create 4 separate MetaMask accounts, demo only, never use a real wallet):**
- **Admin** (deployer)
- **Investor A** (will be approved)
- **Investor B** (will be approved)
- **Outsider C** (never approved, used for the rejection moment)

---

## 5. Features and requirements

Priority key: **M** = must-have, **S** = should-have, **N** = nice-to-have.

### 5.1 Feature list

| ID | Feature | Priority | Description |
|---|---|---|---|
| F1 | Asset token | M | ERC-20 token, 0 decimals, fixed supply set at deploy. One contract per asset, same code for all four |
| F2 | Wallet connect | M | Connect MetaMask, show address, show wrong-network warning with "Switch to Sepolia" button |
| F3 | Fake KYC request | M | User fills a form (name, fake ID, wallet auto-filled). Submitting sends an on-chain `requestKyc` to the shared registry so status becomes `Pending` |
| F4 | Admin KYC approval | M | Admin panel lists pending wallets with Approve and Reject buttons. One approval works for all assets |
| F5 | Buy tokens (primary sale) | M | Approved user picks an asset and a quantity and pays ETH at the current price. Tokens come from that asset contract's unsold pool |
| F6 | Compliance rejection | M | Unapproved wallets cannot buy or receive tokens of any asset. UI shows a friendly error |
| F7 | Portfolio | M | For the selected asset: token balance, ownership percentage, current value, total spent, profit/loss |
| F8 | Admin price update | M | Admin sets a new price per token for the selected asset (simulates a valuer, gold rate or bond market price). Price history stored on-chain |
| F9 | Price chart | S | Line chart from on-chain price history (seed with a few sample points if needed) |
| F10 | Income distribution | S | Admin sends ETH, contract splits it among holders proportional to balance. Shown as **Rent** for the flat and **Coupon** for the bond |
| F11 | Marketplace listings | S | Approved holder lists N tokens of an asset at own price. Another approved user buys the listing. Seller can cancel |
| F12 | AI risk explainer | N | Button calls a serverless endpoint that asks an LLM for a plain-language risk summary specific to the asset type. Static fallback if it fails |
| F13 | Asset info and documents | N | Asset name, description, location or unit text, and a document link shown on the asset card |
| F14 | Activity feed | N | Last few actions (only if cheap to build, otherwise skip) |
| F15 | Asset catalogue and selector | M | Home screen shows 4 asset cards (flat, plot, gold, bond). Selecting one opens its detail, buy panel, chart and marketplace |
| F16 | Gold tokens | M | Gold asset with 1 token = 0.01 gram. UI shows holdings in grams. Price updated by admin to simulate the gold rate |
| F17 | Bond tokens | M | Bond asset with face value, coupon rate and maturity date. UI shows coupon per token, current yield and time to maturity. Coupon paid through F10 |
| F18 | Bond maturity redemption | N | At maturity admin repays face value to every holder and the tokens are burned. Skip unless everything else is done |
| F19 | Combined portfolio | S | One table showing the connected wallet's holdings across all four assets with a total value |
| F20 | Asset-type risk text | S | Risk explainer and fallback text differ per asset type (see F12) |

### 5.2 Detailed requirements

**F1 Asset token (same code, four deployments)**
- Contract `AssetToken` is deployed once per asset (see Section 8.7 for the four sets of constructor values).
- **decimals = 0** (so 1 token = 1 whole unit, easy to display).
- Total supply is set in the constructor (`TOTAL_SUPPLY`, immutable), minted once to the contract address.
- A separate variable `primarySaleRemaining` (starts at `TOTAL_SUPPLY`) tracks how many tokens are still available in the primary sale. This keeps primary-sale tokens separate from tokens held in marketplace escrow.
- An enum `AssetType { RealEstate, Plot, Gold, Bond }` is stored so the frontend knows how to display the asset.

**F3/F4 KYC (one shared registry, on-chain status only)**
- KYC lives in its own small contract, `KycRegistry`, deployed **first**. All four asset contracts read from it. Approve a wallet once and it can invest in every asset.
- Enum `KycStatus { None, Pending, Approved, Rejected }` and `mapping(address => KycStatus) public kycStatus`.
- `requestKyc(bytes32 detailsHash)`: callable by anyone whose status is `None` or `Rejected`. Sets `Pending`, stores the hash, pushes address to a `kycRequesters` array, emits event.
- `approveKyc(address)` and `rejectKyc(address)`: owner only.
- `revokeKyc(address)`: owner only, sets back to `Rejected` (stretch).
- `isApproved(address) view returns (bool)`: used by every asset contract.
- **No personal data on-chain.** The form's name and fake ID are only hashed in the browser (`keccak256`) and the hash is sent. Real KYC is out of scope. Show a banner "Demo KYC, no real data is stored."

**F5 Buy tokens**
- `buy(uint256 amount) payable` on the selected asset contract.
- Requires: caller approved in the registry, `amount > 0`, `amount <= primarySaleRemaining`, `msg.value == amount * pricePerTokenWei`.
- Effects: decrease `primarySaleRemaining`, transfer tokens from contract to buyer, add `msg.value` to `totalSpentWei[buyer]`, emit `TokensPurchased`.
- Use `nonReentrant`.

**F6 Compliance rule (the star feature)**
- Override `_update(address from, address to, uint256 value)`.
- Rule: for any transfer that is not a mint (`from != address(0)`), the recipient must be approved in the registry **or** be the contract itself (needed for marketplace escrow) **or** be `address(0)` (burn, needed for F18).
- Revert reason: `"Recipient is not KYC approved"`.
- Also have `buy` itself revert with `"Not KYC approved"` for a clearer first message.
- Track first-time holders in `holders` array (see F10).

**F7 Portfolio (frontend math)**
- `ownership % = balance / TOTAL_SUPPLY * 100`
- `current value = balance * pricePerTokenWei`
- `profit/loss = current value - totalSpentWei[user]`
- Display INR using a fixed demo rate (see Section 8.5). Add the note: "P/L is accurate as long as the user has not sold tokens (demo simplification)."
- Gold only: also show grams held = `balance * 0.01`.

**F8 Price**
- `uint256 public pricePerTokenWei`, set per asset in the constructor (see Section 8.7).
- `updatePrice(uint256 newPrice)`: owner only, `newPrice > 0`, pushes `(timestamp, price)` to `priceHistory`, emits `PriceUpdated`.
- `getPriceHistory()` returns arrays for the chart.
- Meaning by asset: valuer's estimate (flat, plot), simulated gold rate (gold), simulated market price (bond).

**F10 Income distribution (rent and coupon)**
- `distributeIncome() payable`: owner only, `msg.value > 0`.
- For each address in `holders`: `share = msg.value * balanceOf(holder) / TOTAL_SUPPLY`; send ETH with `call`. If a send fails, skip it and emit `IncomeSendFailed(holder, share)`. Do not revert the whole call.
- Portion for unsold or escrowed tokens simply stays in the contract (owner can withdraw).
- Emit `IncomeDistributed(totalAmount, holderCount)`.
- The frontend shows this control only for the **flat** (label "Distribute rent") and the **bond** (label "Pay coupon"). It is hidden for plot and gold, which do not pay income.
- Known limitation: a loop does not scale to thousands of holders. In the pitch say "production would use a pull-based claim pattern."
- Exclude `address(this)` from `holders`.

**F11 Marketplace (simple listings, no order book)**
- Each asset contract has its own listings, so the marketplace tab shows listings for the selected asset.
- `struct Listing { address seller; uint256 amount; uint256 pricePerTokenWei; bool active; }`, `Listing[] public listings`.
- `createListing(uint256 amount, uint256 priceWei)`: caller approved, has enough balance. Moves tokens from seller to the contract using an internal transfer (escrow, no approval step needed). Emits `ListingCreated`.
- `buyListing(uint256 id) payable`: buyer approved, listing active, `msg.value == amount * priceWei`. Marks inactive first, moves tokens from contract to buyer, pays the seller, updates `totalSpentWei[buyer]`. Use `nonReentrant`. Emits `ListingSold`.
- `cancelListing(uint256 id)`: only the seller, returns escrowed tokens. Emits `ListingCancelled`.
- Whole-listing purchase only (no partial fills).

**F12 AI risk explainer**
- Endpoint `POST /api/explain-risk` with body `{ assetName, assetType }` where `assetType` is one of `Real Estate`, `Land Plot`, `Gold`, `Bond`.
- Server calls an LLM with a prompt asking for a beginner-friendly explanation in under 120 words covering the risks that matter for that asset type (see F20), ending with: "This is educational, not financial advice."
- Frontend shows a loading state, then text. On any failure, show the static text for that asset type from `src/lib/riskFallback.js`.

**F13 Asset info**
- Fields on each asset contract: `assetName`, `assetLocation` (for gold this holds the unit text, e.g. "1 token = 0.01 gram"), `documentURI`. Set once after deploy with `setAssetInfo(...)`.

**F15 Asset catalogue and selector**
- Home screen: grid of 4 cards, each showing name, type badge, price per token (ETH and INR), tokens remaining (progress bar), and one highlight (flat: "Earns rent", plot: "Land appreciation", gold: "Gold-backed unit", bond: "8% coupon").
- A selected-asset state (for example React context) drives the Asset card, Buy panel, Portfolio, Marketplace and Admin panel, so each component receives the selected asset's contract.
- Asset list comes from `ASSETS` in `src/contract.js` (name, type, address). No database.

**F16 Gold tokens**
- Same contract. `assetType = Gold`, 1 token = 0.01 gram (stated in `assetLocation` and `assetMeta.js`).
- UI shows "You hold X grams (demo)" next to the token balance.
- Price is changed by admin only. Label it "Simulated gold rate, not a live price."
- Disclaimer on the gold card: "Prototype only. No physical gold is stored."

**F17 Bond tokens**
- Same contract plus a one-time `setBondTerms(uint256 faceValueWei, uint256 couponRateBps, uint256 maturityTimestamp)`, owner only, callable once. Public getters: `faceValueWei`, `couponRateBps`, `maturityTimestamp`.
- Demo values: face value 0.0001 ETH (INR 500), coupon 800 bps (8% per year), maturity about 3 years from deploy (display only).
- Frontend math: `annual coupon per token = faceValueWei * couponRateBps / 10000`, `current yield = annual coupon / pricePerTokenWei`, maturity countdown from `maturityTimestamp`.
- Coupon is paid through `distributeIncome()` (F10). The demo uses a fixed test amount (for example 0.001 ETH), not a real schedule.
- Disclaimer on the bond card: "Sample bond for demo. Not a real issuer, rating or security."

**F18 Bond maturity redemption (nice-to-have)**
- `settleMaturity() payable`: owner only, bond type only, `block.timestamp >= maturityTimestamp`. Pays each holder `balanceOf(holder) * faceValueWei` and burns their tokens (the `_update` rule allows burns). Skip failed sends like F10.
- Only build this if all must-haves and should-haves are done. Demo tip: set a short maturity only on a spare test deployment.

**F19 Combined portfolio**
- A table with one row per asset: balance, current value, profit/loss. Footer: total current value across assets (in ETH and INR).
- Reads each asset contract with the read-only provider. No new contract code.

**F20 Asset-type risk text**
- Real Estate: liquidity, valuation, regulatory, concentration risk.
- Land Plot: liquidity, valuation, title and legal dispute, regulatory risk.
- Gold: price volatility, custody and storage, redemption, regulatory risk.
- Bond: credit or default risk, interest-rate risk, liquidity, regulatory risk.

---

## 6. Cut list (do NOT build)

Order book or auto-matching, dynamic or oracle pricing, live gold rates, real KYC or Aadhaar, ERC-1155 or a single multi-asset contract, a factory contract, mobile app, user accounts or passwords, off-chain database, email or push notifications, real INR payments, physical gold redemption, bond credit ratings or yield curves, mainnet.

---
## 7. Tech stack (final, do not change)

| Layer | Choice | Why |
|---|---|---|
| Smart contracts | Solidity ^0.8.20, OpenZeppelin v5.0.2 (`ERC20`, `Ownable`, `ReentrancyGuard`). Two contracts: `KycRegistry` and `AssetToken` (deployed 4 times) | Audited building blocks, small code |
| Contract IDE and deploy | **Remix IDE** (remix.ethereum.org) | No local setup, fastest for beginners. Hardhat is optional and not needed |
| Network | **Sepolia testnet** (chain ID `11155111`) | Free test ETH. Backup: Remix VM (local) for emergencies |
| Wallet | MetaMask (browser extension) | Standard |
| Frontend | React 18 + Vite + Tailwind CSS | Fast, AI generates it well |
| Blockchain library | ethers v6 | Required version |
| Charts | recharts | Simple line chart |
| Notifications | react-hot-toast (or similar) | Tx success and error toasts |
| AI endpoint | Serverless function in `/api/explain-risk.js` (Vercel) | Keeps API key off the browser |
| LLM | Any chat-completion API (Claude, OpenAI or Gemini). Model name from env var | Team's choice |
| Hosting | **Vercel** (frontend + `/api`) | Free, gives a public link |
| Version control | Git + GitHub | Commit after every working step |

**There is no database.** All state is on-chain.

### 7.1 Folder structure

```
tokeease/
├── contracts/
│   ├── KycRegistry.sol            (deploy first, shared by all assets)
│   └── AssetToken.sol             (deploy 4 times: flat, plot, gold, bond)
├── api/
│   └── explain-risk.js            (Vercel serverless function)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── contract.js                (REGISTRY_ADDRESS, ASSETS list with addresses, both ABIs; updated after deploy)
│   ├── context/
│   │   └── AssetContext.jsx       (selected asset state)
│   ├── lib/
│   │   ├── format.js              (wei/ETH/INR helpers)
│   │   ├── errors.js              (turns revert errors into friendly text)
│   │   ├── assetMeta.js           (per type: label, icon, income label, unit text, disclaimer)
│   │   └── riskFallback.js        (static risk text per asset type)
│   ├── hooks/
│   │   └── useWallet.js           (connect, network check, signer)
│   └── components/
│       ├── Header.jsx             (logo, connect button, network badge, role badge)
│       ├── AssetCatalog.jsx       (grid of 4 asset cards, home screen)
│       ├── AssetCard.jsx          (name, price, supply left, chart, doc link, bond or gold extras)
│       ├── BuyPanel.jsx
│       ├── Portfolio.jsx          (selected asset + combined table)
│       ├── KycPanel.jsx
│       ├── Marketplace.jsx
│       ├── AdminPanel.jsx
│       └── RiskModal.jsx
├── .env.example
├── .gitignore                     (must include .env)
├── package.json
└── README.md
```

### 7.2 Environment variables
```
# Server-side only (Vercel dashboard), NEVER prefix with VITE_
LLM_API_KEY=
LLM_MODEL=
LLM_API_URL=
```
Contract addresses and ABIs live in `src/contract.js` (public information, not secret).

---

## 8. Smart contract specification

### 8.1 Contract names and inheritance
- `contract KycRegistry is Ownable`
- `contract AssetToken is ERC20, Ownable, ReentrancyGuard`

### 8.2 `KycRegistry`

| Item | Type | Purpose |
|---|---|---|
| `KycStatus` | `enum { None, Pending, Approved, Rejected }` | KYC state |
| `kycStatus` | `mapping(address => KycStatus) public` | State per wallet |
| `kycHash` | `mapping(address => bytes32)` | Hash of fake KYC details |
| `kycRequesters` | `address[]` | List for admin panel |

| Function | Who | Summary |
|---|---|---|
| `constructor(address initialOwner)` | deployer | Sets the admin |
| `requestKyc(bytes32)` | anyone | Sets status to Pending |
| `approveKyc(address)` | owner | Sets Approved |
| `rejectKyc(address)` | owner | Sets Rejected |
| `revokeKyc(address)` | owner | Sets back to Rejected (stretch) |
| `isApproved(address)` | view | True if status is Approved |
| `getKycRequesters()` | view | Returns array for admin UI |

Events: `KycRequested(address indexed user)`, `KycApproved(address indexed user)`, `KycRejected(address indexed user)`.

### 8.3 `AssetToken` state variables

| Variable | Type | Purpose |
|---|---|---|
| `AssetType` | `enum { RealEstate, Plot, Gold, Bond }` | Tells the frontend how to display the asset |
| `assetType` | `AssetType public immutable` | This contract's type |
| `registry` | `KycRegistry public immutable` | Shared KYC source |
| `TOTAL_SUPPLY` | `uint256 public immutable` | Fixed number of tokens, set at deploy |
| `pricePerTokenWei` | `uint256 public` | Current price per token |
| `primarySaleRemaining` | `uint256 public` | Unsold tokens in primary sale |
| `holders` | `address[]` | Everyone who has ever held tokens (for income loop) |
| `isHolder` | `mapping(address => bool)` | Prevents duplicates in `holders` |
| `totalSpentWei` | `mapping(address => uint256)` | Cost basis for P/L |
| `priceHistory` | `struct PricePoint {uint256 time; uint256 price;}[]` | Chart data |
| `listings` | `Listing[]` | Marketplace |
| `assetName`, `assetLocation`, `documentURI` | `string public` | Asset info (F13). For gold, `assetLocation` holds the unit text |
| `faceValueWei`, `couponRateBps`, `maturityTimestamp` | `uint256 public` | Bond terms (zero for other types) |
| `bondTermsSet` | `bool` | Makes `setBondTerms` one-time |

### 8.4 `AssetToken` functions

| Function | Who | Summary |
|---|---|---|
| `constructor(address initialOwner, address registryAddress, string name_, string symbol_, AssetType type_, uint256 totalSupply_, uint256 initialPriceWei)` | deployer | Mints all tokens to the contract, sets starting price, pushes first price point |
| `setAssetInfo(string name, string location, string docURI)` | owner | Sets asset info text (F13) |
| `setBondTerms(uint256, uint256, uint256)` | owner | One-time. Bond only. Sets face value, coupon rate, maturity |
| `buy(uint256)` payable | approved | Primary sale |
| `updatePrice(uint256)` | owner | New price + history entry |
| `getPriceHistory()` | view | Arrays of times and prices |
| `distributeIncome()` payable | owner | Pays holders proportional to balance (rent or coupon) |
| `settleMaturity()` payable | owner | Bond only, optional (F18). Repays face value and burns tokens |
| `createListing(uint256,uint256)` | approved | Escrows tokens, creates listing |
| `buyListing(uint256)` payable | approved | Buys a whole listing |
| `cancelListing(uint256)` | seller | Returns escrowed tokens |
| `listingsCount()` | view | Number of listings |
| `withdraw()` | owner | Sends contract ETH balance to owner |
| `decimals()` | view | Overridden to return `0` |
| `_update(...)` | internal | Compliance check (uses `registry.isApproved`) + holder tracking |

### 8.5 Events (frontend and demo rely on these names)
`TokensPurchased(address indexed buyer, uint256 amount, uint256 pricePerToken)`, `PriceUpdated(uint256 oldPrice, uint256 newPrice)`, `IncomeDistributed(uint256 total, uint256 holderCount)`, `IncomeSendFailed(address indexed holder, uint256 amount)`, `MaturitySettled(uint256 total, uint256 holderCount)`, `ListingCreated(uint256 indexed id, address indexed seller, uint256 amount, uint256 priceWei)`, `ListingSold(uint256 indexed id, address indexed buyer)`, `ListingCancelled(uint256 indexed id)`.

(KYC events are on `KycRegistry`, see 8.2.)

### 8.6 Demo constants
- INR display: fixed demo rate **0.0001 ETH = INR 500**, so `INR = ETH / 0.0001 * 500`. Label it "Demo conversion, not a real exchange rate."
- Price update for demo: **+8%** on the selected asset (for the flat: `100000000000000` to `108000000000000` wei).
- Income deposit for demo: `0.001 ETH` (rent for the flat, coupon for the bond).

### 8.7 The four demo assets (constructor values)

Deploy `KycRegistry` first, then deploy `AssetToken` four times using the registry address.

| # | `name_` | `symbol_` | `type_` | `totalSupply_` | `initialPriceWei` | After deploy |
|---|---|---|---|---|---|---|
| 1 | `TokeEase Jaipur Flat` | `JFT` | `RealEstate` (0) | `10000` | `100000000000000` (0.0001 ETH, INR 500) | `setAssetInfo("Jaipur Flat", "Jaipur, Rajasthan (sample)", docURI)` |
| 2 | `TokeEase Jaipur Plot` | `JPT` | `Plot` (1) | `5000` | `100000000000000` (0.0001 ETH, INR 500) | `setAssetInfo("Jaipur Plot", "Jaipur outskirts (sample)", docURI)` |
| 3 | `TokeEase Digital Gold` | `TGOLD` | `Gold` (2) | `20000` | `30000000000000` (0.00003 ETH, INR 150) | `setAssetInfo("Digital Gold", "1 token = 0.01 gram (demo)", docURI)` |
| 4 | `TokeEase Sample Bond` | `TBOND` | `Bond` (3) | `10000` | `100000000000000` (0.0001 ETH, INR 500 face) | `setAssetInfo("Sample Bond", "8% coupon, 3 years (demo)", docURI)` then `setBondTerms(100000000000000, 800, <unix time about 3 years ahead>)` |

All prices are illustrative demo numbers, not real market rates.

### 8.8 Security and quality checklist (keep it simple)
- Use `nonReentrant` on `buy`, `buyListing`, `distributeIncome`, `settleMaturity`, `withdraw`.
- Follow checks, then state changes, then external calls.
- Every `require` has a readable message.
- No personal data on-chain.
- Known limitations to state openly: income loop does not scale, owner is a single trusted admin, plain `transfer` to the contract address would strand tokens, P/L ignores sells, gold and bond prices are admin-set (no oracle), no real custody or issuer behind any asset.

---
## 9. Frontend specification

### 9.1 Layout
Single-page app, mobile responsive, clean fintech look (white or dark neutral background, one accent colour, rounded cards, clear typography). Use one accent colour overall and a small icon or badge per asset type (building, land, gold bar, bond certificate).

**Header:** logo and name, network badge (green "Sepolia" or red "Wrong network" with Switch button), wallet address (shortened) and Connect/Disconnect button, role badge (Admin, Verified, Pending, Not verified).

**Home:** `AssetCatalog` with 4 asset cards. Clicking a card sets the selected asset and opens its detail view. A small "Back to all assets" link returns to the grid.

**Detail view for the selected asset (tabs or stacked cards):**

1. **Asset card:** asset name, type badge, location or unit text, price per token in ETH and INR, tokens remaining (progress bar), price chart, "Explain risk" button, document link. Extras by type:
   - Gold: "1 token = 0.01 g" and the "simulated rate" note.
   - Bond: coupon rate, annual coupon per token, current yield, maturity date and countdown.
   - Every card: the type-specific disclaimer from `assetMeta.js`.
2. **Buy panel:** quantity input, live total cost (ETH and INR), Buy button, disabled with a clear message if not approved.
3. **Portfolio:** for the selected asset: balance (and grams for gold), ownership %, current value, total spent, profit/loss (green or red). Below it, the **combined table** across all four assets with a total (F19).
4. **KYC panel:** shows current status (from the registry). If `None` or `Rejected`, shows the form (full name, fake ID number, wallet address auto-filled). Banner: "Demo KYC, no real data is stored." Add the line "One approval works for all assets."
5. **Marketplace:** table of active listings for the selected asset (seller, amount, price per token, total) with Buy button, plus a "Create listing" form and "Cancel" for own listings.
6. **Admin panel (visible only if connected wallet equals `owner()`):** pending KYC list with Approve/Reject, price update input for the selected asset, income deposit input (shown only for flat and bond, labelled "Distribute rent" or "Pay coupon"), withdraw button.

### 9.2 Behaviour rules
- Read data with a read-only provider so the page works before connecting a wallet.
- Build contract instances from the selected asset's address in `ASSETS`. Never hardcode one address inside a component.
- Every write transaction: show "Waiting for MetaMask", then "Transaction sent", then "Confirmed" (toast), then refresh data.
- Convert errors to friendly text in `errors.js`. Examples:
  - contains "not KYC approved" → "This wallet is not KYC verified yet."
  - user rejected → "You cancelled the transaction."
  - insufficient funds → "Not enough test ETH in this wallet."
- Disable buttons while a transaction is pending.
- Poll or refresh data after each transaction (no real-time listeners needed).
- Empty states for no listings, no pending KYC, no holdings.
- Switching assets must reset quantity inputs and reload data for the new asset.

### 9.3 AI risk modal
Opens on "Explain risk". Sends the selected asset's name and type. Shows spinner, then text with the line "Educational, not financial advice." Has a Close button. Uses the fallback text for that asset type on error.

---

## 10. Backend specification (`api/explain-risk.js`)

- Vercel serverless function, `POST` only.
- Input: `{ assetName: string, assetType: string }` where `assetType` is `Real Estate`, `Land Plot`, `Gold` or `Bond`. Validate against this list and cap lengths.
- Reads `LLM_API_KEY`, `LLM_MODEL`, `LLM_API_URL` from `process.env`.
- Picks a risk list from the asset type:
  - Real Estate: liquidity, valuation, regulatory, concentration
  - Land Plot: liquidity, valuation, title and legal dispute, regulatory
  - Gold: price volatility, custody and storage, redemption, regulatory
  - Bond: credit or default, interest-rate, liquidity, regulatory
- Prompt: "You are a financial education assistant for beginners in India. Explain in plain English, under 120 words, the main risks of investing in a fractional token of [assetType] called [assetName]: [risk list for that type]. Do not give investment advice. End with: This is educational, not financial advice."
- Output: `{ text: string }`. On error return HTTP 500 with `{ error }`. Frontend handles fallback.
- Timeout of 10 seconds.

---

## 11. Data flow (for understanding)

```
Browser (React + ethers v6)
   |-- read/write -->  MetaMask  -->  Sepolia  -->  KycRegistry (shared)
   |                                          '-->  AssetToken x4 (flat, plot, gold, bond)
   |
   '-- POST /api/explain-risk  -->  Vercel function  -->  LLM API
```

KYC flow: user submits form → `registry.requestKyc(hash)` → status Pending → admin sees address → `registry.approveKyc` → user can buy **any** asset.
Buy flow: approved user picks an asset → `buy(n)` on that asset contract with ETH → contract checks the registry → tokens sent → portfolio updates.
Reject flow: unapproved user → `buy(n)` or receives tokens on any asset → contract checks the registry → reverts → UI shows friendly error.
Income flow: admin → `distributeIncome()` on the flat or bond contract with ETH → contract loops holders → ETH arrives in wallets (rent or coupon).

---

## 12. Build plan: phases (zero to demo-ready)

Total 24 hours. **Do not start a phase until the previous "Done when" check passes.** Commit to Git after every phase.

### Phase 0: Setup (hours 0-2)
**Humans do (AI cannot):**
- Install MetaMask. Create 4 separate demo accounts (Admin, Investor A, Investor B, Outsider C). Never connect a personal or real-money wallet.
- Add Sepolia network. Search "Sepolia faucet" and claim free test ETH for the Admin and both investors **right now** (faucets can be slow or need a login, so every teammate should try one). Backup network: Polygon Amoy. Note: five deployments plus many demo purchases use more gas, so collect extra test ETH.
- Install Node.js (LTS), Git. Create GitHub repo. Create Vercel account. Get an LLM API key.
- Open remix.ethereum.org.

**Done when:** Admin wallet shows test ETH on Sepolia.

### Phase 1: Smart contracts (hours 2-5.5)
**Prompt to give the AI:**
> Using Section 8 of this PRD, write `contracts/KycRegistry.sol` and `contracts/AssetToken.sol` (Solidity ^0.8.20, OpenZeppelin v5.0.2 imports using the versioned path `@openzeppelin/contracts@5.0.2/...` so Remix resolves them). Implement F1, F3, F4, F5, F6, F8 first (shared KYC registry, buy, compliance via `_update` reading the registry, price update with history). Keep it readable with comments. Then explain every function in one simple sentence.

Then in a second prompt (before deploying), add F10 (`distributeIncome`), F11 (marketplace) and F17 (`setBondTerms`, `setAssetInfo`) so you only deploy **once per asset**. Leave `settleMaturity` (F18) out unless you have spare time.

### Phase 1b: Deploy all assets (hours 5.5-6.5)
**Humans do:**
1. In Remix, deploy `KycRegistry` with "Injected Provider - MetaMask" on Sepolia using the Admin wallet. Copy its address.
2. Deploy `AssetToken` four times with the constructor values from Section 8.7 (flat, plot, gold, bond). Paste the registry address each time.
3. For each asset call `setAssetInfo`. For the bond also call `setBondTerms`.
4. Copy all **five addresses** and both **ABIs** (Remix: Solidity compiler tab, ABI copy button) into a shared note.

**Test inside Remix before moving on:**
1. InvestorA calls `registry.requestKyc`, then Admin calls `registry.approveKyc(InvestorA)`.
2. InvestorA calls `buy(1)` on the flat with value = price. Balance becomes 1.
3. InvestorA calls `buy(1)` on gold. It works with no second KYC.
4. Outsider C calls `buy(1)` on the bond. It must revert.
5. Admin calls `updatePrice` on gold. Check `pricePerTokenWei` changed.

**Done when:** all five tests pass on Sepolia. Addresses and ABIs saved in a shared note.

### Phase 2: Frontend skeleton and wallet (hours 6.5-8.5)
**Prompt:**
> Create a React 18 + Vite + Tailwind app with ethers v6 following Sections 7.1 and 9. First build only: Header with Connect MetaMask, network check with Switch to Sepolia button, and `useWallet.js`. Put the registry address, the four asset addresses (`ASSETS` list) and both ABIs in `src/contract.js` (placeholders for now). Do not build other components yet.

**Done when:** wallet connects, correct address shows, wrong network shows a red warning.

### Phase 3: Catalogue, Asset card, Portfolio (hours 8.5-11)
**Prompt:**
> Add AssetContext, `assetMeta.js`, AssetCatalog (4 cards) and AssetCard (price, supply remaining, ownership info, plus gold and bond extras) and Portfolio (balance, ownership %, value, spent, P/L, combined table) reading from the contracts. Paste real addresses and ABIs into `contract.js`. Use a read-only provider so data shows before connecting.

**Done when:** the catalogue shows four assets with real on-chain prices, and selecting one shows the connected wallet's balance for that asset.

### Phase 4: KYC + Buy + Admin approval (hours 11-14.5)
**Prompt (one at a time):**
> 1) Build KycPanel: shows status from the registry, form with name, fake ID, hashes details with keccak256 and calls `requestKyc`. 2) Build BuyPanel with live cost and `buy` on the selected asset. 3) Build AdminPanel visible only to the owner with pending KYC list and Approve/Reject. Add toasts and friendly errors via `errors.js`.

**Done when:** the full story works in the browser: Outsider requests KYC → Admin approves → Investor buys flat **and** gold → portfolio updates. And Outsider C (not approved) gets a clear rejection message on any asset.

### Phase 5: Price update and chart (hours 14.5-16.5)
**Prompt:**
> Add admin price update in AdminPanel for the selected asset. Add a recharts line chart in AssetCard from `getPriceHistory()`. Show profit/loss colour-coded in Portfolio.

**Done when:** admin raises the gold price, chart gets a new point, investor sees profit.

### Phase 6: Income, Marketplace, Bond details (hours 16.5-20)
**Prompt:**
> Add the income deposit control in AdminPanel (`distributeIncome`), shown only for the flat (label "Distribute rent") and bond (label "Pay coupon"). Show bond coupon, yield and maturity on AssetCard. Build Marketplace for the selected asset: create listing, list active listings, buy, cancel. Handle loading and empty states.

Build income first, marketplace second. If time is short, cut marketplace but keep income.

**Done when:** a coupon payment increases bond holders' wallet balances; Investor A lists, Investor B buys.

### Phase 7: AI risk, deploy, polish (hours 20-22)
**Prompt:**
> Build `api/explain-risk.js` per Section 10 and RiskModal with static fallback per asset type. Then polish the UI: spacing, colours, loading skeletons, mobile layout. Add a short README.

**Humans do:** push to GitHub, import into Vercel, add env vars, deploy, open the live URL, run the full flow once on the live site.

**Done when:** the public URL works end to end.

### Phase 8: Rehearse and record (hours 22-24)
- Run the demo script (Section 13) three times. Fix nothing new, only practise.
- Record a full screen recording as a backup.
- Prepare Plan B: Remix VM or a screenshot deck if Wi-Fi or Sepolia fails.
- **Feature freeze at hour 21.** No new features after that (F18 included).

---
## 13. Demo script (4 minutes)

Pre-demo state: contracts deployed, Admin/A/B/C wallets funded, A and B already approved, C unapproved, a few price points in history on each asset, one income payout optional to keep for live show.

| Time | Step | What the judges see |
|---|---|---|
| 0:00 | **Hook:** "A student with INR 5,000 can't invest in real estate, land, gold or bonds today. We let them start at INR 500." | Catalogue of 4 assets with prices and supply |
| 0:25 | Outsider submits fake KYC form | Status becomes Pending |
| 0:40 | Switch to Admin, click Approve | Status becomes Verified. Say: "One KYC works for every asset." |
| 0:55 | Investor buys 10 flat tokens | MetaMask confirm, portfolio updates |
| 1:15 | **Star moment:** switch to Outsider C (not verified), try to buy gold | Transaction rejected with friendly message. Say: "The rule is in the contract. Nobody can bypass it." |
| 1:40 | Investor opens Digital Gold, buys 20 tokens (shows grams). Admin updates gold price +8% | Chart updates, Investor sees profit |
| 2:10 | Investor opens Sample Bond, buys 10 tokens. Admin pays coupon (0.001 ETH) | Coupon arrives in holders' wallets automatically |
| 2:40 | Investor A lists tokens, Investor B buys | Peer-to-peer trade |
| 3:10 | Click "Explain risk" on the bond | Plain-language AI summary about credit and interest-rate risk |
| 3:35 | **Close:** "Testnet prototype. Real deployment needs SEBI-compliant structure, licensed custodians and real issuers." | Combined portfolio table across all assets |

Show the block explorer (Sepolia Etherscan) once to prove it is a real on-chain transaction. If time is short, drop the marketplace step first, then the flat purchase.

---

## 14. Judge Q&A (prepare answers)

| Question | Answer |
|---|---|
| "INDmoney and others already do fractional investing." | They keep ownership in a company database. Ours is a public record, rules are enforced in code, income pays out automatically, holders can trade peer to peer 24x7, and one KYC covers real estate, land, gold and bonds. |
| "Why blockchain?" | So nobody can quietly edit ownership records or bypass the KYC rule, and so anyone can verify holdings. |
| "Who decides the price?" | In the prototype the admin simulates a valuer, a gold rate and a bond market price. In production it would come from certified valuation, a gold price feed and market trading. |
| "Who backs the gold and the bond?" | Nobody in the prototype. They are simulated assets on a testnet. In production gold needs a licensed custodian and vault audit, and a bond needs a real, rated issuer. |
| "Why one contract for four assets?" | The ownership, KYC, trading and payout rules are the same. Only the asset details differ, so one tested contract reduces bugs. |
| "Is this legal in India?" | It is a prototype on a testnet. A real version needs a regulated structure, SEBI-compliant framework and licensed custodians. |
| "Isn't the admin a single point of trust?" | Yes, in the prototype. In production a licensed, audited authority plays that role, but ownership and rules still live on-chain. |
| "What does `_update` do?" | It is a hook that runs on every token transfer. We add a check that the receiver is KYC approved in the shared registry. |
| "Does the income loop scale?" | No. For production we would use a pull-based claim pattern. The loop is a deliberate demo simplification. |
| "Is any real money or personal data used?" | No. Testnet ETH only, and no personal data is stored on-chain. |

---

## 15. Testing checklist (run before demo)

**Contracts (in Remix or via UI)**
- [ ] Unapproved wallet `buy` reverts on all four assets
- [ ] Unapproved wallet cannot receive a token transfer or listing purchase
- [ ] One `approveKyc` lets the wallet buy all four assets
- [ ] Wrong ETH amount on `buy` reverts
- [ ] Buying more than `primarySaleRemaining` reverts
- [ ] Non-owner cannot call `approveKyc`, `updatePrice`, `distributeIncome`, `withdraw`, `setBondTerms`
- [ ] `setBondTerms` cannot be called twice
- [ ] Rent splits correctly between two flat holders (check wallet balances)
- [ ] Coupon splits correctly between two bond holders (check wallet balances)
- [ ] Listing: create, buy, cancel all work; seller receives ETH; escrowed tokens return on cancel

**Frontend**
- [ ] Works after refreshing the page
- [ ] Switching between assets loads the right price, balance and chart
- [ ] Gold shows grams; bond shows coupon, yield and maturity
- [ ] Income control appears only for flat and bond
- [ ] Combined portfolio table totals match the individual assets
- [ ] Wrong network shows warning and Switch button works
- [ ] Rejecting a transaction in MetaMask shows a friendly message, UI does not freeze
- [ ] Admin panel is hidden for non-owner wallets
- [ ] Layout is usable on a phone width
- [ ] Live Vercel URL works with a fresh browser profile

---

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Faucet is slow or empty | Get test ETH in the first 2 hours; every teammate tries a faucet; keep demo prices tiny (0.0001 ETH or less) |
| MetaMask or network fails during demo | Pre-fund and pre-connect wallets; keep a screen recording; keep Remix VM as backup |
| AI-generated code compiles but behaves wrongly | Test every feature after each phase against Section 15 |
| Redeploying breaks the frontend | Deploy the registry and all four assets once after F1-F11 and F17 are written; if you must redeploy, update `contract.js` addresses and ABIs immediately |
| Five deployments eat time or gas | Do Phase 1b with all constructor values prepared in a note (Section 8.7); one teammate pastes, another checks |
| Wrong asset address wired to a card | Keep one `ASSETS` list in `contract.js`; check each card's symbol on screen against Section 8.7 |
| OpenZeppelin version mismatch (old API) | Always pin v5.0.2 and `_update` override; paste compile errors to the AI |
| Leaked API key | Key only in Vercel env vars; `.env` in `.gitignore`; never prefix with `VITE_` |
| Judges ask who backs gold and bonds | Say clearly they are simulated; point to the Q&A answer and the disclaimers on each card |
| Running out of time | Cut in this order: F14, F18, F13, F12, F20, F19, F11, F9. Never cut F1-F8, F10, F15-F17 |
| Judges say "not original" | Lead with the differentiators in Section 1.4 and the live rejection moment |

---

## 17. Team split (4 people)

| Person | Owns |
|---|---|
| **1: Contract lead** | Phase 1, Phase 1b (Remix deploys for registry and 4 assets), ABI/address handoff, contract Q&A |
| **2: Frontend lead** | Phases 2-3, wallet, catalogue, asset context, portfolio, buy flow |
| **3: Features lead** | KYC form, admin panel, price update, income and bond details, marketplace, AI endpoint |
| **4: Product and demo lead** | Setup (Phase 0), `assetMeta.js` copy and disclaimers, UI polish, README, Vercel deploy, demo script, recording, judge Q&A |

Everyone should be able to explain, in one sentence, what their part does.

---

## 18. Pitch material

**Tagline:** "Own a piece of real estate, land, gold or a bond from INR 500. Rules enforced by code, income paid automatically."

**30-second pitch:** "Good assets like real estate, gold and bonds are locked behind huge minimum amounts. TokeEase splits them into thousands of small tokens on a blockchain. Only KYC-verified wallets can hold them, one KYC works for every asset, and that rule lives in a smart contract so nobody can bypass it. Holders can trade with each other anytime, and rent or bond coupons are split automatically. It's a testnet prototype today, built to show how transparent, programmable ownership could work."

**Honest disclaimers to show in the app footer:** "Prototype on Sepolia testnet. No real money. No real property, gold or bonds. Not financial advice."

---

## 19. Glossary (for the team)

| Term | Plain meaning |
|---|---|
| Blockchain | A public record that nobody can quietly edit |
| Wallet (MetaMask) | Your digital purse in the browser |
| Token | A digital certificate of a small ownership share |
| Smart contract | A small program on the blockchain that enforces rules like a vending machine |
| Testnet (Sepolia) | A practice blockchain with free, fake money |
| ABI | The "menu" that tells the website which contract functions exist |
| Gas | The small fee to run a transaction (paid in test ETH on Sepolia) |
| KYC | Identity verification before someone is allowed to invest |
| KYC registry | One shared contract that remembers who is verified, used by all assets |
| Escrow | Tokens held safely by the contract until a trade completes |
| Remix | A website where you paste, compile and deploy a contract |
| Bond | A loan to an issuer that pays regular interest and returns the money at maturity |
| Face value | The amount a bond promises to repay per unit |
| Coupon | The regular interest payment a bond pays to its holders |
| Yield | Yearly income divided by the price you pay |
| Maturity | The date a bond repays its face value |
| Land plot | An empty parcel of land, usually earning no income, valued by its price growth |
