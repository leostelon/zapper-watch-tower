import { getQuote } from "../1inch/quoter/quoter";
import { ARB_WETH_CA, POL_BITCOIN_CA, SupportedNetworks } from "../chains";
import { Quote, QuoteModel } from "../models/Quote";

export class QuoteService {
    public static async createQuote(srcChainId: SupportedNetworks, dstChainId: SupportedNetworks, srcTokenAddress: string, dstTokenAddress: string, amount: string, walletAddress: string, enableEstimate: boolean): Promise<Quote> {
        let finalSrcChainId = SupportedNetworks.POLYGON;
        let finalDstChainId = SupportedNetworks.ARBITRUM;
        let finalSrcTokenAddress = POL_BITCOIN_CA;
        let finalDstTokenAddress = ARB_WETH_CA;

        // Only for testnets
        // Update src/destination id and address to mainnet values to fetch quote from API 
        if (dstChainId === SupportedNetworks.BITCOIN || dstChainId === SupportedNetworks.BITCOIN_TESTNET) {
            finalSrcChainId = SupportedNetworks.ARBITRUM;
            finalDstChainId = SupportedNetworks.POLYGON;
            finalSrcTokenAddress = ARB_WETH_CA;
            finalDstTokenAddress = POL_BITCOIN_CA;
        }
        const quoteResponse = await getQuote(finalSrcChainId, finalDstChainId, finalSrcTokenAddress, finalDstTokenAddress, amount, walletAddress);
        const quote = new QuoteModel({ srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, srcTokenAmount: quoteResponse.srcTokenAmount, dstTokenAmount: quoteResponse.dstTokenAmount, walletAddress })
        if (enableEstimate) {
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

