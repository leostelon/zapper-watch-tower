require("dotenv").config();
const { networks } = require("bitcoinjs-lib");
import { env } from "./env";

export const ENVIRONMENT = env.environment;
export const NETWORK = ENVIRONMENT === "testnet" ? networks.testnet : networks.bitcoin;
export const INCH_API_KEY = env.INCH_API_KEY
export const UNISAT_API_KEY = env.UNISAT_API_KEY
export const SEPOLIA_TESTNET_RPC = env.SEPOLIA_TESTNET_RPC
export const RESOLVER_PRIVATE_KEY = env.RESOLVER_PRIVATE_KEY
export const RESOLVER_BTC_PVT_KEY_WIF = env.RESOLVER_BTC_PVT_KEY_WIF