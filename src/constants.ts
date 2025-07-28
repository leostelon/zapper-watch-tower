require("dotenv").config();
const { networks } = require("bitcoinjs-lib");

export const ENVIRONMENT = process.env.environment;
export const NETWORK = ENVIRONMENT === "testnet" ? networks.testnet : networks.bitcoin;
