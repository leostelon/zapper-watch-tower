import { getQuote } from "../1inch/quoter/quoter";
import { ARB_BITCOIN_TA, SupportedNetworks } from "../chains";

export class QuoteService {
    public static async getQuote(srcChainId: SupportedNetworks, dstChainId: SupportedNetworks, srcTokenAddress: string, dstTokenAddress: string, amount: string, walletAddress: string) {
        if (srcChainId === SupportedNetworks.BITCOIN || srcChainId === SupportedNetworks.BITCOIN_TESTNET) {
            srcChainId = SupportedNetworks.ARBITRUM;
            srcTokenAddress = ARB_BITCOIN_TA;
        } else if (dstChainId === SupportedNetworks.BITCOIN || dstChainId === SupportedNetworks.BITCOIN_TESTNET) {
            dstChainId = SupportedNetworks.ARBITRUM;
            dstTokenAddress = ARB_BITCOIN_TA;
        }
        return await getQuote(srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, walletAddress)
    }
}

