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
                decimals: Number(decimals),
                balance: ethers.formatUnits(balance, Number(decimals)),
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
                    description: error instanceof Error ? error.message : "Could not add this token.",
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
        if (!activeChain) return;
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
                className="h-9 shrink-0 gap-1.5 rounded-lg border border-white/10 bg-black/24 px-2.5 text-white hover:bg-white/10 sm:h-10 sm:gap-2 sm:px-3"
            >
                {selectedToken ? (
                    <>
                        <TokenImage symbol={selectedToken.symbol} />
                        <span className="font-black text-white">
                            {selectedToken.symbol}
                        </span>
                    </>
                ) : (
                    <span className="text-white">Select token</span>
                )}
                <ChevronDown size={16} className="text-white/45" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[88vh] w-[94vw] overflow-y-auto rounded-2xl border-white/10 bg-[#0b1017]/96 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-md sm:p-5">
                    <DialogHeader>
                        <DialogTitle className="font-display text-white">
                            Select a token
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-1">
                        <div className="mb-4">
                            <Input
                                placeholder="Search by name, symbol, or paste address"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="rounded-lg border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:ring-emerald-400"
                                autoFocus
                            />
                        </div>

                        <div className="mb-2 flex items-center justify-between px-1 text-xs font-semibold text-white/45">
                            <span>Popular on {activeChain?.name ?? "this chain"}</span>
                            <span>{filteredTokens.length} tokens</span>
                        </div>

                        <ScrollArea className="h-[300px] pr-3">
                            <div className="space-y-1">
                                {filteredTokens.map((token) => (
                                    <button
                                        key={token.address}
                                        onClick={() => handleSelectToken(token)}
                                        className="w-full flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-white/[0.07]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <TokenImage symbol={token.symbol} />
                                            <div className="text-left">
                                                <div className="font-black text-white">
                                                    {token.symbol}
                                                </div>
                                                <div className="text-sm text-white/45">
                                                    {token.name}
                                                </div>
                                                <div className="font-mono text-[10px] text-white/30">
                                                    {token.address.slice(0, 6)}…{token.address.slice(-4)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selectedToken?.address ===
                                                token.address && (
                                                <Check
                                                    size={16}
                                                    className="text-emerald-300"
                                                />
                                            )}
                                        </div>
                                    </button>
                                ))}

                                {filteredTokens.length === 0 && (
                                    <div className="py-8 text-center text-white/45">
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
