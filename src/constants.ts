require("dotenv").config();
const { networks } = require("bitcoinjs-lib");

export const ENVIRONMENT = process.env.environment;
export const NETWORK = ENVIRONMENT === "testnet" ? networks.testnet : networks.bitcoin;
export const INCH_API_KEY = process.env.INCH_API_KEY
export const UNISAT_API_KEY = process.env.UNISAT_API_KEY