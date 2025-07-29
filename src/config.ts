import { SupportedNetworks } from "./chains";
import { RESOLVER_PRIVATE_KEY, SEPOLIA_TESTNET_RPC } from "./constants";

interface ChainConfig {
    testnet_url: string;
    resolver_address: string;
    resolver_private_key?: string;
    resolver_btc_address?: string;
}

export const config: {
    chain: Partial<Record<SupportedNetworks, ChainConfig>>;
} = {
    chain: {
        [SupportedNetworks.SEPOLIA]: { // Sepolia
            testnet_url: SEPOLIA_TESTNET_RPC!,
            resolver_address: "0x0122Ae980D1e3A8e3e652038495fF1a5E93C770A",
            resolver_private_key: RESOLVER_PRIVATE_KEY,
            resolver_btc_address: "tb1qc7k3e3jccg886l3q0ujq569l4nwfehm4xxyr4j"
        },
    }
} as const

const SEPOLIA_WETH = "0xa6cd47FB9A6D7cFAA08577323f0f31Ed2b20965e"
const SEPOLIA_RESOLVER ="0x0122Ae980D1e3A8e3e652038495fF1a5E93C770A"