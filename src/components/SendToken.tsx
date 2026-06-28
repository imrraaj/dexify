import React, { useEffect, useReducer } from "react";
import { Card, CardContent } from "@/components/ui/card";
import TokenSelector from "./TokenSelector";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-setting";
import WalletButton from "./WalletButton";
import { Token } from "@/config/chains";
import { ethers } from "ethers";
import { sendToken } from "@/lib/utils";

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
            if (action.payload !== "" && !/^[0-9]*[.,]?[0-9]*$/.test(action.payload)) return state;
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
            throw error;
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

    if (activeChain === null) {
        return <p className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center font-semibold text-white/60">No available chain</p>;
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <Card className="overflow-hidden rounded-2xl border-white/10 bg-[#0b1017]/94 text-white shadow-xl shadow-black/30 backdrop-blur-xl">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">Wallet transfer</p>
                            <h2 className="font-display text-2xl font-extrabold tracking-[-0.05em] text-white">
                                Send
                            </h2>
                        </div>
                        <div className="hidden rounded-md border border-emerald-400/15 bg-emerald-400/8 px-2.5 py-1.5 sm:flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow"></span>
                            <span className="text-xs font-bold text-emerald-200">
                                {activeChain.name}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3 transition focus-within:border-emerald-400/35 focus-within:bg-white/[0.065]">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-white/45">
                                    Token
                                </span>
                                {selectedToken &&
                                    selectedToken.balance !== undefined && (
                                        <span
                                            className="cursor-pointer text-xs font-semibold text-emerald-300/75 hover:text-emerald-200 sm:text-sm"
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
                                    className="w-full min-w-0 border-none bg-transparent font-display text-3xl font-bold tracking-[-0.05em] text-white outline-none placeholder:text-white/16 sm:text-4xl"
                                />
                                <TokenSelector
                                    selectedToken={selectedToken}
                                    setSelectedToken={(token) => dispatch({ type: "SET_SELECTED_TOKEN", payload: token })}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 transition focus-within:border-sky-300/35 focus-within:bg-white/[0.055]">
                            <div className="mb-2">
                                <span className="text-sm font-bold text-white/45">
                                    Recipient Address
                                </span>
                            </div>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => dispatch({ type: "SET_RECIPIENT", payload: e.target.value })}
                                placeholder="0x..."
                                className="w-full border-none bg-transparent font-mono text-base font-bold text-white outline-none placeholder:text-white/18"
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
