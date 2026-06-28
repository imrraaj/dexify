import React, { useEffect, useReducer } from "react";
import { ArrowDown, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TokenSelector from "./TokenSelector";
import WalletButton from "./WalletButton";
import SwapSettings from "./SwapSettings";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-setting";
import { getChainTokens, Token } from "@/config/chains";
import { approveToken, executeSwap, updateQuote } from "@/lib/utils";

interface SwapCardState {
    fromAmount: string;
    toAmount: string;
    isSwapping: boolean;
    showSettings: boolean;
    slippage: number;
    deadline: number;
    fromToken: Token | null;
    toToken: Token | null;
    tokens: Token[];
    isDisabled: boolean;
    tx: string | null;
}

type SwapCardAction =
    | { type: "SET_FROM_AMOUNT"; payload: string }
    | { type: "SET_TO_AMOUNT"; payload: string }
    | { type: "SET_IS_SWAPPING"; payload: boolean }
    | { type: "SET_SHOW_SETTINGS"; payload: boolean }
    | { type: "SET_SLIPPAGE"; payload: number }
    | { type: "SET_DEADLINE"; payload: number }
    | { type: "SET_FROM_TOKEN"; payload: Token | null }
    | { type: "SET_TO_TOKEN"; payload: Token | null }
    | { type: "SET_TOKENS"; payload: Token[] }
    | { type: "RESET_AMOUNTS" }
    | { type: "SET_IS_DISABLED"; payload: boolean }
    | { type: "SET_TX"; payload: string }

const initialSwapCardState = {
    fromAmount: "",
    toAmount: "",
    isSwapping: false,
    showSettings: false,
    slippage: 0.5,
    deadline: 30,
    fromToken: null,
    toToken: null,
    tokens: [],
    isDisabled: true, // Initialize as disabled
    tx: null,
};

const swapCardReducer = (
    state: SwapCardState,
    action: SwapCardAction
): SwapCardState => {
    switch (action.type) {
        case "SET_FROM_AMOUNT":
            if (
                action.payload !== "" &&
                !/^[0-9]*[.,]?[0-9]*$/.test(action.payload)
            )
                return state;
            return { ...state, fromAmount: action.payload };
        case "SET_TO_AMOUNT":
            if (
                action.payload !== "" &&
                !/^[0-9]*[.,]?[0-9]*$/.test(action.payload)
            )
                return state;
            return { ...state, toAmount: action.payload };
        case "SET_IS_SWAPPING":
            return { ...state, isSwapping: action.payload };
        case "SET_SHOW_SETTINGS":
            return { ...state, showSettings: action.payload };
        case "SET_SLIPPAGE":
            return { ...state, slippage: action.payload };
        case "SET_DEADLINE":
            return { ...state, deadline: action.payload };
        case "SET_FROM_TOKEN":
            return { ...state, fromToken: action.payload };
        case "SET_TO_TOKEN":
            return { ...state, toToken: action.payload };
        case "SET_TOKENS":
            return { ...state, tokens: action.payload };
        case "RESET_AMOUNTS":
            return { ...state, fromAmount: "", toAmount: "" };
        case "SET_TX":
            return { ...state, tx: action.payload };
        case "SET_IS_DISABLED":
            return { ...state, isDisabled: action.payload };
        default:
            return state;
    }
};

const SwapCard = () => {
    const { toast } = useToast();
    const { activeChain } = useSettings();
    const [state, dispatch] = useReducer(swapCardReducer, initialSwapCardState);

    const {
        fromAmount,
        toAmount,
        isSwapping,
        showSettings,
        slippage,
        deadline,
        fromToken,
        toToken,
        isDisabled,
        tx,
    } = state;

    useEffect(() => {
        if (activeChain) {
            dispatch({
                type: "SET_FROM_TOKEN",
                payload: activeChain.tokens.nativeCurrencyAddress,
            });
            dispatch({
                type: "SET_TO_TOKEN",
                payload: activeChain.tokens.USDCAddress,
            });
            dispatch({
                type: "SET_TOKENS",
                payload: getChainTokens(activeChain),
            });
            dispatch({ type: "RESET_AMOUNTS" });
        }
    }, [activeChain]);

    useEffect(() => {
        const isFormValid =
            !!fromToken &&
            !!toToken &&
            !!fromAmount &&
            !!toAmount &&
            parseFloat(toAmount) > 0 &&
            parseFloat(fromAmount) > 0 &&
            parseFloat(fromAmount) <= parseFloat(fromToken?.balance || "0");
        if (isFormValid) {
            dispatch({ type: "SET_IS_DISABLED", payload: false });
        } else {
            dispatch({ type: "SET_IS_DISABLED", payload: true });
        }
    }, [fromToken, toToken, fromAmount, toAmount]);

    const handleFromAmountChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
            dispatch({ type: "SET_FROM_AMOUNT", payload: value });
            const quote = await updateQuote(
                activeChain.quoterAddress,
                fromToken,
                toToken,
                value
            );

            if (quote.sucess) {
                dispatch({ type: "SET_TO_AMOUNT", payload: quote.amount });
            } else {
                dispatch({ type: "SET_TO_AMOUNT", payload: "" });
            }
        }
    };

    const handleToAmountChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
            dispatch({ type: "SET_TO_AMOUNT", payload: value });
            const quote = await updateQuote(
                activeChain.quoterAddress,
                toToken,
                fromToken,
                value
            );

            if (quote.sucess) {
                dispatch({ type: "SET_FROM_AMOUNT", payload: quote.amount });
            } else {
                dispatch({ type: "SET_FROM_AMOUNT", payload: "" });
            }
        }
    };

    const switchTokens = () => {
        dispatch({ type: "SET_FROM_TOKEN", payload: toToken });
        dispatch({ type: "SET_TO_TOKEN", payload: fromToken });
        dispatch({ type: "SET_FROM_AMOUNT", payload: toAmount });
        dispatch({ type: "SET_TO_AMOUNT", payload: fromAmount });
    };

    const handleSwap = async () => {
        if (isDisabled) return;

        try {
            dispatch({ type: "SET_IS_SWAPPING", payload: true });
            await approveToken(activeChain, fromToken, fromAmount);
            const tx = await executeSwap(
                activeChain,
                fromToken,
                toToken,
                3000,
                deadline,
                slippage,
                fromAmount,
                toAmount
            );
            if(tx) {
                dispatch({ type: "SET_TX", payload: tx });
                toast({
                    title: "Swap Successful",
                    description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
                });
                dispatch({ type: "RESET_AMOUNTS" });
            }
        } catch (error) {
            toast({
                title: "Swap Failed",
                description: "There was an error processing your swap",
                variant: "destructive",
            });
            console.error("Swap error:", error);
            throw error;
        } finally {
            dispatch({ type: "SET_IS_SWAPPING", payload: false });
        }
    };

    const getButtonText = () => {
        if (!fromToken || !toToken) return "Select tokens";
        if (!fromAmount || !toAmount) return "Enter an amount";
        return "Swap";
    };

    if (activeChain === null) {
        return <p className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center font-semibold text-white/60">No available chain</p>;
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <Card className="overflow-hidden rounded-2xl border-white/10 bg-[#0b1017]/94 text-white shadow-xl shadow-black/30 backdrop-blur-xl">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">Instant route</p>
                            <h2 className="font-display text-2xl font-extrabold tracking-[-0.05em] text-white">
                                Swap
                            </h2>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-white/50 hover:bg-white/10 hover:text-white sm:h-9 sm:w-9"
                                onClick={() =>
                                    dispatch({
                                        type: "SET_SHOW_SETTINGS",
                                        payload: !showSettings,
                                    })
                                }
                            >
                                <Settings size={20} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-white/50 hover:bg-white/10 hover:text-white sm:h-9 sm:w-9"
                                onClick={() => fromAmount && handleFromAmountChange({ target: { value: fromAmount } } as React.ChangeEvent<HTMLInputElement>)}
                            >
                                <RefreshCw size={20} />
                            </Button>
                            <div className="hidden rounded-md border border-emerald-400/15 bg-emerald-400/8 px-2.5 py-1.5 sm:flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow"></span>
                                <span className="text-xs font-bold text-emerald-200">
                                    {activeChain.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    {showSettings && (
                        <SwapSettings
                            slippage={slippage}
                            setSlippage={(val) =>
                                dispatch({ type: "SET_SLIPPAGE", payload: val })
                            }
                            deadline={deadline}
                            setDeadline={(val) =>
                                dispatch({ type: "SET_DEADLINE", payload: val })
                            }
                            onClose={() =>
                                dispatch({
                                    type: "SET_SHOW_SETTINGS",
                                    payload: false,
                                })
                            }
                        />
                    )}

                    <div className="space-y-2.5 sm:space-y-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3 transition focus-within:border-emerald-400/35 focus-within:bg-white/[0.065]">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-white/45">
                                    You pay
                                </span>
                                {fromToken && fromToken.balance && (
                                    <span
                                        className="cursor-pointer text-xs font-semibold text-emerald-300/75 hover:text-emerald-200 sm:text-sm"
                                        onClick={async () => {
                                            dispatch({
                                                type: "SET_FROM_AMOUNT",
                                                payload: fromToken.balance,
                                            });
                                            const quote = await updateQuote(
                                                activeChain.quoterAddress,
                                                fromToken,
                                                toToken,
                                                fromToken.balance
                                            );

                                            if (quote.sucess) {
                                                dispatch({
                                                    type: "SET_TO_AMOUNT",
                                                    payload: quote.amount,
                                                });
                                            } else {
                                                dispatch({
                                                    type: "SET_TO_AMOUNT",
                                                    payload: "",
                                                });
                                            }
                                        }}
                                    >
                                        Balance: {Number.parseFloat(fromToken.balance).toFixed(4)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={fromAmount}
                                    onChange={handleFromAmountChange}
                                    placeholder="0.0"
                                    className="w-full min-w-0 bg-transparent font-display text-3xl font-bold tracking-[-0.05em] text-white outline-none placeholder:text-white/16 sm:text-4xl"
                                />
                                <TokenSelector
                                    selectedToken={fromToken}
                                    setSelectedToken={(token) => {
                                        dispatch({
                                            type: "SET_FROM_TOKEN",
                                            payload: token,
                                        });
                                    }}
                                    excludeToken={toToken}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center -my-3 z-10 relative">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-xl border-white/10 bg-white text-[#080b10] hover:bg-emerald-100 sm:h-11 sm:w-11"
                                onClick={switchTokens}
                            >
                                <ArrowDown size={18} />
                            </Button>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 transition focus-within:border-sky-300/35 focus-within:bg-white/[0.055]">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-white/45">
                                    You receive
                                </span>
                                {toToken && toToken.balance && (
                                    <span className="text-sm text-white/45 font-semibold">
                                        Balance: {Number.parseFloat(toToken.balance).toFixed(4)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={toAmount}
                                    onChange={handleToAmountChange}
                                    placeholder="0.0"
                                    className="w-full min-w-0 bg-transparent font-display text-3xl font-bold tracking-[-0.05em] text-white outline-none placeholder:text-white/16 sm:text-4xl"
                                />
                                <TokenSelector
                                    selectedToken={toToken}
                                    setSelectedToken={(token) => {
                                        dispatch({
                                            type: "SET_TO_TOKEN",
                                            payload: token,
                                        });
                                    }}
                                    excludeToken={fromToken}
                                />
                            </div>
                        </div>

                        {fromToken && toToken && fromAmount && toAmount && (
                            <div className="rounded-xl border border-white/10 bg-black/18 p-3 text-xs sm:text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/45">
                                        Rate
                                    </span>
                                    <span className="font-semibold text-white/80">
                                        1 {fromToken.symbol} ={" "}
                                        {(
                                            Number(toAmount) /
                                            Number(fromAmount)
                                        ).toFixed(6)}{" "}
                                        {toToken.symbol}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/45">
                                        Slippage Tolerance
                                    </span>
                                    <span className="font-semibold text-emerald-300">
                                        {slippage}%
                                    </span>
                                </div>
                            </div>
                        )}
                        <WalletButton
                            onSwap={handleSwap}
                            isSwapping={isSwapping}
                            buttonText={getButtonText()}
                            disabled={isDisabled}
                            tx={tx}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SwapCard;
