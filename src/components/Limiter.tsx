import React, { useEffect, useReducer } from "react";
import { ArrowDown, Settings, RefreshCw, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TokenSelector from "./TokenSelector";
import WalletButton from "./WalletButton";
import SwapSettings from "./SwapSettings";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-setting";
import { Token } from "@/config/chains";
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
                payload: Object.values(activeChain.tokens).filter(token =>
                    token.address !== activeChain.tokens.nativeCurrencyAddress.address
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
        return <p className="font-semibold text-center my-8 text-emerald-500 dark:text-base-muted">No Available chain</p>;
    }

    if (!activeChain.zeLimiterAddress) {
        return <p className="font-semibold text-center my-8 text-emerald-500 dark:text-base-muted">Coming soon for {activeChain.name}</p>;
    }

    return (
        <div className="w-full max-w-lg mx-auto space-y-4">
            <Card className="bg-transparent border-zinc-700/50 dark:border-zinc-700/50 shadow-2xl">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-medium text-emerald-900 dark:text-base-text">
                            Limit Orders
                        </h2>
                        <div className="flex gap-2 items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-base-muted hover:text-base-text hover:bg-emerald-800/10"
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
                                className="text-base-muted hover:text-base-text hover:bg-emerald-800/10"
                                onClick={loadUserOrders}
                            >
                                <RefreshCw size={20} />
                            </Button>
                            <div className="rounded-full bg-emerald-900/20 py-1 px-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow"></span>
                                <span className="text-xs font-medium text-emerald-900 dark:text-base-text">
                                    {activeChain.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Type Tabs */}
                    <Tabs value={orderType} onValueChange={handleOrderTypeChange} className="mb-4">
                        <TabsList className="grid w-full grid-cols-2 bg-emerald-900/10">
                            <TabsTrigger
                                value="buy"
                                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
                            >
                                <TrendingUp size={16} />
                                Buy
                            </TabsTrigger>
                            <TabsTrigger
                                value="sell"
                                className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2"
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

                    <div className="space-y-4">
                        {/* Token Selection */}
                        <div className="bg-emerald-800/10 dark:bg-emerald-900/10 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-base-muted">
                                    Token
                                </span>
                                {selectedToken && selectedToken.balance && (
                                    <span className="text-sm text-base-muted font-medium">
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
                        <div className="bg-emerald-800/10 dark:bg-emerald-900/10 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-base-muted">
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
                                    className="w-full bg-transparent text-2xl font-bold text-emerald-900 dark:text-base-text outline-none"
                                />
                                <span className="text-lg font-medium text-base-muted ml-2">
                                    {orderType === "buy" ? "ETH" : selectedToken?.symbol || "TOKEN"}
                                </span>
                            </div>
                        </div>

                        {/* Price Input */}
                        <div className="bg-emerald-800/10 dark:bg-emerald-900/10 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-base-muted">
                                    Target Price (USD)
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold text-base-muted mr-2">$</span>
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
                                    className="w-full bg-transparent text-2xl font-bold text-emerald-900 dark:text-base-text outline-none"
                                />
                                <span className="text-lg font-medium text-base-muted ml-2">USD</span>
                            </div>
                        </div>

                        {/* Order Summary */}
                        {selectedToken && (orderType === "buy" ? ethAmount : tokenAmount) && priceUSD && (
                            <div className="rounded-lg p-3 text-sm border border-emerald-700/30">
                                <div className="flex justify-between mb-1">
                                    <span className="text-base-muted">Order Type</span>
                                    <Badge variant={orderType === "buy" ? "default" : "destructive"}>
                                        {orderType.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base-muted">Token</span>
                                    <span className="text-emerald-900 dark:text-base-text">
                                        {selectedToken.symbol}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base-muted">Amount</span>
                                    <span className="text-emerald-900 dark:text-base-text">
                                        {orderType === "buy" ? `${ethAmount} ETH` : `${tokenAmount} ${selectedToken.symbol}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-muted">Target Price</span>
                                    <span className="text-emerald-900 dark:text-base-text">
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
            <Card className="bg-transparent border-zinc-700/50 dark:border-zinc-700/50 shadow-2xl">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-emerald-900 dark:text-base-text">
                            Your Orders
                        </h3>
                        <Badge variant="outline">{userOrders.length}</Badge>
                    </div>

                    {userOrders.length === 0 ? (
                        <p className="text-center text-base-muted py-4">No orders found</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {userOrders.map((order, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-emerald-800/5 rounded-lg border border-emerald-700/20"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={`text-xs outline-none border-none text-white ${order.odt === 0 ? "bg-emerald-600/50" : "bg-red-600/50"}`}>
                                                {order.odt === 0 ? "BUY" : "SELL"}
                                            </Badge>
                                            <span className="text-sm font-medium text-emerald-900 dark:text-base-text">
                                                Order #{order.orderId}
                                            </span>
                                        </div>
                                        <div className="text-xs text-base-muted">
                                            Amount: {parseFloat(order.amountIn) / 1e18} {order.odt === 0 ? "ETH" : order.tokenInInfo}
                                        </div>
                                        <div className="text-xs text-base-muted">
                                            Price: ${parseFloat(order.priceUSD) / 1e6} USD
                                        </div>
                                    </div>
                                    {!order.executed && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancelOrder(order.orderId)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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