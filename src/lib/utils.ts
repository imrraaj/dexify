import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Contract, ethers, parseEther, parseUnits } from "ethers"
import QUOTER_ABI from "@/data/quoter.abi.json"
import ERC20 from "@/data/ERC20.abi.json"
import SWAPROUTER_ABI from "@/data/swaprouter.abi.json"
import { Chain, Token } from "@/config/chains";
import ZELIMITER_ABI from "@/data/zelimiter.json";

interface Order {
    odt: number;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    priceUSD: string;
    user: string;
    executed: boolean;
    orderId?: number;
}

interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export const updateQuote = async (
    quoterAddress: string,
    fromToken: Token,
    toToken: Token,
    amount: string,
): Promise<{ amount: string; sucess: boolean }> => {
    const response = { amount: "", sucess: true };
    if (amount === "") {
        return response;
    }
    try {
        const params = {
            quoterAddress,
            tokenIn: fromToken,
            tokenOut: toToken,
            amountIn: amount,
            fee: 3000,
        };

        const quotedAmount = await quoteAndLogSwap(params);
        response.amount = Number(quotedAmount).toFixed(10);
    } catch (error) {
        console.error("Error in updateQuote:", error);
        response.sucess = false;
    }
    return response;
};

export const quoteAndLogSwap = async (params: {
    quoterAddress: string;
    tokenIn: Token;
    tokenOut: Token;
    amountIn: string;
    fee: number;
}): Promise<string> => {
    try {
        const quoter = getQuoter(params.quoterAddress);
        const amountInWei = ethers.parseUnits(
            params.amountIn,
            params.tokenIn.decimals
        );
        const quotedResult = await quoter.quoteExactInputSingle.staticCall({
            tokenIn: params.tokenIn.address,
            tokenOut: params.tokenOut.address,
            fee: params.fee,
            amountIn: amountInWei,
            sqrtPriceLimitX96: 0,
        });
        const quotedAmountOut = quotedResult[0];
        return ethers.formatUnits(
            quotedAmountOut,
            params.tokenOut.decimals
        );
    } catch (error) {
        console.error("Quote error:", error);
        return "0";
    }
};

export const getProvider = () => {
    if (!window.ethereum) {
        throw new Error("No wallet found. Please install MetaMask.");
    }
    return new ethers.BrowserProvider(window.ethereum);
};

export const getWallet = async () => {
    const provider = getProvider();
    const accounts = await provider.send("eth_accounts", []);
    if (accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
    }
    const wallet = accounts[0];
    return wallet;
};

export const getQuoter = (quoterAddress: string) => {
    const provider = getProvider();
    return new ethers.Contract(
        quoterAddress || "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        QUOTER_ABI,
        provider
    );
};

export const fetchBalance = async (token: Token, activeChain: Chain) => {
    if (!token) return "0";
    try {
        const provider = getProvider();
        const wallet = await getWallet();
        let balance = 0;
        if (
            token.address ===
            activeChain?.tokens.nativeCurrencyAddress.address
        ) {
            const balanceInWei = await provider.getBalance(wallet);
            balance = parseInt(balanceInWei.toString());
        } else {
            const erc20Abi = [
                "function balanceOf(address) view returns (uint256)",
            ];
            const contract = new ethers.Contract(
                token.address,
                erc20Abi,
                provider
            );
            balance = await contract.balanceOf(wallet);
        }
        return ethers.formatUnits(balance, token.decimals);
    } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error);
        return "0";
    }
};

export async function approveToken(activeChain: Chain, token: Token, amount: string) {
    try {
        const provider = getProvider();
        const contract = new ethers.Contract(
            token.address,
            ERC20,
            provider
        );
        const approveTransaction = await contract.approve
            .populateTransaction(
                activeChain.swapRouterAddress,
                ethers.parseUnits(amount.toString(), token.decimals),
            );
        const wallet = await getWallet();
        const signer = await provider.getSigner(wallet);
        const transactionResponse = await signer.sendTransaction({
            to: token.address,
            data: approveTransaction.data,
            gasLimit: 100000,
        });
        console.log(`Transaction Hash: ${transactionResponse.hash}`);
        console.log(`Approving ${amount} ${token.symbol}...`);
        const receipt = await transactionResponse.wait();
        if (receipt.status === 1) {
            console.log(`Approval successful!`);
        } else {
            console.error(`Approval failed!`);
        }
        console.log(`Transaction Receipt:`, receipt);
    } catch (error) {
        console.error("Token approval failed:", error);
    }
}

export async function executeSwap(activeChain: Chain, fromToken: Token, toToken: Token, fee: number, deadline: number, slippage: number, amountIn: string): Promise<string> {
    try {
        const provider = getProvider();
        const swapRouter = new ethers.Contract(
            activeChain.swapRouterAddress,
            SWAPROUTER_ABI,
            provider
        );
        const wallet = await getWallet();
        const signer = await provider.getSigner(wallet);
        const amountOutMinimum = (Number(amountIn) * (1 - slippage / 100)).toString();
        const tx = await swapRouter.exactInputSingle.populateTransaction({
            tokenIn: fromToken.address,
            tokenOut: toToken.address,
            fee: fee,
            recipient: wallet,
            deadline: deadline,
            amountIn: ethers.parseUnits(
                amountIn.toString(),
                fromToken.decimals,
            ),
            amountOutMinimum,
            sqrtPriceLimitX96: 0,
        });

        const receipt = await signer.sendTransaction(tx);
        console.log(`Transaction sent! Hash: ${receipt.hash}`);
        return receipt.hash;
    } catch (error) {
        console.error("Error executing swap:", error);
    }
    return "";
}

export async function sendToken(token: Token, amountIn: string, recipient: string): Promise<string> {
    try {
        const provider = getProvider();
        const contract = new ethers.Contract(
            token.address,
            ERC20,
            provider
        );
        const wallet = await getWallet();
        const signer = await provider.getSigner(wallet);
        const amountInWei = ethers.parseUnits(amountIn, token.decimals);
        const tx = await contract.transfer.populateTransaction(
            recipient,
            amountInWei
        );
        const transactionResponse = await signer.sendTransaction({
            to: token.address,
            data: tx.data,
            gasLimit: 3000,
        });
        console.log(`Transaction Hash: ${transactionResponse.hash}`);
        console.log(`Sending ${amountIn} ${token.symbol} to ${recipient}...`);
        const receipt = await transactionResponse.wait();
        if (receipt.status === 1) {
            console.log(`Transfer successful!`);
            return transactionResponse.hash;
        } else {
            console.error(`Transfer failed!`);
        }
    } catch (error) {
        console.error("Token transfer failed:", error);
    }
    return "";
}


export async function getTokenInfo(tokenAddress: string, functionName ?: string): Promise<string | TokenInfo> {
    if(functionName) {
        try {
            const provider = getProvider();
            const contract = new ethers.Contract(tokenAddress, ERC20, provider);
            const tokenInfo = await contract[functionName]();
            return tokenInfo.toString();
        } catch (error) {
            console.error(`Error fetching ${functionName} for ${tokenAddress}:`, error);
            return "Unknown";
        }
    }

    try {
        const provider = getProvider();
        const contract = new ethers.Contract(tokenAddress, ERC20, provider);
        const [name, symbol, decimals] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals()
        ]);
        return {
            address: tokenAddress,
            name: name || "Unknown",
            symbol: symbol || "Unknown",
            decimals: decimals || 18,
            balance: "0"
        }
    } catch (error) {
        console.error(`Error fetching token symbol for ${tokenAddress}:`, error);
        return "Unknown";
    }
}





export async function createBuyOrder(
    ca: string,
    tokenAddress: string,
    priceUSD: string,
    ethAmount: string
): Promise<string> {
    const priceInWei = parseUnits(priceUSD, 6);
    const ethAmountInWei = parseEther(ethAmount);
    const provider = getProvider();
    const signer = await provider.getSigner();
    const zeLimiter = new ethers.Contract(ca, ZELIMITER_ABI, signer);
    const tx = await zeLimiter.buyOrder(tokenAddress, priceInWei, { value: ethAmountInWei });
    const receipt = await tx.wait();

    const orderCreatedEvent = receipt.events?.find((event: any) => event.event === 'OrderCreated');
    const orderId = orderCreatedEvent?.args?.orderId?.toString();
    return orderId || 'Unknown';
}

export async function createSellOrder(
    ca: string,
    tokenAddress: string,
    priceUSD: string,
    tokenAmount: string
): Promise<string> {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const zeLimiter = new ethers.Contract(ca, ZELIMITER_ABI, signer);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20, signer);
    const tokenInfo = await tokenContract.decimals!();
    const priceInWei = parseUnits(priceUSD, 6);
    const amountInWei = parseUnits(tokenAmount, tokenInfo[0]);

    const userAddress = await getWallet();
    const allowance = await tokenContract.allowance(userAddress, ca);
    if (allowance < amountInWei) {
        const approveTx = await tokenContract.approve(ca, amountInWei);
        await approveTx.wait();
    }

    const tx = await zeLimiter.sellOrder(tokenAddress, priceInWei, amountInWei);
    const receipt = await tx.wait();

    const orderCreatedEvent = receipt.events?.find((event: any) => event.event === 'OrderCreated');
    const orderId = orderCreatedEvent?.args?.orderId?.toString();
    return orderId || 'Unknown';
}

export async function cancelOrder(ca: string, orderId: number): Promise<void> {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const zeLimiter = new Contract(ca, ZELIMITER_ABI, signer);
    const tx = await zeLimiter.cancelOrder(orderId);
    await tx.wait();
}
export async function getUserOrders(ca: string): Promise<Order[]> {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const zeLimiter = new Contract(ca, ZELIMITER_ABI, signer);
    const orders = await zeLimiter.viewMyOrders();
    const o =  orders.map(async (order: any, index: number) => {
        const tokenInInfo = await getTokenInfo(order.tokenIn, "symbol");
        return {
            odt: Number(order.odt),
            tokenIn: order.tokenIn,
            tokenOut: order.tokenOut,
            amountIn: order.amountIn.toString(),
            priceUSD: order.priceUSD.toString(),
            user: order.user,
            executed: order.executed,
            orderId: index,
            tokenInInfo,
        };
    });
    return Promise.all(o);
}