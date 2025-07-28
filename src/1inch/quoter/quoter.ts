import { SDK } from "@1inch/cross-chain-sdk";
import { SupportedNetworks } from "../../chains";
import { INCH_API_KEY } from "../../constants";

const sdk = new SDK({
    url: "https://api.1inch.dev/fusion-plus",
    authKey: INCH_API_KEY,
});

export async function getQuote(srcChainId: SupportedNetworks, dstChainId: SupportedNetworks, srcTokenAddress: string, dstTokenAddress: string, amount: string, walletAddress: string) {
    const params = {
        srcChainId: srcChainId as any,
        dstChainId: dstChainId as any,
        srcTokenAddress,
        dstTokenAddress,
        amount,
        walletAddress,
    };
    const quote = await sdk.getQuote(params);
    return quote
}