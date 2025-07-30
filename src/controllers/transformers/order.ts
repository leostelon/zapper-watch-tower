import { z } from 'zod';

export const CreateOrderReqTransformer = z.object({
    secret_hash: z.string(),
    quote_id: z.string()
});

export const RedeemOrderReqTransformer = z.object({
    order_id: z.string(),
    secret: z.string(),
    withdraw_to: z.string()
});
