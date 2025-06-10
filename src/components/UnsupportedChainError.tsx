'use client'

import { Button } from "@/components/ui/button"
import { chains } from "@/config/chains"
import { useSettings } from "@/hooks/use-setting"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export const UnsupportedChainError = () => {
    const supportedChains = [chains.base, chains.bnb, chains.arbitrum]
    const { setActiveChain } = useSettings();

    const handleSwitchChain = async (chainId: number) => {
        try {
            await window.ethereum?.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
            const chain = supportedChains.find(c => c.chainId === chainId);
            if (chain) {
                setActiveChain(chain);
            }
        } catch (switchError) {
            if (switchError.code === 4902) {
                console.error("Chain not added to wallet")
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-emerald-50 dark:from-base-background dark:to-zinc-900 text-zinc-900 dark:text-base-text transition-colors duration-300">
            <Card className="w-full max-w-md shadow-lg bg-transparent">
                <CardHeader>
                    <CardTitle className="text-2xl mx-auto font-black">Unsupported Network</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground font-medium mx-auto mb-4 text-center">
                        Please switch to one of these supported chains:
                    </p>
                    <div className="flex gap-4 mx-auto flex-wrap justify-center">
                        {supportedChains.map((chain) => (
                            <Button
                                key={chain.chainId}
                                className="hover:bg-emerald-500 dark:text-white bg-transparent text-black w-fit font-semibold"
                                variant="outline"
                                onClick={() => handleSwitchChain(chain.chainId)}
                            >
                                {chain.name}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
