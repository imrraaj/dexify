import React, { createContext, useContext, useState, useEffect } from "react";
import { Chain, chains, getChainTokens } from "@/config/chains";
import { useToast } from "@/hooks/use-toast";
import { Token } from "@/config/chains";
import { UnsupportedChainError } from "@/components/UnsupportedChainError"

export interface SettingsContextType {
    activeChain: Chain | null;
    setActiveChain: (chain: Chain | null) => void;
    activeChainTokenList: Token[];
    setActiveChainTokenList: (tokens: Token[]) => void;
    detectChain: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined
);

export const SettingsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [activeChain, setActiveChain] = useState<Chain | null>(chains.base);
    const [activeChainTokenList, setActiveChainTokenList] = useState<Token[]>(
        activeChain ? getChainTokens(activeChain) : []
    );
    useEffect(() => {
        setActiveChainTokenList(activeChain ? getChainTokens(activeChain) : []);
    }, [activeChain]);

    const { toast } = useToast();

    useEffect(() => {
        const savedChain = localStorage.getItem("chain");
        if (savedChain && savedChain in chains) {
            setActiveChain(chains[savedChain as keyof typeof chains]);
        }
        detectChain();
    }, []);

    useEffect(() => {
        if (!activeChain) return;
        localStorage.setItem(
            "chain",
            Object.keys(chains).find(
                (key) => chains[key as keyof typeof chains].chainId === activeChain.chainId
            ) || "base"
        );

        if (activeChain) {
            toast({
                title: `${activeChain.name} selected`,
                description: `You are now using ${activeChain.name} network`,
                duration: 3000,
            });
        }
    }, [activeChain, toast]);

    const detectChain = async (): Promise<void> => {
        try {
            if (window.ethereum) {
                const chainId = await window.ethereum.request({
                    method: "eth_chainId",
                });
                const networkId = parseInt(chainId, 16);
                const chainKey = Object.keys(chains).find(
                    (key) => chains[key as keyof typeof chains].chainId === networkId
                ) as keyof typeof chains | undefined;
                setActiveChain(chainKey ? chains[chainKey] : null);
            }
        } catch (error) {
            console.error("Error detecting chain:", error);
        }
    };


    return (
        <SettingsContext.Provider
            value={{
                activeChain,
                setActiveChain,
                activeChainTokenList,
                setActiveChainTokenList,
                detectChain
            }}
        >
            {activeChain === null ? (
                <React.Suspense fallback={<div>Loading network check...</div>}>
                    <UnsupportedChainError />
                </React.Suspense>
            ) : (
                children
            )}
        </SettingsContext.Provider>
    );
};
