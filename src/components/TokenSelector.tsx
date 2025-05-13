import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ChevronDown, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Token } from "@/config/chains";
import TokenImage from "./TokenImage";
import { useSettings } from "@/hooks/use-setting";
import { fetchBalance } from "@/lib/utils";
import ERC20 from "@/data/ERC20.abi.json";

interface TokenSelectorProps {
    selectedToken: Token | null;
    setSelectedToken: (token: Token) => void;
    excludeToken?: Token | null;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
    selectedToken,
    setSelectedToken,
    excludeToken,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();
    const { activeChain, activeChainTokenList, setActiveChainTokenList } =
        useSettings();

    const isValidAddress = (address: string) => {
        return ethers.isAddress(address);
    };

    const fetchERC20Token = async (address: string) => {
        try {
            if (!window.ethereum) {
                throw new Error("No wallet found. Please install MetaMask.");
            }

            if (!activeChain) {
                throw new Error("No active chain selected.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const walletAddress = await (
                await provider.getSigner()
            ).getAddress();
            const contract = new ethers.Contract(address, ERC20, provider);
            const [name, symbol, decimals, balance] = await Promise.all([
                contract.name(),
                contract.symbol(),
                contract.decimals(),
                contract.balanceOf(walletAddress),
            ]);

            const t: Token = {
                address,
                name,
                symbol,
                decimals,
                balance,
            };

            return t;
        } catch (error) {
            console.error("Failed to fetch ERC20 token:", error);
            throw new Error(
                "Could not fetch token details. Ensure the address is a valid ERC20 contract."
            );
        }
    };

    const handleSearchChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const query = e.target.value.trim();
        setSearchQuery(query);

        if (isValidAddress(query)) {
            try {
                const newToken = await fetchERC20Token(query);
                const tokenExists = activeChainTokenList.some(
                    (token) =>
                        token.address.toLowerCase() === query.toLowerCase()
                );

                console.log("Token added:", newToken);
                if (!tokenExists) {
                    setActiveChainTokenList([
                        ...activeChainTokenList,
                        newToken,
                    ]);
                    toast({
                        title: "Token Added",
                        description: `${newToken.symbol} (${newToken.name}) has been added to the list.`,
                    });
                } else {
                    toast({
                        title: "Token Already Exists",
                        description: `${newToken.symbol} is already in the list.`,
                    });
                }
            } catch (error) {
                toast({
                    title: "Invalid Token",
                    description: error.message,
                    variant: "destructive",
                });
            }
        }
    };

    const filteredTokens = activeChainTokenList.filter(
        (token) =>
            (token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                token.address
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) &&
            token.address !== excludeToken?.address
    );

    const handleSelectToken = async (token: Token) => {
        const bal = await fetchBalance(token, activeChain);
        setSelectedToken({ ...token, balance: bal });
        setIsOpen(false);
        setSearchQuery("");
    };

    return (
        <>
            <Button
                variant="ghost"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 hover:bg-zinc-800/50 rounded-lg"
            >
                {selectedToken ? (
                    <>
                        <TokenImage symbol={selectedToken.symbol} />
                        <span className="text-base-text font-medium">
                            {selectedToken.symbol}
                        </span>
                    </>
                ) : (
                    <span className="text-base-text">Select token</span>
                )}
                <ChevronDown size={16} className="text-base-muted" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md bg-base-card border-zinc-700/50">
                    <DialogHeader>
                        <DialogTitle className="text-base-text">
                            Select a token
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-1">
                        <div className="mb-4">
                            <Input
                                placeholder="Search by name, symbol, or paste address"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="bg-zinc-800/50 border-zinc-700/50 text-base-text"
                                autoFocus
                            />
                        </div>

                        <ScrollArea className="h-[300px] pr-3">
                            <div className="space-y-1">
                                {filteredTokens.map((token) => (
                                    <button
                                        key={token.address}
                                        onClick={() => handleSelectToken(token)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <TokenImage symbol={token.symbol} />
                                            <div className="text-left">
                                                <div className="font-medium text-base-text">
                                                    {token.symbol}
                                                </div>
                                                <div className="text-sm text-base-muted">
                                                    {token.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selectedToken?.address ===
                                                token.address && (
                                                <Check
                                                    size={16}
                                                    className="text-base-secondary"
                                                />
                                            )}
                                        </div>
                                    </button>
                                ))}

                                {filteredTokens.length === 0 && (
                                    <div className="py-8 text-center text-base-muted">
                                        No tokens found
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TokenSelector;
