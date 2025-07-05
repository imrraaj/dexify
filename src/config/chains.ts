import {
    CircleDot as BaseIcon,
    BarChart3 as ArbitrumIcon,
    Layers as BNBIcon
} from 'lucide-react';

export interface Token {
    symbol: string;
    name: string;
    address: string;
    balance: string;
    decimals: number;
}

export interface Chain {
    chainId: number;
    name: string;
    symbol: string;
    icon: typeof BaseIcon;
    rpcUrl: string;
    blockExplorer: string;
    factoryAddress?: string;
    zeLimiterAddress?: string;
    quoterAddress: string;
    swapRouterAddress: string;
    tokens: {
        nativeCurrencyAddress: Token;
        USDCAddress: Token;
    };
}

export const chains = {
    base: {
        chainId: 8453,
        name: 'Base',
        symbol: 'ETH',
        icon: BaseIcon,
        rpcUrl: 'https://base.llamarpc.com',
        blockExplorer: 'https://basescan.org',
        factoryAddress: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
        quoterAddress: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
        swapRouterAddress: '0x2626664c2603336E57B271c5C0b26F421741e481',
        zeLimiterAddress: "0xA2b0956C54842CB418e77b3C0E0740adDAaaa85C",
        tokens: {
            nativeCurrencyAddress: {
                symbol: "ETH",
                name: "Ethereum",
                address: '0x4200000000000000000000000000000000000006',
                balance: "0",
                decimals: 18,
            },
            USDCAddress: {
                symbol: "USDC",
                name: "USD Coin",
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                balance: "0",
                decimals: 6,
            },
        },
    },
    baseSepolia: {
        chainId: 84532,
        name: 'Base Sepolia',
        symbol: 'ETH',
        icon: BaseIcon,
        rpcUrl: 'sepolia.base.org',
        blockExplorer: 'https://sepolia.basescan.org',
        factoryAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
        quoterAddress: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27',
        swapRouterAddress: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
        tokens: {
            nativeCurrencyAddress: {
                symbol: "ETH",
                name: "Ethereum",
                logo: "/placeholder.svg",
                address: '0x7Dfd533f6935bb228A809F8438537c4c88B76992',
                balance: "0",
                decimals: 18,
            },
            USDCAddress: {
                symbol: "USDC",
                name: "USD Coin",
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                balance: "0",
                decimals: 6,
            },
        },
    },
    arbitrum: {
        chainId: 42161,
        name: 'Arbitrum',
        symbol: 'ETH',
        icon: ArbitrumIcon,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        blockExplorer: 'https://arbiscan.io',
        factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        quoterAddress: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        swapRouterAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        tokens: {
            nativeCurrencyAddress: {
                symbol: "ETH",
                name: "Ethereum",
                address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                balance: "0",
                decimals: 18,
            },
            USDCAddress: {
                symbol: "USDC",
                name: "USD Coin",
                address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                balance: "0",
                decimals: 6,
            },
        },
    },
    bnb: {
        chainId: 56,
        name: 'BNB Chain',
        symbol: 'BNB',
        icon: BNBIcon,
        rpcUrl: 'https://bsc-dataseed.bnbchain.org',
        blockExplorer: 'https://bscscan.com',
        factoryAddress: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
        quoterAddress: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',
        swapRouterAddress: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2',
        tokens: {
            nativeCurrencyAddress: {
                symbol: "BNB",
                name: "BNB",
                address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
                balance: "0",
                decimals: 18,
            },
            USDCAddress: {
                symbol: "USDC",
                name: "USD Coin",
                address: '0x55d398326f99059fF775485246999027B3197955',
                balance: "0",
                decimals: 18,
            },
        },
    },
};
