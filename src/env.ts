import { z } from "zod";

const envSchema = z.object({
    environment: z.string().default("testnet"),
    MONGODB_URL: z.string(),
    INCH_API_KEY: z.string(),
    UNISAT_API_KEY: z.string(),
    SEPOLIA_TESTNET_RPC: z.string(),
    RESOLVER_PRIVATE_KEY: z.string(),
    RESOLVER_BTC_PVT_KEY_WIF: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("Invalid environment variables:", _env.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = _env.data;
