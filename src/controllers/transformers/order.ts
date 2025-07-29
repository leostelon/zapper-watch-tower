import { z } from 'zod';

export const CreateOrderReqTransformer = z.object({
    secret_hash: z.string(),
    quote_id: z.string()
});
