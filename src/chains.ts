export enum SupportedNetworks {
    POLYGON = 137,
    ARBITRUM = 42161,
    SEPOLIA = 11155111,
    BITCOIN = 990,
    BITCOIN_TESTNET = 991
}

export type Network = {
    id: SupportedNetworks,
    supported_tokens: string[]
}

export const ARB_BITCOIN_CA = "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f"
export const ARB_WETH_CA = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
export const POL_BITCOIN_CA = "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
export const POL_WETH_CA = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"