import React, { useEffect, useReducer } from "react";
import { Settings, RefreshCw, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TokenSelector from "./TokenSelector";
import WalletButton from "./WalletButton";
import SwapSettings from "./SwapSettings";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-setting";
import { getChainTokens, Token } from "@/config/chains";
import { cancelOrder, createBuyOrder, createSellOrder, getUserOrders } from "@/lib/utils";


interface LimitOrderState {
    orderType: "buy" | "sell";
    tokenAmount: string;
    priceUSD: string;
    ethAmount: string;
    isPlacingOrder: boolean;
    showSettings: boolean;
    selectedToken: Token | null;
    tokens: Token[];
    isDisabled: boolean;
    tx: string | null;
    userOrders: any[];
}

type LimitOrderAction =
    | { type: "SET_ORDER_TYPE"; payload: "buy" | "sell" }
    | { type: "SET_TOKEN_AMOUNT"; payload: string }
    | { type: "SET_PRICE_USD"; payload: string }
    | { type: "SET_ETH_AMOUNT"; payload: string }
    | { type: "SET_IS_PLACING_ORDER"; payload: boolean }
    | { type: "SET_SHOW_SETTINGS"; payload: boolean }
    | { type: "SET_SELECTED_TOKEN"; payload: Token | null }
    | { type: "SET_TOKENS"; payload: Token[] }
    | { type: "RESET_AMOUNTS" }
    | { type: "SET_IS_DISABLED"; payload: boolean }
    | { type: "SET_TX"; payload: string }
    | { type: "SET_USER_ORDERS"; payload: any[] }

const initialLimitOrderState: LimitOrderState = {
    orderType: "buy",
    tokenAmount: "",
    priceUSD: "",
    ethAmount: "",
    isPlacingOrder: false,
    showSettings: false,
    selectedToken: null,
    tokens: [],
    isDisabled: true,
    tx: null,
    userOrders: [],
};

const limitOrderReducer = (
    state: LimitOrderState,
    action: LimitOrderAction
): LimitOrderState => {
    switch (action.type) {
        case "SET_ORDER_TYPE":
            return { ...state, orderType: action.payload };
        case "SET_TOKEN_AMOUNT":
            if (
                action.payload !== "" &&
                !/^[0-9]*[.,]?[0-9]*$/.test(action.payload)
            )
                return state;
            return { ...state, tokenAmount: action.payload };
        case "SET_PRICE_USD":
            if (
                action.payload !== "" &&
                !/^[0-9]*[.,]?[0-9]*$/.test(action.payload)
            )
                return state;
            return { ...state, priceUSD: action.payload };
        case "SET_ETH_AMOUNT":
            if (
                action.payload !== "" &&
                !/^[0-9]*[.,]?[0-9]*$/.test(action.payload)
            )
                return state;
            return { ...state, ethAmount: action.payload };
        case "SET_IS_PLACING_ORDER":
            return { ...state, isPlacingOrder: action.payload };
        case "SET_SHOW_SETTINGS":
            return { ...state, showSettings: action.payload };
        case "SET_SELECTED_TOKEN":
            return { ...state, selectedToken: action.payload };
        case "SET_TOKENS":
            return { ...state, tokens: action.payload };
        case "RESET_AMOUNTS":
            return { ...state, tokenAmount: "", priceUSD: "", ethAmount: "" };
        case "SET_TX":
            return { ...state, tx: action.payload };
        case "SET_IS_DISABLED":
            return { ...state, isDisabled: action.payload };
        case "SET_USER_ORDERS":
            return { ...state, userOrders: action.payload };
        default:
            return state;
    }
};

const LimitOrderCard = () => {
    const { toast } = useToast();
    const { activeChain } = useSettings();
    const [state, dispatch] = useReducer(limitOrderReducer, initialLimitOrderState);

    const {
        orderType,
        tokenAmount,
        priceUSD,
        ethAmount,
        isPlacingOrder,
        showSettings,
        selectedToken,
        isDisabled,
        tx,
        userOrders,
    } = state;

    useEffect(() => {
        if (activeChain) {
            dispatch({
                type: "SET_SELECTED_TOKEN",
                payload: activeChain.tokens.USDCAddress,
            });
            dispatch({
                type: "SET_TOKENS",
                payload: getChainTokens(activeChain).filter(token =>
                    token.address.toLowerCase() !== activeChain.tokens.nativeCurrencyAddress.address.toLowerCase()
                ),
            });
            dispatch({ type: "RESET_AMOUNTS" });
        }
    }, [activeChain]);

    useEffect(() => {
        let isFormValid = false;

        if (orderType === "buy") {
            isFormValid = !!selectedToken && !!priceUSD && !!ethAmount &&
                parseFloat(priceUSD) > 0 && parseFloat(ethAmount) > 0;
        } else {
            isFormValid = !!selectedToken && !!priceUSD && !!tokenAmount &&
                parseFloat(priceUSD) > 0 && parseFloat(tokenAmount) > 0 &&
                parseFloat(tokenAmount) <= parseFloat(selectedToken?.balance || "0");
        }

        dispatch({ type: "SET_IS_DISABLED", payload: !isFormValid });
    }, [orderType, selectedToken, tokenAmount, priceUSD, ethAmount]);

    const loadUserOrders = async () => {
        try {
            const orders = await getUserOrders(activeChain.zeLimiterAddress);
            dispatch({ type: "SET_USER_ORDERS", payload: orders });
        } catch (error) {
            console.error("Failed to load orders:", error);
        }
    };
    useEffect(() => {
        if (activeChain) {
            loadUserOrders();
        }
    }, [activeChain]);


    const handleOrderTypeChange = (value: string) => {
        dispatch({ type: "SET_ORDER_TYPE", payload: value as "buy" | "sell" });
        dispatch({ type: "RESET_AMOUNTS" });
    };

    const handlePlaceOrder = async () => {
        try {
            dispatch({ type: "SET_IS_PLACING_ORDER", payload: true });

            let orderId: string;

            if (orderType === "buy") {
                orderId = await createBuyOrder(activeChain.zeLimiterAddress, selectedToken!.address, priceUSD, ethAmount);
                toast({
                    title: "Buy Order Placed",
                    description: `Buy order #${orderId} placed for ${selectedToken!.symbol} at $${priceUSD}`,
                });
            } else {
                orderId = await createSellOrder(activeChain.zeLimiterAddress, selectedToken!.address, priceUSD, tokenAmount);
                toast({
                    title: "Sell Order Placed",
                    description: `Sell order #${orderId} placed for ${tokenAmount} ${selectedToken!.symbol} at $${priceUSD}`,
                });
            }

            dispatch({ type: "SET_TX", payload: orderId });
            dispatch({ type: "RESET_AMOUNTS" });
            await loadUserOrders(); // Refresh orders

        } catch (error) {
            toast({
                title: "Order Failed",
                description: "There was an error placing your order",
                variant: "destructive",
            });
            console.error("Order error:", error);
        } finally {
            dispatch({ type: "SET_IS_PLACING_ORDER", payload: false });
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        try {
            await cancelOrder(activeChain.zeLimiterAddress, orderId);
            toast({
                title: "Order Cancelled",
                description: `Order #${orderId} has been cancelled`,
            });
            await loadUserOrders(); // Refresh orders
        } catch (error) {
            toast({
                title: "Cancel Failed",
                description: "Failed to cancel order",
                variant: "destructive",
            });
            console.error("Cancel error:", error);
        }
    };

    const getButtonText = () => {
        if (!selectedToken) return "Select token";
        if (orderType === "buy" && (!ethAmount || !priceUSD)) return "Enter amount and price";
        if (orderType === "sell" && (!tokenAmount || !priceUSD)) return "Enter amount and price";
        return `Place ${orderType === "buy" ? "Buy" : "Sell"} Order`;
    };

    if (activeChain === null) {
        return <p className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center font-semibold text-white/60">No available chain</p>;
    }

    if (!activeChain.zeLimiterAddress) {
        return <p className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center font-semibold text-white/60">TP / SL orders are coming soon for {activeChain.name}</p>;
    }

    return (
        <div className="w-full max-w-lg mx-auto space-y-3 sm:space-y-4">
            <Card className="overflow-hidden rounded-2xl border-white/10 bg-[#0b1017]/94 text-white shadow-xl shadow-black/30 backdrop-blur-xl">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">Keeper orders</p>
                            <h2 className="font-display text-2xl font-extrabold tracking-[-0.05em] text-white">
                                TP / SL Orders
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
                                onClick={loadUserOrders}
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

                    {/* Order Type Tabs */}
                    <Tabs value={orderType} onValueChange={handleOrderTypeChange} className="mb-4">
                        <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-white/10 bg-white/[0.05] p-1 sm:h-11">
                            <TabsTrigger
                                value="buy"
                                className="flex items-center gap-2 rounded-lg text-white/55 data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-[#080b10]"
                            >
                                <TrendingUp size={16} />
                                Buy
                            </TabsTrigger>
                            <TabsTrigger
                                value="sell"
                                className="flex items-center gap-2 rounded-lg text-white/55 data-[state=active]:bg-red-400 data-[state=active]:font-bold data-[state=active]:text-red-950"
                            >
                                <TrendingDown size={16} />
                                Sell
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {showSettings && (
                        <SwapSettings
                            slippage={0.5}
                            setSlippage={() => { }}
                            deadline={30}
                            setDeadline={() => { }}
                            onClose={() =>
                                dispatch({
                                    type: "SET_SHOW_SETTINGS",
                                    payload: false,
                                })
                            }
                        />
                    )}

                    <div className="space-y-2.5 sm:space-y-3">
                        {/* Token Selection */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-white/45">
                                    Token
                                </span>
                                {selectedToken && selectedToken.balance && (
                                    <span className="text-sm text-white/45 font-semibold">
                                        Balance: {Number.parseFloat(selectedToken.balance).toFixed(4)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-end">
                                <TokenSelector
                                    selectedToken={selectedToken}
                                    setSelectedToken={(token) => {
                                        dispatch({
                                            type: "SET_SELECTED_TOKEN",
                                            payload: token,
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 transition focus-within:border-emerald-400/35 focus-within:bg-white/[0.055]">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-white/45">
                                    {orderType === "buy" ? "ETH Amount" : "Token Amount"}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={orderType === "buy" ? ethAmount : tokenAmount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                                            if (orderType === "buy") {
                                                dispatch({ type: "SET_ETH_AMOUNT", payload: value });
                                            } else {
                                                dispatch({ type: "SET_TOKEN_AMOUNT", payload: value });
                                            }
                                        }
                                    }}
                                    placeholder="0.0"
                                    className="w-full min-w-0 bg-transparent font-display text-3xl font-bold tracking-[-0.05em] text-white outline-none placeholder:text-white/16 sm:text-4xl"
                                />
                                <span className="ml-2 text-lg font-bold text-white/40">
                                    {orderType === "buy" ? "ETH" : selectedToken?.symbol || "TOKEN"}
                                </span>
                            </div>
                        </div>

                        {/* Price Input */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 transition focus-within:border-sky-300/35 focus-within:bg-white/[0.055]">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-white/45">
                                    Target Price (USD)
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2 text-3xl font-bold text-emerald-300/75">$</span>
                                <input
                                    type="text"
                                    value={priceUSD}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                                            dispatch({ type: "SET_PRICE_USD", payload: value });
                                        }
                                    }}
                                    placeholder="0.00"
                                    className="w-full min-w-0 bg-transparent font-display text-3xl font-bold tracking-[-0.05em] text-white outline-none placeholder:text-white/16 sm:text-4xl"
                                />
                                <span className="ml-2 text-lg font-bold text-white/40">USD</span>
                            </div>
                        </div>

                        {/* Order Summary */}
                        {selectedToken && (orderType === "buy" ? ethAmount : tokenAmount) && priceUSD && (
                            <div className="rounded-xl border border-white/10 bg-black/18 p-3 text-xs sm:text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="text-white/45">Order Type</span>
                                    <Badge variant={orderType === "buy" ? "default" : "destructive"}>
                                        {orderType.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-white/45">Token</span>
                                    <span className="font-semibold text-white/80">
                                        {selectedToken.symbol}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-white/45">Amount</span>
                                    <span className="font-semibold text-white/80">
                                        {orderType === "buy" ? `${ethAmount} ETH` : `${tokenAmount} ${selectedToken.symbol}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/45">Target Price</span>
                                    <span className="font-semibold text-emerald-300">
                                        ${priceUSD}
                                    </span>
                                </div>
                            </div>
                        )}

                        <WalletButton
                            onSwap={handlePlaceOrder}
                            isSwapping={isPlacingOrder}
                            buttonText={getButtonText()}
                            disabled={isDisabled}
                            tx={tx}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* User Orders */}
            <Card className="overflow-hidden rounded-2xl border-white/10 bg-[#0b1017]/78 text-white shadow-xl shadow-black/20 backdrop-blur-xl">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="flex items-center gap-2 font-display text-lg font-extrabold tracking-[-0.04em] text-white">
                            <Clock size={17} className="text-emerald-300" />
                            Your Orders
                        </h3>
                        <Badge variant="outline" className="border-white/10 text-white/60">{userOrders.length}</Badge>
                    </div>

                    {userOrders.length === 0 ? (
                        <p className="text-center text-white/45 py-4">No orders found</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {userOrders.map((order, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-3"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={`border-none text-xs outline-none ${order.odt === 0 ? "bg-emerald-400/15 text-emerald-200" : "bg-red-500/20 text-red-200"}`}>
                                                {order.odt === 0 ? "BUY" : "SELL"}
                                            </Badge>
                                            <span className="text-sm font-bold text-white/80">
                                                Order #{order.orderId}
                                            </span>
                                        </div>
                                        <div className="text-xs text-white/45">
                                            Amount: {parseFloat(order.amountIn) / 1e18} {order.odt === 0 ? "ETH" : order.tokenInInfo}
                                        </div>
                                        <div className="text-xs text-white/45">
                                            Price: ${parseFloat(order.priceUSD) / 1e6} USD
                                        </div>
                                    </div>
                                    {!order.executed && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancelOrder(order.orderId)}
                                            className="border-white/10 bg-white/[0.04] text-red-200 hover:bg-red-500/10 hover:text-red-100"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    {order.executed && (
                                        <Badge variant="secondary">Executed</Badge>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LimitOrderCard;