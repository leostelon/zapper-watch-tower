import { getQuote } from "../1inch/quoter/quoter";
import { ARB_BITCOIN_TA, SupportedNetworks } from "../chains";
import { Quote, QuoteModel } from "../models/Quote";

export class QuoteService {
    public static async createQuote(srcChainId: SupportedNetworks, dstChainId: SupportedNetworks, srcTokenAddress: string, dstTokenAddress: string, amount: string, walletAddress: string, enableEstimate: boolean): Promise<Quote> {
        if (srcChainId === SupportedNetworks.BITCOIN || srcChainId === SupportedNetworks.BITCOIN_TESTNET) {
            srcChainId = SupportedNetworks.ARBITRUM;
            srcTokenAddress = ARB_BITCOIN_TA;
        } else if (dstChainId === SupportedNetworks.BITCOIN || dstChainId === SupportedNetworks.BITCOIN_TESTNET) {
            dstChainId = SupportedNetworks.ARBITRUM;
            dstTokenAddress = ARB_BITCOIN_TA;
        }
        const quoteResponse = await getQuote(srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, walletAddress);
        const quote = new QuoteModel({ srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, srcTokenAmount: quoteResponse.srcTokenAmount, dstTokenAmount: quoteResponse.dstTokenAmount })
        if (enableEstimate){
            return await quote.save();
        }
        return quote;
    }

    public static async getQuote(quoteId: string): Promise<Quote> {
        const quote = await QuoteModel.findById(quoteId)
        if (!quote) {
            throw Error("Quote not found")
        }
        return quote
    }
}

