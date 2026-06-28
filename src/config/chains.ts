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
    universalRouterAddress?: string;
    universalRouter211Address?: string;
    uniswapXSupport?: boolean;
    tokens: {
        nativeCurrencyAddress: Token;
        USDCAddress: Token;
    };
    popularTokens?: Token[];
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
        universalRouterAddress: '0x6ff5693b99212da76ad316178a184ab56d299b43',
        universalRouter211Address: '0xfdf682f51fe81aa4898f0ae2163d8a55c127fbc7',
        uniswapXSupport: true,
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
        popularTokens: [
            { symbol: "cbBTC", name: "Coinbase Wrapped BTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", balance: "0", decimals: 8 },
            { symbol: "AERO", name: "Aerodrome", address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", balance: "0", decimals: 18 },
            { symbol: "DAI", name: "Dai Stablecoin", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", balance: "0", decimals: 18 },
            { symbol: "USDT", name: "Tether USD", address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", balance: "0", decimals: 6 },
        ],
    },
    baseSepolia: {
        chainId: 84532,
        name: 'Base Sepolia',
        symbol: 'ETH',
        icon: BaseIcon,
        rpcUrl: 'https://sepolia.base.org',
        blockExplorer: 'https://sepolia.basescan.org',
        factoryAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
        quoterAddress: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27',
        swapRouterAddress: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
        universalRouterAddress: '0x492e6456d9528771018deb9e87ef7750ef184104',
        universalRouter211Address: '0x8b844f885672f333bc0042cb669255f93a4c1e6b',
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
        universalRouterAddress: '0xa51afafe0263b40edaef0df8781ea9aa03e381a3',
        universalRouter211Address: '0x8b844f885672f333bc0042cb669255f93a4c1e6b',
        uniswapXSupport: true,
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
        popularTokens: [
            { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", balance: "0", decimals: 6 },
            { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", balance: "0", decimals: 18 },
            { symbol: "WBTC", name: "Wrapped BTC", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", balance: "0", decimals: 8 },
            { symbol: "DAI", name: "Dai Stablecoin", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", balance: "0", decimals: 18 },
        ],
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
        universalRouterAddress: '0x1906c1d672b88cd1b9ac7593301ca990f94eae07',
        universalRouter211Address: '0x8b844f885672f333bc0042cb669255f93a4c1e6b',
        uniswapXSupport: true,
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
                address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                balance: "0",
                decimals: 18,
            },
        },
        popularTokens: [
            { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", balance: "0", decimals: 18 },
            { symbol: "BTCB", name: "BTCB Token", address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", balance: "0", decimals: 18 },
            { symbol: "ETH", name: "Ethereum Token", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", balance: "0", decimals: 18 },
            { symbol: "CAKE", name: "PancakeSwap Token", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", balance: "0", decimals: 18 },
        ],
    },
};

export const getChainTokens = (chain: Chain): Token[] => {
    const byAddress = new Map<string, Token>();
    [...Object.values(chain.tokens), ...(chain.popularTokens ?? [])].forEach((token) => {
        byAddress.set(token.address.toLowerCase(), token);
    });
    return Array.from(byAddress.values());
};
