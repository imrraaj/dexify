import React, { useEffect, useReducer } from "react";
import { ArrowDown, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TokenSelector from "./TokenSelector";
import WalletButton from "./WalletButton";
import SwapSettings from "./SwapSettings";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-setting";
import { Token } from "@/config/chains";
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
    | { type: "SET_IS_DISABLED"; payload: boolean }; // Added action to set disabled state

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
                return;
            return { ...state, fromAmount: action.payload };
        case "SET_TO_AMOUNT":
            if (
                action.payload !== "" &&
                !/^[0-9]*[.,]?[0-9]*$/.test(action.payload)
            )
                return;
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
                payload: Object.values(activeChain.tokens),
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
            // await approveToken(activeChain, fromToken, fromAmount);
            await executeSwap(
                activeChain,
                fromToken,
                toToken,
                3000,
                deadline,
                slippage,
                fromAmount
            );

            toast({
                title: "Swap Successful",
                description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
            });
            dispatch({ type: "RESET_AMOUNTS" });
        } catch (error) {
            toast({
                title: "Swap Failed",
                description: "There was an error processing your swap",
                variant: "destructive",
            });
            console.error("Swap error:", error);
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
        return <p>No Available chain</p>;
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <Card className="bg-base-card border-zinc-700/50 dark:border-zinc-700/50 shadow-xl">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-medium text-base-text dark:text-base-text">
                            Swap
                        </h2>
                        <div className="flex gap-2 items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-base-muted hover:text-base-text hover:bg-zinc-800/50"
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
                                className="text-base-muted hover:text-base-text hover:bg-zinc-800/50"
                            >
                                <RefreshCw size={20} />
                            </Button>
                            <div className="rounded-full bg-emerald-900/20 py-1 px-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow"></span>
                                <span className="text-xs font-medium text-base-text">
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

                    <div className="space-y-4">
                        <div className="bg-zinc-800/50 dark:bg-zinc-800/50 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-base-muted">
                                    You pay
                                </span>
                                {fromToken && fromToken.balance && (
                                    <span
                                        className="text-sm text-base-muted cursor-pointer font-medium"
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
                                    className="w-full bg-transparent text-2xl font-bold text-base-text dark:text-base-text outline-none"
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
                                className="rounded-full h-10 w-10 bg-base-card border-zinc-700 shadow-md"
                                onClick={switchTokens}
                            >
                                <ArrowDown size={18} />
                            </Button>
                        </div>

                        <div className="bg-zinc-800/50 dark:bg-zinc-800/50 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-base-muted">
                                    You receive
                                </span>
                                {toToken && toToken.balance && (
                                    <span className="text-sm text-base-muted font-medium">
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
                                    className="w-full bg-transparent text-2xl font-bold text-base-text dark:text-base-text outline-none"
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
                            <div className="bg-zinc-800/30 dark:bg-zinc-800/30 rounded-lg p-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-base-muted">
                                        Rate
                                    </span>
                                    <span className="text-base-text dark:text-base-text">
                                        1 {fromToken.symbol} ={" "}
                                        {(
                                            Number(toAmount) /
                                            Number(fromAmount)
                                        ).toFixed(6)}{" "}
                                        {toToken.symbol}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-muted">
                                        Slippage Tolerance
                                    </span>
                                    <span className="text-base-text dark:text-base-text">
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
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SwapCard;
