export enum SupportedNetworks {
    POLYGON = 137,
    ARBITRUM = 42161,
    BITCOIN = 990,
    BITCOIN_TESTNET = 992
}

export type Network = {
    id: SupportedNetworks,
    supported_tokens: string[]
}

export const ARB_BITCOIN_TA = "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f"