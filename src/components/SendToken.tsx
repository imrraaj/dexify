import React, { useEffect, useState, useReducer } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TokenSelector from "./TokenSelector";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-setting";
import WalletButton from "./WalletButton";
import { Token } from "@/config/chains";
import { ethers } from "ethers";
import { approveToken, sendToken } from "@/lib/utils";

// Define the state type
interface SendTokenState {
    selectedToken: Token | null;
    amount: string;
    recipient: string;
    isSending: boolean;
    isDisabled: boolean;
    tx: string | null;
}

// Define action types
type SendTokenAction =
    | { type: "SET_SELECTED_TOKEN"; payload: Token | null }
    | { type: "SET_AMOUNT"; payload: string }
    | { type: "SET_RECIPIENT"; payload: string }
    | { type: "SET_IS_SENDING"; payload: boolean }
    | { type: "SET_FORM_VALIDITY"; payload: boolean }
    | { type: "SET_TX", payload: string }
    | { type: "RESET_FORM" };

// Define the reducer function
const sendTokenReducer = (
    state: SendTokenState,
    action: SendTokenAction
): SendTokenState => {
    switch (action.type) {
        case "SET_SELECTED_TOKEN":
            return { ...state, selectedToken: action.payload };
        case "SET_AMOUNT":
            if (action.payload !== "" && !/^[0-9]*[.,]?[0-9]*$/.test(action.payload)) return;
            return { ...state, amount: action.payload };
        case "SET_RECIPIENT":
            return { ...state, recipient: action.payload };
        case "SET_IS_SENDING":
            return { ...state, isSending: action.payload };
        case "SET_FORM_VALIDITY":
            return { ...state, isDisabled: !action.payload };
        case "SET_TX":
            return { ...state, tx: action.payload };
        case "RESET_FORM":
            return { ...state, amount: "", recipient: "" };
        default:
            return state;
    }
};

const SendToken = () => {
    const { activeChain, activeChainTokenList } = useSettings();
    const { toast } = useToast();

    // Initialize state using useReducer
    const [state, dispatch] = useReducer(sendTokenReducer, {
        selectedToken: activeChainTokenList[0] || null,
        amount: "",
        recipient: "",
        isSending: false,
        isDisabled: true,
        tx: "",
    });

    // Destructure state for easier access
    const { selectedToken, amount, recipient, isSending, isDisabled, tx } = state;

    // Set initial selected token
    useEffect(() => {
        dispatch({
            type: "SET_SELECTED_TOKEN",
            payload: activeChainTokenList[0] || null,
        });
    }, [activeChainTokenList]);

    // Update form validity whenever relevant state changes
    useEffect(() => {
        const isFormValid =
            !!selectedToken &&
            !!amount &&
            !!recipient &&
            /^0x[a-fA-F0-9]{40}$/.test(recipient) &&
            parseFloat(amount) > 0 &&
            (isNaN(parseFloat(amount)) ||
                parseFloat(amount) <=
                    parseFloat(selectedToken?.balance || "0"));

        dispatch({ type: "SET_FORM_VALIDITY", payload: isFormValid });
    }, [selectedToken, amount, recipient]);

    const handleSend = async () => {
        if (!selectedToken || !amount || !recipient) {
            toast({
                title: "Missing information",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        if (!ethers.isAddress(recipient)) {
            toast({
                title: "Invalid address",
                description: "Please enter a valid Ethereum address",
                variant: "destructive",
            });
            return;
        }

        if (
            isNaN(parseFloat(amount)) ||
            parseFloat(amount) > parseFloat(selectedToken?.balance || "0")
        ) {
            toast({
                title: "Insufficient balance",
                description: "You do not have enough tokens to send",
                variant: "destructive",
            });
            return;
        }

        try {
            dispatch({ type: "SET_IS_SENDING", payload: true });
            const tx = await sendToken(selectedToken, amount, recipient)
            dispatch({ type: "SET_TX", payload: tx });
            toast({
                title: "Transaction Sent",
                description: `Sent ${amount} ${
                    selectedToken.symbol
                } to ${recipient.substring(0, 6)}...${recipient.substring(
                    recipient.length - 4
                )}`,
            });

            dispatch({ type: "RESET_FORM" });
        } catch (error) {
            toast({
                title: "Transaction Failed",
                description: "There was an error processing your transaction",
                variant: "destructive",
            });
            console.error("Send error:", error);
        } finally {
            dispatch({ type: "SET_IS_SENDING", payload: false });
        }
    };

    const getButtonText = () => {
        if (!selectedToken) return "Select token";
        if (!amount) return "Enter amount";
        if (!recipient) return "Enter recipient";
        if (parseFloat(amount) <= 0) return "Enter a valid amount";
        if (!ethers.isAddress(recipient)) {
            return "Please enter a valid Ethereum address";
        }
        if (
            isNaN(parseFloat(amount)) ||
            parseFloat(amount) > parseFloat(selectedToken?.balance || "0")
        ) {
            return "Insufficient balance";
        }
        return "Send";
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <Card className="bg-transparent border-zinc-700/50 shadow-xl">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-medium text-emerald-900 dark:text-base-text">
                            Send
                        </h2>
                        <div className="rounded-full bg-emerald-900/20 py-1 px-3 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow"></span>
                            <span className="text-xs font-medium text-emerald-900 dark:text-base-text">
                                {activeChain.name}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-emerald-900/10 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-base-muted">
                                    Token
                                </span>
                                {selectedToken &&
                                    selectedToken.balance !== undefined && (
                                        <span
                                            className="text-sm text-base-muted cursor-pointer font-medium"
                                            onClick={() => dispatch({ type: "SET_AMOUNT",payload: selectedToken.balance })}
                                        >
                                            Balance: {selectedToken.balance}
                                        </span>
                                    )}
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => dispatch({ type: "SET_AMOUNT", payload: e.target.value })}
                                    placeholder="0.0"
                                    className="border-none bg-transparent text-2xl font-bold text-emerald-900 dark:text-base-text outline-none w-full"
                                />
                                <TokenSelector
                                    selectedToken={selectedToken}
                                    setSelectedToken={(token) => dispatch({ type: "SET_SELECTED_TOKEN", payload: token })}
                                />
                            </div>
                        </div>

                        <div className="bg-emerald-900/10 rounded-lg p-4">
                            <div className="mb-2">
                                <span className="text-sm font-medium text-base-muted">
                                    Recipient Address
                                </span>
                            </div>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => dispatch({ type: "SET_RECIPIENT", payload: e.target.value })}
                                placeholder="0x..."
                                className="border-none bg-transparent text-base font-bold text-emerald-900 dark:text-base-text outline-none w-full"
                            />
                        </div>

                        <WalletButton
                            onSwap={handleSend}
                            isSwapping={isSending}
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

export default SendToken;
