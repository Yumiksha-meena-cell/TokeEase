// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.2/access/Ownable.sol";

/**
 * @title KycRegistry
 * @dev TokeEase platform ka shared KYC registry contract.
 * Ek baar verified hone par wallet saare 4 assets (Real Estate, Plot, Gold, Bond) me invest kar sakta hai.
 * On-chain koi personal data store nahi hota, sirf keccak256 identity proof hash store hota hai.
 */
contract KycRegistry is Ownable {
    // KYC status enum matching PRD Section 8.2
    enum KycStatus {
        None,
        Pending,
        Approved,
        Rejected
    }

    // Har wallet address ka current KYC status
    mapping(address => KycStatus) public kycStatus;

    // Har wallet address ke submitted form data ka keccak256 cryptographic hash
    mapping(address => bytes32) public kycHash;

    // Requesters ki array jisse admin pending users ko review kar sake
    address[] public kycRequesters;
    mapping(address => bool) private hasRequested;

    // Events matching PRD Section 8.2
    event KycRequested(address indexed user, bytes32 dataHash);
    event KycApproved(address indexed user);
    event KycRejected(address indexed user);

    /**
     * @dev Deployer ko initial admin / owner set karta hai.
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev User demo KYC form submit karta hai aur status Pending ho jata hai.
     * @param dataHash Browser me calculate kiya gaya keccak256 identity hash.
     */
    function requestKyc(bytes32 dataHash) external {
        require(
            kycStatus[msg.sender] == KycStatus.None ||
                kycStatus[msg.sender] == KycStatus.Rejected,
            "KYC already pending or approved"
        );

        kycStatus[msg.sender] = KycStatus.Pending;
        kycHash[msg.sender] = dataHash;

        if (!hasRequested[msg.sender]) {
            hasRequested[msg.sender] = true;
            kycRequesters.push(msg.sender);
        }

        emit KycRequested(msg.sender, dataHash);
    }

    /**
     * @dev Admin kisi bhi user ka KYC approve karta hai.
     */
    function approveKyc(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        kycStatus[user] = KycStatus.Approved;
        emit KycApproved(user);
    }

    /**
     * @dev Admin kisi bhi user ka KYC reject karta hai.
     */
    function rejectKyc(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        kycStatus[user] = KycStatus.Rejected;
        emit KycRejected(user);
    }

    /**
     * @dev Admin kisi approved user ka KYC revoke (reject) karta hai.
     */
    function revokeKyc(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        kycStatus[user] = KycStatus.Rejected;
        emit KycRejected(user);
    }

    /**
     * @dev Check karta hai ki user KYC approved hai ya nahi (AssetToken contracts isko padhte hain).
     */
    function isApproved(address user) external view returns (bool) {
        return kycStatus[user] == KycStatus.Approved;
    }

    /**
     * @dev Alternate view helper standard interface compatibility ke liye.
     */
    function isKycApproved(address user) external view returns (bool) {
        return kycStatus[user] == KycStatus.Approved;
    }

    /**
     * @dev Saare KYC request karne wale wallets ki array admin panel ke liye return karta hai.
     */
    function getKycRequesters() external view returns (address[] memory) {
        return kycRequesters;
    }
}
