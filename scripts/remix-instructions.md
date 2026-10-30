# TokeEase Smart Contract Deployment Guide (Remix + Sepolia)

> Reference: **TokeEase PRD Section 8.7 & Phase 1b (Hours 5.5-6.5)**

---

## 1. Setup in Remix IDE
1. Open [https://remix.ethereum.org](https://remix.ethereum.org)
2. In the File Explorer, create two files under `contracts/`:
   - `KycRegistry.sol` (paste contents from [`contracts/KycRegistry.sol`](file:///c:/Users/Lenovo/token/contracts/KycRegistry.sol))
   - `AssetToken.sol` (paste contents from [`contracts/AssetToken.sol`](file:///c:/Users/Lenovo/token/contracts/AssetToken.sol))
3. In the **Solidity Compiler** tab:
   - Select Compiler version: **`0.8.20`** (or newer)
   - Enable Optimization (200 runs)
   - Compile `KycRegistry.sol` and `AssetToken.sol`

---

## 2. Deploy KycRegistry (Deploy First)
1. In the **Deploy & Run Transactions** tab:
   - Environment: **`Injected Provider - MetaMask`**
   - Ensure MetaMask is on **Sepolia Testnet** (Chain ID `11155111`) using the **Admin wallet**.
2. Select Contract: **`KycRegistry`**
3. Expand the **Deploy** dropdown:
   - `initialOwner`: `<Your Admin Wallet Address>`
4. Click **`transact`** and confirm in MetaMask.
5. **Copy the deployed KycRegistry contract address** (e.g. `0x123...`).

---

## 3. Deploy the 4 AssetToken Contracts
Deploy `AssetToken` **four times**, pasting your `KycRegistry` address into `registryAddress` each time:

### Asset 1: Jaipur Flat (`JFT`)
- `initialOwner`: `<Admin Wallet Address>`
- `registryAddress`: `<Deployed KycRegistry Address>`
- `name_`: `TokeEase Jaipur Flat`
- `symbol_`: `JFT`
- `type_`: `0` (RealEstate)
- `totalSupply_`: `10000`
- `initialPriceWei`: `100000000000000` (0.0001 ETH, ₹500)

**After Deploy call:**
- `setAssetInfo("Jaipur Flat", "Jaipur, Rajasthan (sample)", "https://ipfs.io/ipfs/sample-jaipur-flat")`

---

### Asset 2: Jaipur Plot (`JPT`)
- `initialOwner`: `<Admin Wallet Address>`
- `registryAddress`: `<Deployed KycRegistry Address>`
- `name_`: `TokeEase Jaipur Plot`
- `symbol_`: `JPT`
- `type_`: `1` (Plot)
- `totalSupply_`: `5000`
- `initialPriceWei`: `100000000000000` (0.0001 ETH, ₹500)

**After Deploy call:**
- `setAssetInfo("Jaipur Plot", "Jaipur outskirts (sample)", "https://ipfs.io/ipfs/sample-jaipur-plot")`

---

### Asset 3: Digital Gold (`TGOLD`)
- `initialOwner`: `<Admin Wallet Address>`
- `registryAddress`: `<Deployed KycRegistry Address>`
- `name_`: `TokeEase Digital Gold`
- `symbol_`: `TGOLD`
- `type_`: `2` (Gold)
- `totalSupply_`: `20000`
- `initialPriceWei`: `30000000000000` (0.00003 ETH, ₹150)

**After Deploy call:**
- `setAssetInfo("Digital Gold", "1 token = 0.01 gram (demo)", "https://ipfs.io/ipfs/sample-gold-vault")`

---

### Asset 4: Sample Bond (`TBOND`)
- `initialOwner`: `<Admin Wallet Address>`
- `registryAddress`: `<Deployed KycRegistry Address>`
- `name_`: `TokeEase Sample Bond`
- `symbol_`: `TBOND`
- `type_`: `3` (Bond)
- `totalSupply_`: `10000`
- `initialPriceWei`: `100000000000000` (0.0001 ETH, ₹500)

**After Deploy calls:**
1. `setAssetInfo("Sample Bond", "8% coupon, 3 years (demo)", "https://ipfs.io/ipfs/sample-bond-prospectus")`
2. `setBondTerms(100000000000000, 800, 1793400000)` (approx. 3 years from deploy)

---

## 4. Update Frontend Configuration
Open [`src/lib/contract.ts`](file:///c:/Users/Lenovo/token/src/lib/contract.ts) and update:

```typescript
export const REGISTRY_ADDRESS = "<Paste Deployed KycRegistry Address>";

export const ASSETS: AssetConfig[] = [
  {
    key: "jaipur-flat",
    symbol: "JFT",
    name: "Jaipur Flat",
    type: "RealEstate",
    address: "<Paste JFT Address>",
    deployBlock: 0,
    initialPriceEth: "0.0001",
  },
  {
    key: "jaipur-plot",
    symbol: "JPT",
    name: "Jaipur Plot",
    type: "Plot",
    address: "<Paste JPT Address>",
    deployBlock: 0,
    initialPriceEth: "0.0001",
  },
  {
    key: "digital-gold",
    symbol: "TGOLD",
    name: "Digital Gold",
    type: "Gold",
    address: "<Paste TGOLD Address>",
    deployBlock: 0,
    initialPriceEth: "0.00003",
  },
  {
    key: "sample-bond",
    symbol: "TBOND",
    name: "Sample Bond",
    type: "Bond",
    address: "<Paste TBOND Address>",
    deployBlock: 0,
    initialPriceEth: "0.0001",
  },
];
```

Once saved, the Next.js app immediately connects to your live Sepolia contracts!
