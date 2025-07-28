require("dotenv").config();
const { networks } = require("bitcoinjs-lib");

const ENVIRONMENT = process.env.environment;

const network = ENVIRONMENT === "testnet" ? networks.testnet : networks.bitcoin;

module.exports = { NETWORK: network };
