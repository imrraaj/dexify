import { useState } from "react";
import { ChevronDown, ExternalLink, Globe2, RadioTower, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { chains, Chain } from "@/config/chains";
import { useSettings } from "@/hooks/use-setting";
import { useToast } from "@/hooks/use-toast";

const supportedChains = Object.values(chains);

const shortAddress = (address?: string) =>
    address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—";

const toHexChainId = (chainId: number) => `0x${chainId.toString(16)}`;

const ChainSwitcher = () => {
    const [open, setOpen] = useState(false);
    const [switchingChainId, setSwitchingChainId] = useState<number | null>(null);
    const { activeChain, setActiveChain } = useSettings();
    const { toast } = useToast();

    const switchChain = async (chain: Chain) => {
        setSwitchingChainId(chain.chainId);
        try {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: toHexChainId(chain.chainId) }],
                    });
                } catch (switchError) {
                    const errorCode = (switchError as { code?: number }).code;
                    if (errorCode !== 4902) throw switchError;

                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: toHexChainId(chain.chainId),
                                chainName: chain.name,
                                nativeCurrency: {
                                    name: chain.symbol,
                                    symbol: chain.symbol,
                                    decimals: 18,
                                },
                                rpcUrls: [chain.rpcUrl],
                                blockExplorerUrls: [chain.blockExplorer],
                            },
                        ],
                    });
                }
            }

            setActiveChain(chain);
            toast({
                title: `${chain.name} ready`,
                description: "Routing, token list, and balances now follow this network.",
            });
            setOpen(false);
        } catch (error) {
            toast({
                title: "Could not switch network",
                description:
                    error instanceof Error
                        ? error.message
                        : "Approve the network switch in your wallet and try again.",
                variant: "destructive",
            });
        } finally {
            setSwitchingChainId(null);
        }
    };

    const Icon = activeChain?.icon ?? Globe2;

    return (
        <>
            <Button
                type="button"
                onClick={() => setOpen(true)}
                className="h-9 gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2 text-white hover:bg-white/[0.09] sm:h-10 sm:gap-2 sm:px-3"
                variant="ghost"
            >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-300 sm:h-7 sm:w-7">
                    <Icon size={16} />
                </span>
                <span className="hidden text-sm font-semibold sm:inline">
                    {activeChain?.name ?? "Select chain"}
                </span>
                <ChevronDown size={14} className="text-white/45" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[88vh] w-[94vw] max-w-2xl overflow-y-auto rounded-2xl border-white/10 bg-[#0b1017]/96 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-5">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-display text-lg font-extrabold sm:text-xl">
                            <RadioTower className="text-emerald-300" size={20} />
                            Choose execution chain
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                        {supportedChains.map((chain) => {
                            const ChainIcon = chain.icon;
                            const isActive = activeChain?.chainId === chain.chainId;
                            const isSwitching = switchingChainId === chain.chainId;

                            return (
                                <button
                                    key={chain.chainId}
                                    type="button"
                                    onClick={() => switchChain(chain)}
                                    className={`group rounded-xl border p-3 text-left transition duration-200 ${
                                        isActive
                                            ? "border-emerald-400/45 bg-emerald-400/8"
                                            : "border-white/10 bg-white/[0.035] hover:border-emerald-400/30 hover:bg-white/[0.06]"
                                    }`}
                                >
                                    <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-emerald-300 ring-1 ring-white/10 sm:h-10 sm:w-10">
                                                <ChainIcon size={20} />
                                            </span>
                                            <div>
                                                <div className="font-display text-sm font-extrabold text-white sm:text-base">
                                                    {chain.name}
                                                </div>
                                                <div className="text-xs text-white/45">
                                                    Chain ID {chain.chainId}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={isActive ? "bg-white text-[#080b10]" : "bg-white/10 text-white/65"}>
                                            {isActive ? "Live" : isSwitching ? "Switching" : "Ready"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 rounded-lg bg-black/20 p-2.5 text-xs text-white/55">
                                        <div className="flex items-center justify-between gap-3">
                                            <span>V3 Router</span>
                                            <span className="font-mono text-white/80">
                                                {shortAddress(chain.swapRouterAddress)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span>Universal Router 2.1.1</span>
                                            <span className="font-mono text-white/80">
                                                {shortAddress(chain.universalRouter211Address)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span>UniswapX</span>
                                            <span className="flex items-center gap-1 text-emerald-300">
                                                {chain.uniswapXSupport ? <Zap size={12} /> : null}
                                                {chain.uniswapXSupport ? "Supported" : "AMM only"}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <a
                        href="https://developers.uniswap.org/docs/trading/swapping-api/supported-chains"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-emerald-300"
                    >
                        Router data follows Uniswap supported chain docs
                        <ExternalLink size={14} />
                    </a>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ChainSwitcher;
