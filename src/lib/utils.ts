import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ethers } from "ethers"
import QUOTER_ABI from "@/data/quoter.abi.json"
import ERC20 from "@/data/ERC20.abi.json"
import SWAPROUTER_ABI from "@/data/swaprouter.abi.json"
import { Chain, Token } from "@/config/chains";

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


export async function executeSwap(activeChain: Chain, fromToken: Token, toToken: Token, fee: number, deadline: number, slippage: number, amountIn: string): Promise<string>
 {
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