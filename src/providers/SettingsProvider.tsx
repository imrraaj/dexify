import React, { createContext, useContext, useState, useEffect } from "react";
import { Chain, chains } from "@/config/chains";
import { useToast } from "@/hooks/use-toast";
import { Token } from "@/config/chains";
import { UnsupportedChainError } from "@/components/UnsupportedChainError"

export interface SettingsContextType {
    activeChain: Chain;
    setActiveChain: (chain: Chain) => void;
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
    const [activeChain, setActiveChain] = useState<Chain>(chains.base);
    const [activeChainTokenList, setActiveChainTokenList] = useState<Token[]>(
        activeChain && activeChain.tokens ? Object.values(activeChain.tokens) : []
    );
    useEffect(() => {
        setActiveChainTokenList(activeChain && activeChain.tokens ? Object.values(activeChain.tokens) : []);
    }, [activeChain]);

    const { toast } = useToast();

    useEffect(() => {
        const savedChain = localStorage.getItem("chain");
        if (savedChain && chains[savedChain]) {
            setActiveChain(chains[savedChain]);
        }
        detectChain();
    }, []);

    useEffect(() => {
        if (!activeChain) return;
        localStorage.setItem(
            "chain",
            Object.keys(chains).find(
                (key) => chains[key].chainId === activeChain.chainId
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
                    (key) => chains[key].chainId === networkId
                );
                setActiveChain(chains[chainKey] ?? chains.base);
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
