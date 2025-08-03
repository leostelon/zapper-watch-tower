
# Cross-Chain HTLC Relayer

This is a simple relayer service responsible for creating and monitoring HTLC (Hash Time Locked Contracts) across Bitcoin Testnet and EVM-compatible chains (e.g., Ethereum, Polygon, etc.).

## 🚀 Overview

The relayer acts as the coordinator between Bitcoin and EVM chains. It is responsible for:

- Deploying HTLC contracts on both Bitcoin Testnet and EVM chains.
- Relaying secrets between chains to resolve contracts atomically.
- Ensuring HTLC timeouts are honored.
- Handling refund logic if conditions are not met.


## 🌐 Project Links

- 🔗 **Frontend**: [https://zapper.network](https://zapper.network)
- 🔁 **Relayer Service**: [https://api.zapper.network](https://api.zapper.network)

## ⚙️ Architecture

- **HTLC Contracts**: Implemented separately on both Bitcoin Testnet and EVM chains.
- **Relayer**: Monitors one chain for resolution (i.e., secret reveal) and relays it to the other.
- **Resolver**: A separate service or component responsible for verifying conditions and providing the final secret for resolution.  
  ⚠️ Currently, **the resolver is maintained manually**, and the relayer is running independently with support for secret propagation and HTLC creation.

## 🧪 Supported Networks

- Bitcoin Testnet
- Ethereum Sepolia