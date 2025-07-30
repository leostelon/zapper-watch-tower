import { SupportedNetworks } from "./chains";
import { RESOLVER_BTC_PVT_KEY_WIF, RESOLVER_PRIVATE_KEY, SEPOLIA_TESTNET_RPC } from "./constants";

interface ChainConfig {
    testnet_url: string;
    resolver_address: string;
    resolver_private_key: string;
    resolver_btc_address?: string;
    escrow_factory?: string;
}

export const config: {
    chain: Partial<Record<SupportedNetworks, ChainConfig>>;
} = {
    chain: {
        [SupportedNetworks.SEPOLIA]: { // Sepolia
            testnet_url: SEPOLIA_TESTNET_RPC!,
            resolver_address: "0xb535d5796057073e3C1961ED24C3294725Bd2341",
            resolver_private_key: RESOLVER_PRIVATE_KEY,
            resolver_btc_address: "tb1q8t4dstk53dw4dw82uajl292x2kjzwwdfa47qk6",
            escrow_factory: "0xe5F5583EDbE951246Ffe0a2042727e1A155B80E2"
        },
    }
} as const

export const userResolverConfig = {
    btc_address: "tb1q8t4dstk53dw4dw82uajl292x2kjzwwdfa47qk6",
    evm_address: "0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9",
    btc_key_wif: RESOLVER_BTC_PVT_KEY_WIF
}

const SEPOLIA_WETH = "0xa6cd47FB9A6D7cFAA08577323f0f31Ed2b20965e"
const SEPOLIA_RESOLVER = "0xb535d5796057073e3C1961ED24C3294725Bd2341"
const SEPOLIA_ESCROW_FACTORY = "0xFBD620A006B85eA9744aB66BA4Ee63C0365C3F47"