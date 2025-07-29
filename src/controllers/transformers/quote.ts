import { z } from 'zod';
import { SupportedNetworks } from '../../chains';

export const GetQuoteReqTransformer = z.object({
    srcChainId: z.enum(SupportedNetworks),
    dstChainId: z.enum(SupportedNetworks),
    srcTokenAddress: z.string(),
    dstTokenAddress: z.string(),
    amount: z.string(),
    walletAddress: z.string(),
    enableEstimate: z.boolean().default(false)
});
