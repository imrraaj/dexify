import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useSettings } from '@/hooks/use-setting';
import { chains, Chain } from '@/config/chains';

interface WalletButtonProps {
  onSwap: () => Promise<void>;
  isSwapping: boolean;
  buttonText: string;
  disabled?: boolean;
  tx: string | null;
}

const WalletButton: React.FC<WalletButtonProps> = ({
  onSwap,
  isSwapping,
  buttonText,
  disabled = false,
  tx
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const { setActiveChain, activeChain } = useSettings();

  const checkWalletConnection = async () => {
    try {
      if (!window.ethereum) {
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);

      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const selectedChain = Object.values(chains).find(
          (chain: Chain) => chain.chainId === chainId
        );

        if (!selectedChain) {
          toast({
            title: "Unsupported Chain",
            description: "The selected chain is not supported. Please switch to a supported chain.",
            variant: "destructive",
          });
          setActiveChain(null);
          return;
        }

        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setActiveChain(selectedChain);
        toast({
          title: "Wallet Reconnected",
          description: `Connected to ${formatAddress(accounts[0])} on ${selectedChain.name}`,
        });
      }
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      if (!window.ethereum) {
        throw new Error("No wallet found. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const selectedChain = Object.values(chains).find(
        (chain: Chain) => chain.chainId === chainId
      );

      if (!selectedChain) {
        toast({
          title: "Unsupported Chain",
          description: "The selected chain is not supported. Please switch to a supported chain.",
          variant: "destructive",
        });
        setActiveChain(null);
        setIsConnecting(false);
        return;
      }

      const address = accounts[0];
      setWalletAddress(address);
      setIsConnected(true);
      setActiveChain(selectedChain);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${formatAddress(address)} on ${selectedChain.name}`,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    setIsConnected(false);
    setWalletAddress('');
    setActiveChain(null);
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      provider.destroy();
    }
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const handleSwap = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    try {
      await onSwap();
    } catch (error) {
      console.error("Swap error:", error);
    }
  };

  const formatAddress = (address: string) => {
    return address.length > 10
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  useEffect(() => {
    if (tx) {
      setDialogOpen(true);
    }
  }, [tx]);

  useEffect(() => {
    checkWalletConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          toast({
            title: "Account Changed",
            description: `Connected to ${formatAddress(accounts[0])}`,
          });
        }
      };

      const handleChainChanged = async () => {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const selectedChain = Object.values(chains).find(
          (chain: Chain) => chain.chainId === chainId
        );

        if (!selectedChain) {
          toast({
            title: "Unsupported Chain",
            description: "The selected chain is not supported. Please switch to a supported chain.",
            variant: "destructive",
          });
          setActiveChain(null);
          setIsConnected(false);
          setWalletAddress('');
          return;
        }

        setActiveChain(selectedChain);
        toast({
          title: "Chain Changed",
          description: `Switched to ${selectedChain.name}`,
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [setActiveChain]);

  return (
    <>
      <Button
        disabled={Boolean(walletAddress) && (isConnecting || isSwapping || disabled)}
        onClick={handleSwap}
        className={`h-11 w-full rounded-xl py-3 text-sm font-bold transition-all sm:h-12 sm:text-base ${isConnected
          ? 'bg-white text-[#080b10] hover:bg-emerald-50'
          : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
          }`}
      >
        {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSwapping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isConnecting ? "Connecting..." : isSwapping ? "Swapping..." :
          isConnected ? buttonText : "Connect Wallet"}
      </Button>

      {isConnected && (
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="text-sm text-white/45">
            Connected: <span className="font-semibold text-white/75">{formatAddress(walletAddress)}</span>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={disconnectWallet}
            className="p-0 text-sm text-white/45 hover:text-white"
          >
            Disconnect
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[94vw] rounded-2xl border-white/10 bg-[#0b1017]/96 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-md sm:p-5">
          <DialogHeader>
            <DialogTitle className="text-white">Transaction Submitted</DialogTitle>
            <DialogDescription className="text-white/50">
              Your transaction has been submitted to the network
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-white mb-1">Transaction Confirmed</h3>
            <p className="text-center text-white/50 mb-4">
              Your swap has been processed successfully
            </p>
            <Button
              variant="link"
              className="rounded-lg bg-white/[0.06] text-white/55 hover:bg-white/10 hover:text-white"
            >
              <a
                href={`${activeChain?.blockExplorer}/tx/${tx ?? ""}`}
                target="_blank" rel="noopener noreferrer">
                View on Explorer
              </a>
              <ExternalLink size={14} />
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setDialogOpen(false)}
              className="w-full rounded-xl bg-white text-[#080b10] hover:bg-emerald-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletButton;
