"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { BrowserProvider, Contract, formatEther, JsonRpcSigner } from "ethers";
import {
  REGISTRY_ADDRESS,
  REGISTRY_ABI,
  ASSET_ABI,
  ASSETS,
  getReadOnlyProvider,
  SEPOLIA_RPC_URL,
  isZeroAddress,
} from "../lib/contract";
import { shortAddress } from "../lib/format";
import { getFriendlyErrorMessage } from "../lib/errors";

export type RoleType = "Admin" | "Verified" | "Pending" | "Not verified";
export type KycStatusEnum = "None" | "Pending" | "Approved" | "Rejected";

interface WalletContextType {
  address: string | null;
  shortAddress: string;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  chainId: number | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  isOwner: boolean;
  role: RoleType;
  kycStatus: KycStatusEnum;
  ethBalance: string;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
  refreshState: () => Promise<void>;
  errorMessage: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_HEX_CHAIN_ID = "0xaa36a7";

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [role, setRole] = useState<RoleType>("Not verified");
  const [kycStatus, setKycStatus] = useState<KycStatusEnum>("None");
  const [ethBalance, setEthBalance] = useState<string>("0.0000 ETH");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check role and KYC status from on-chain contract
  const resolveRole = useCallback(
    async (userAddress: string, activeChainId: number | null) => {
      if (!userAddress) {
        setIsOwner(false);
        setRole("Not verified");
        setKycStatus("None");
        return;
      }

      // If contracts are not deployed yet (placeholder mode)
      if (isZeroAddress(REGISTRY_ADDRESS)) {
        setIsOwner(false);
        setRole("Not verified");
        setKycStatus("None");
        return;
      }

      if (activeChainId !== SEPOLIA_CHAIN_ID) {
        setRole("Not verified");
        return;
      }

      try {
        const readProvider = getReadOnlyProvider();
        const registry = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, readProvider);

        // 1. Check if user is owner of registry or any asset contract
        let ownerAddress = "";
        try {
          ownerAddress = await registry.owner();
        } catch {
          // Fallback to check first asset owner
          if (ASSETS.length > 0 && !isZeroAddress(ASSETS[0].address)) {
            const assetContract = new Contract(ASSETS[0].address, ASSET_ABI, readProvider);
            ownerAddress = await assetContract.owner();
          }
        }

        const isUserOwner =
          !!ownerAddress && ownerAddress.toLowerCase() === userAddress.toLowerCase();
        setIsOwner(isUserOwner);

        if (isUserOwner) {
          setRole("Admin");
          setKycStatus("Approved");
          return;
        }

        // 2. Check KYC status from registry
        const statusNum = await registry.kycStatus(userAddress);
        const statusIndex = Number(statusNum);

        switch (statusIndex) {
          case 2: // Approved
            setKycStatus("Approved");
            setRole("Verified");
            break;
          case 1: // Pending
            setKycStatus("Pending");
            setRole("Pending");
            break;
          case 3: // Rejected
            setKycStatus("Rejected");
            setRole("Not verified");
            break;
          case 0: // None
          default:
            setKycStatus("None");
            setRole("Not verified");
            break;
        }
      } catch (err) {
        console.warn("Could not query registry contract (placeholder mode active):", err);
        setIsOwner(false);
        setRole("Not verified");
        setKycStatus("None");
      }
    },
    []
  );

  // Fetch ETH balance of connected wallet
  const fetchBalance = useCallback(
    async (userAddress: string, currentProvider: BrowserProvider | null) => {
      try {
        const p = currentProvider || getReadOnlyProvider();
        const bal = await p.getBalance(userAddress);
        const formatted = `${parseFloat(formatEther(bal)).toFixed(4)} ETH`;
        setEthBalance(formatted);
      } catch {
        setEthBalance("0.0000 ETH");
      }
    },
    []
  );

  // Refresh entire wallet state
  const refreshState = useCallback(async () => {
    if (typeof window === "undefined" || !(window as unknown as { ethereum?: unknown }).ethereum) {
      return;
    }

    try {
      const browserProvider = new BrowserProvider((window as unknown as { ethereum: unknown }).ethereum as never);
      const accounts = await browserProvider.send("eth_accounts", []);

      if (accounts && accounts.length > 0) {
        const userAddr = accounts[0];
        const network = await browserProvider.getNetwork();
        const currentChainId = Number(network.chainId);
        const activeSigner = await browserProvider.getSigner();

        setProvider(browserProvider);
        setSigner(activeSigner);
        setAddress(userAddr);
        setChainId(currentChainId);
        const correct = currentChainId === SEPOLIA_CHAIN_ID;
        setIsCorrectNetwork(correct);

        await resolveRole(userAddr, currentChainId);
        await fetchBalance(userAddr, browserProvider);
      } else {
        setAddress(null);
        setSigner(null);
        setIsCorrectNetwork(false);
        setIsOwner(false);
        setRole("Not verified");
        setKycStatus("None");
        setEthBalance("0.0000 ETH");
      }
    } catch (err) {
      console.warn("Error refreshing wallet state:", err);
    }
  }, [resolveRole, fetchBalance]);

  // Connect to MetaMask
  const connect = async () => {
    setErrorMessage(null);
    if (typeof window === "undefined" || !(window as unknown as { ethereum?: unknown }).ethereum) {
      const msg = "MetaMask is not installed. Please install MetaMask extension to connect.";
      setErrorMessage(msg);
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new BrowserProvider((window as unknown as { ethereum: unknown }).ethereum as never);
      // Request user accounts
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const userAddr = accounts[0];
      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);
      const activeSigner = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(activeSigner);
      setAddress(userAddr);
      setChainId(currentChainId);
      const correct = currentChainId === SEPOLIA_CHAIN_ID;
      setIsCorrectNetwork(correct);

      await resolveRole(userAddr, currentChainId);
      await fetchBalance(userAddr, browserProvider);
    } catch (err) {
      const friendly = getFriendlyErrorMessage(err);
      setErrorMessage(friendly);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAddress(null);
    setSigner(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    setIsOwner(false);
    setRole("Not verified");
    setKycStatus("None");
    setEthBalance("0.0000 ETH");
    setErrorMessage(null);
  };

  // Switch network to Sepolia
  const switchToSepolia = async () => {
    if (typeof window === "undefined" || !(window as unknown as { ethereum?: unknown }).ethereum) {
      setErrorMessage("MetaMask is not installed.");
      return;
    }

    const ethereum = (window as unknown as { ethereum: { request: (args: unknown) => Promise<unknown> } }).ethereum;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_HEX_CHAIN_ID }],
      });
      setIsCorrectNetwork(true);
      await refreshState();
    } catch (switchError: unknown) {
      // Error code 4902 indicates that the chain has not been added to MetaMask
      const err = switchError as { code?: number; message?: string };
      if (err.code === 4902 || String(err.message).includes("4902")) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_HEX_CHAIN_ID,
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [SEPOLIA_RPC_URL],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          setIsCorrectNetwork(true);
          await refreshState();
        } catch (addError) {
          setErrorMessage(getFriendlyErrorMessage(addError));
        }
      } else {
        setErrorMessage(getFriendlyErrorMessage(switchError));
      }
    }
  };

  // Listen for accountsChanged and chainChanged events
  useEffect(() => {
    if (typeof window === "undefined" || !(window as unknown as { ethereum?: unknown }).ethereum) {
      return;
    }

    const ethereum = (window as unknown as {
      ethereum: {
        on: (event: string, handler: (...args: unknown[]) => void) => void;
        removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      };
    }).ethereum;

    let isSubscribed = true;

    // Asynchronously probe whether accounts are already authorized
    const checkConnectedAccounts = async () => {
      try {
        const browserProvider = new BrowserProvider((window as unknown as { ethereum: unknown }).ethereum as never);
        const accounts = await browserProvider.send("eth_accounts", []);
        if (isSubscribed && accounts && accounts.length > 0) {
          await refreshState();
        }
      } catch {
        // Non-blocking
      }
    };

    checkConnectedAccounts();

    const handleAccountsChanged = (accounts: unknown) => {
      const accList = accounts as string[];
      if (accList && accList.length > 0) {
        refreshState();
      } else {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      refreshState();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      isSubscribed = false;
      try {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      } catch {
        // Safe unmount
      }
    };
  }, [refreshState]);

  return (
    <WalletContext.Provider
      value={{
        address,
        shortAddress: address ? shortAddress(address) : "",
        isConnected: !!address,
        isCorrectNetwork,
        chainId,
        signer,
        provider,
        isOwner,
        role,
        kycStatus,
        ethBalance,
        isConnecting,
        connect,
        disconnect,
        switchToSepolia,
        refreshState,
        errorMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
