// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.2/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@5.0.2/access/Ownable.sol";
import "@openzeppelin/contracts@5.0.2/utils/ReentrancyGuard.sol";

/**
 * @title IKycRegistry
 * @dev Interface for the shared TokeEase KYC registry contract.
 */
interface IKycRegistry {
    function isApproved(address user) external view returns (bool);
    function isKycApproved(address user) external view returns (bool);
}

/**
 * @title AssetToken
 * @dev Unified tokenisation engine powering Real Estate, Land Plots, Digital Gold, and Bonds.
 * Built for OpenZeppelin v5.0.2, overriding _update to enforce on-chain KYC compliance for every transfer.
 */
contract AssetToken is ERC20, Ownable, ReentrancyGuard {
    enum AssetType {
        RealEstate,
        Plot,
        Gold,
        Bond
    }

    // Core asset attributes
    AssetType public immutable assetType;
    IKycRegistry public immutable registry;
    uint256 public immutable TOTAL_SUPPLY;

    // Pricing & primary offering
    uint256 public pricePerTokenWei;
    uint256 public primarySaleRemaining;

    // Holder tracking for income distributions (Rent / Coupons)
    address[] public holders;
    mapping(address => bool) public isHolder;

    // Cost basis tracking for investor portfolio P/L calculation
    mapping(address => uint256) public totalSpentWei;

    // Historical price points for on-chain performance charts
    struct PricePoint {
        uint256 timestamp;
        uint256 price;
    }
    PricePoint[] public priceHistory;

    // Descriptive metadata (F13)
    string public assetName;
    string public assetLocation;
    string public documentURI;

    // Bond-specific parameters (F17)
    uint256 public faceValueWei;
    uint256 public couponRateBps;
    uint256 public maturityTimestamp;
    bool public bondTermsSet;

    // Peer-to-peer marketplace listings (F11)
    struct Listing {
        address seller;
        uint256 amount;
        uint256 pricePerTokenWei;
        bool active;
    }
    Listing[] public listings;

    // Events matching PRD Section 8.5
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 pricePerToken);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event IncomeDistributed(uint256 total, uint256 holderCount);
    event IncomeSendFailed(address indexed holder, uint256 amount);
    event MaturitySettled(uint256 total, uint256 holderCount);
    event ListingCreated(uint256 indexed id, address indexed seller, uint256 amount, uint256 priceWei);
    event ListingSold(uint256 indexed id, address indexed buyer);
    event ListingCancelled(uint256 indexed id);

    /**
     * @dev Deploys the asset, mints entire initial supply to the contract address, and sets initial price.
     */
    constructor(
        address initialOwner,
        address registryAddress,
        string memory name_,
        string memory symbol_,
        AssetType type_,
        uint256 totalSupply_,
        uint256 initialPriceWei
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        require(registryAddress != address(0), "Invalid registry address");
        require(totalSupply_ > 0, "Total supply must be > 0");
        require(initialPriceWei > 0, "Initial price must be > 0");

        registry = IKycRegistry(registryAddress);
        assetType = type_;
        TOTAL_SUPPLY = totalSupply_;
        primarySaleRemaining = totalSupply_;
        pricePerTokenWei = initialPriceWei;

        // Mint all initial tokens to contract address for primary distribution and escrow
        _mint(address(this), totalSupply_);

        // Record genesis price point
        priceHistory.push(PricePoint({
            timestamp: block.timestamp,
            price: initialPriceWei
        }));
    }

    /**
     * @dev Overrides ERC-20 decimals to 0 so 1 token represents 1 discrete fractional unit.
     */
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /**
     * @dev Primary purchase function allowing KYC-approved wallets to buy tokens directly with ETH.
     */
    function buy(uint256 amount) external payable nonReentrant {
        require(registry.isApproved(msg.sender), "Not KYC approved");
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= primarySaleRemaining, "Not enough tokens remaining in primary sale");
        require(msg.value == amount * pricePerTokenWei, "Incorrect ETH value sent");

        primarySaleRemaining -= amount;
        totalSpentWei[msg.sender] += msg.value;

        _transfer(address(this), msg.sender, amount);
        emit TokensPurchased(msg.sender, amount, pricePerTokenWei);
    }

    /**
     * @dev Allows the admin to update descriptive labels, legal document URLs, and location metadata.
     */
    function setAssetInfo(
        string memory name,
        string memory location,
        string memory docURI
    ) external onlyOwner {
        assetName = name;
        assetLocation = location;
        documentURI = docURI;
    }

    /**
     * @dev Configures bond specific terms such as face value, coupon basis points, and maturity timestamp.
     */
    function setBondTerms(
        uint256 _faceValueWei,
        uint256 _couponRateBps,
        uint256 _maturityTimestamp
    ) external onlyOwner {
        require(assetType == AssetType.Bond, "Only applicable to Bond assets");
        require(!bondTermsSet, "Bond terms can only be set once");
        require(_faceValueWei > 0, "Face value must be > 0");
        require(_maturityTimestamp > block.timestamp, "Maturity must be in future");

        faceValueWei = _faceValueWei;
        couponRateBps = _couponRateBps;
        maturityTimestamp = _maturityTimestamp;
        bondTermsSet = true;
    }

    /**
     * @dev Updates the simulated token price and appends a timestamped point to on-chain price history.
     */
    function updatePrice(uint256 newPriceWei) external onlyOwner {
        require(newPriceWei > 0, "Price must be greater than zero");
        uint256 oldPrice = pricePerTokenWei;
        pricePerTokenWei = newPriceWei;
        priceHistory.push(PricePoint({
            timestamp: block.timestamp,
            price: newPriceWei
        }));
        emit PriceUpdated(oldPrice, newPriceWei);
    }

    /**
     * @dev Returns timestamp and price arrays suitable for rendering frontend trend charts.
     */
    function getPriceHistory() external view returns (uint256[] memory timestamps, uint256[] memory prices) {
        uint256 len = priceHistory.length;
        timestamps = new uint256[](len);
        prices = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            timestamps[i] = priceHistory[i].timestamp;
            prices[i] = priceHistory[i].price;
        }
        return (timestamps, prices);
    }

    /**
     * @dev Distributes sent ETH proportionally among token holders as rental yield or bond coupons.
     */
    function distributeIncome() external payable onlyOwner nonReentrant {
        require(msg.value > 0, "Must send ETH to distribute");
        uint256 totalHoldersPaid = 0;

        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 bal = balanceOf(holder);
            if (bal > 0) {
                uint256 share = (msg.value * bal) / TOTAL_SUPPLY;
                if (share > 0) {
                    (bool success, ) = holder.call{value: share}("");
                    if (!success) {
                        emit IncomeSendFailed(holder, share);
                    } else {
                        totalHoldersPaid++;
                    }
                }
            }
        }

        emit IncomeDistributed(msg.value, totalHoldersPaid);
    }

    /**
     * @dev Settles bond maturity by repaying face value to holders and burning the tokenized shares.
     */
    function settleMaturity() external payable onlyOwner nonReentrant {
        require(assetType == AssetType.Bond, "Only bond assets can settle maturity");
        require(bondTermsSet, "Bond terms not set");
        require(block.timestamp >= maturityTimestamp, "Bond has not reached maturity");

        uint256 totalHoldersSettled = 0;
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 bal = balanceOf(holder);
            if (bal > 0) {
                uint256 payout = bal * faceValueWei;
                if (address(this).balance >= payout) {
                    _burn(holder, bal);
                    (bool success, ) = holder.call{value: payout}("");
                    if (!success) {
                        emit IncomeSendFailed(holder, payout);
                    } else {
                        totalHoldersSettled++;
                    }
                }
            }
        }
        emit MaturitySettled(msg.value, totalHoldersSettled);
    }

    /**
     * @dev Escrows tokens from a verified holder into the contract to list them on the marketplace.
     */
    function createListing(uint256 amount, uint256 priceWei) external nonReentrant {
        require(registry.isApproved(msg.sender), "Not KYC approved");
        require(amount > 0, "Amount must be > 0");
        require(priceWei > 0, "Price must be > 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");

        _transfer(msg.sender, address(this), amount);

        uint256 id = listings.length;
        listings.push(Listing({
            seller: msg.sender,
            amount: amount,
            pricePerTokenWei: priceWei,
            active: true
        }));

        emit ListingCreated(id, msg.sender, amount, priceWei);
    }

    /**
     * @dev Buys an entire active peer-to-peer listing, transferring tokens to buyer and ETH to seller.
     */
    function buyListing(uint256 id) external payable nonReentrant {
        require(registry.isApproved(msg.sender), "Not KYC approved");
        require(id < listings.length, "Invalid listing ID");
        Listing storage listing = listings[id];
        require(listing.active, "Listing is not active");
        uint256 totalCost = listing.amount * listing.pricePerTokenWei;
        require(msg.value == totalCost, "Incorrect ETH value sent");

        listing.active = false;
        totalSpentWei[msg.sender] += msg.value;

        _transfer(address(this), msg.sender, listing.amount);

        (bool success, ) = listing.seller.call{value: msg.value}("");
        require(success, "Payment to seller failed");

        emit ListingSold(id, msg.sender);
    }

    /**
     * @dev Cancels an active listing and releases the escrowed tokens back to the original seller.
     */
    function cancelListing(uint256 id) external nonReentrant {
        require(id < listings.length, "Invalid listing ID");
        Listing storage listing = listings[id];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Only seller can cancel");

        listing.active = false;
        _transfer(address(this), msg.sender, listing.amount);

        emit ListingCancelled(id);
    }

    /**
     * @dev Returns total count of marketplace listings created on this contract.
     */
    function listingsCount() external view returns (uint256) {
        return listings.length;
    }

    /**
     * @dev Allows contract owner to withdraw primary sales and undistributed escrow balances.
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 bal = address(this).balance;
        require(bal > 0, "No ETH to withdraw");
        (bool success, ) = owner().call{value: bal}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev OpenZeppelin v5.0.2 transfer hook enforcing on-chain compliance and registering holders.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        super._update(from, to, value);

        // Compliance check (F6):
        // Transfers (except minting) must send only to KYC-approved wallets, the contract itself (escrow), or address(0) (burns)
        if (from != address(0) && to != address(0) && to != address(this)) {
            require(registry.isApproved(to), "Recipient is not KYC approved");
        }

        // Holder tracking for income distributions
        if (to != address(0) && to != address(this) && !isHolder[to]) {
            isHolder[to] = true;
            holders.push(to);
        }
    }
}
