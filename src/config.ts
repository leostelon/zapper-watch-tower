import { SupportedNetworks } from "./chains";
import { RESOLVER_BTC_PVT_KEY_WIF, RESOLVER_PRIVATE_KEY, SEPOLIA_TESTNET_RPC } from "./constants";

interface ChainConfig {
    testnet_url: string;
    resolver_address: string;
    resolver_private_key?: string;
    resolver_btc_address?: string;
    escrow_factory?: string;
}

export const config: {
    chain: Partial<Record<SupportedNetworks, ChainConfig>>;
} = {
    chain: {
        [SupportedNetworks.SEPOLIA]: { // Sepolia
            testnet_url: SEPOLIA_TESTNET_RPC!,
            resolver_address: "0xeCfb39136056C09B0b7242251000a1DD19c2Bc46",
            resolver_private_key: RESOLVER_PRIVATE_KEY,
            resolver_btc_address: "tb1qc7k3e3jccg886l3q0ujq569l4nwfehm4xxyr4j",
            escrow_factory: "0xe5F5583EDbE951246Ffe0a2042727e1A155B80E2"
        },
    }
} as const

export const userResolverConfig = {
    btc_address: "tb1qc7k3e3jccg886l3q0ujq569l4nwfehm4xxyr4j",
    btc_key_wif: RESOLVER_BTC_PVT_KEY_WIF
}

const SEPOLIA_WETH = "0xa6cd47FB9A6D7cFAA08577323f0f31Ed2b20965e"
const SEPOLIA_RESOLVER = "0xeCfb39136056C09B0b7242251000a1DD19c2Bc46"
const SEPOLIA_ESCROW_FACTORY = "0xe5F5583EDbE951246Ffe0a2042727e1A155B80E2"