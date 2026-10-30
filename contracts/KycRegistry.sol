// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.2/access/Ownable.sol";

/**
 * @title KycRegistry
 * @dev Shared on-chain identity registry for TokeEase platform.
 * A single KYC approval in this contract authorizes the wallet across all asset classes.
 * No personal data is stored on-chain; only hashed representations of identity data.
 */
contract KycRegistry is Ownable {
    enum KycStatus {
        None,
        Pending,
        Approved,
        Rejected
    }

    // Wallet address => Verification status
    mapping(address => KycStatus) public kycStatus;

    // Wallet address => keccak256 hash of submitted form data
    mapping(address => bytes32) public kycHash;

    // Ordered list of wallets that requested KYC (for admin review)
    address[] public kycRequesters;
    mapping(address => bool) private hasRequested;

    // Events
    event KycRequested(address indexed user, bytes32 dataHash);
    event KycApproved(address indexed user);
    event KycRejected(address indexed user);

    /**
     * @dev Sets the contract deployer as the initial owner/admin.
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Allows any user with None or Rejected status to submit a KYC request.
     * @param dataHash keccak256 hash of demo KYC details generated in browser.
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
     * @dev Approves a user's KYC verification. Only contract owner can call.
     */
    function approveKyc(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        kycStatus[user] = KycStatus.Approved;
        emit KycApproved(user);
    }

    /**
     * @dev Rejects a user's KYC verification. Only contract owner can call.
     */
    function rejectKyc(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        kycStatus[user] = KycStatus.Rejected;
        emit KycRejected(user);
    }

    /**
     * @dev Revokes approval, setting status back to Rejected. Only contract owner can call.
     */
    function revokeKyc(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        kycStatus[user] = KycStatus.Rejected;
        emit KycRejected(user);
    }

    /**
     * @dev Primary view function consumed by AssetToken contracts to verify compliance.
     */
    function isApproved(address user) external view returns (bool) {
        return kycStatus[user] == KycStatus.Approved;
    }

    /**
     * @dev Alternate helper with matching naming convention for interface compatibility.
     */
    function isKycApproved(address user) external view returns (bool) {
        return kycStatus[user] == KycStatus.Approved;
    }

    /**
     * @dev Returns the full array of applicants for admin review.
     */
    function getKycRequesters() external view returns (address[] memory) {
        return kycRequesters;
    }
}
