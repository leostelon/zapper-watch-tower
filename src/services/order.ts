import { networks, Network, crypto } from "bitcoinjs-lib";
import { Order, OrderModel, Status } from "../models/Order";
import { QuoteModel } from "../models/Quote";
import { BitcoinMonitor } from "../unisat";
import { ethers } from 'ethers';
import Resolver from '../contracts/abi/Resolver.json';
import ERC20 from '../contracts/abi/ERC20.json';
import { config } from "../config";
import { SupportedNetworks } from "../chains";
import { BitcoinLib } from "../lib/bitcoin";
import { UserResolverLib } from "../lib/userResolver";

export class OrderService {
	private bitcoinLib: BitcoinLib;
	private userResolverLib: UserResolverLib;
	private network: Network;

	constructor() {
		this.bitcoinLib = new BitcoinLib()
		this.userResolverLib = new UserResolverLib();
		this.network = networks.testnet;
	}

	public async createOrder(secretHashHex: string, quote_id: string): Promise<Order> {
		const quote = await QuoteModel.findById(quote_id)
		if (!quote) throw Error("No quote found");

		const userResolverBtcKeypair = this.userResolverLib.getBTCKeypair(this.network);
		const recipientAddr = crypto.hash160(userResolverBtcKeypair.publicKey)
		const p2wshAddr = this.bitcoinLib.getP2WSHHTLCAddress(secretHashHex, recipientAddr);

		const order = new OrderModel({ secret_hash: secretHashHex, quote_id })
		if (quote.dstChainId === SupportedNetworks.BITCOIN_TESTNET || quote.dstChainId === SupportedNetworks.BITCOIN_TESTNET) {
			order.dst_escrow_address = p2wshAddr;
			order.dst_status.push(Status.ADDRESS_CREATED);
			await this.deploySrcEVMEscrow(order, quote.srcChainId, quote.srcTokenAddress, secretHashHex, quote.srcTokenAmount, quote.walletAddress)
			await this.userResolverLib.depositDestBTC(p2wshAddr, parseInt(quote.dstTokenAmount))
			order.dst_status.push(Status.DEPOSIT_COMPLETE);
		} else {
			order.src_escrow_address = p2wshAddr;
			order.src_status.push(Status.ADDRESS_CREATED);
			await this.deployDstEVMEscrow(order, quote.dstChainId, quote.dstTokenAddress, secretHashHex, quote.dstTokenAmount)
			BitcoinMonitor.instance.addAddress(order.id, p2wshAddr)
		}
		return await order.save()
	}

	public async getOrder(orderId: string): Promise<Order> {
		const order = await OrderModel.findById(orderId).populate("quote")
		if (!order) {
			throw Error("Order not found")
		}
		return order
	}

	public async getOrders(walletAddress: string): Promise<Order[]> {
		const orders = await OrderModel.aggregate([
			{
				$lookup: {
					from: "quotes",
					localField: "quote_id",
					foreignField: "_id",
					as: "quote"
				}
			},
			{
				$unwind: "$quote"
			},
			{
				$match: {
					"quote.walletAddress": walletAddress
				}
			}
		]);
		return orders
	}

	public async redeemOrder(orderId: string, secret: string, withdraw_to: string): Promise<Order> {
		const order = await OrderModel.findById(orderId).populate("quote")
		if (!order) {
			throw Error("Order not found")
		} else if (!order.quote) throw Error("Quote not found for this order");

		let evmEscrowAddress = order.dst_escrow_address;
		let btcEscrowAddress = order.src_escrow_address;
		let evmChainId = order.quote.dstChainId;
		let evmWithdrawalAddress = withdraw_to;
		if (order.quote.dstChainId === SupportedNetworks.BITCOIN_TESTNET || order.quote.dstChainId === SupportedNetworks.BITCOIN_TESTNET) {
			evmEscrowAddress = order.src_escrow_address;
			btcEscrowAddress = order.dst_escrow_address;
			evmChainId = order.quote.srcChainId;
			evmWithdrawalAddress = this.userResolverLib.resolverEVMAddress;
		}
		if (!evmEscrowAddress) throw Error("EVM escrow not found this order");
		if (!btcEscrowAddress) throw Error("Source escrow address not found.")

		const chainConfig = config.chain[evmChainId as SupportedNetworks];
		if (!chainConfig) throw Error("Chain not configured")

		const provider = new ethers.JsonRpcProvider(chainConfig.testnet_url);
		const wallet = new ethers.Wallet(chainConfig.resolver_private_key!, provider);

		const resolver = new ethers.Contract(chainConfig.resolver_address, Resolver.abi, wallet);
		// TODO: check for src deposit

		// Withdraw from EVM
		const tx = await resolver.withdraw(
			evmEscrowAddress,
			secret,
			evmWithdrawalAddress
		);
		order.src_status.push(Status.WITHDRAWN)

		// Withdraw from Bitcoin
		await this.bitcoinLib.submitTransaction(secret, btcEscrowAddress);
		order.dst_status.push(Status.WITHDRAWN)
		await order.save()

		console.log('Funds withdrawn from dest at tx:', tx.hash);
		return order
	}

	public static async cancelOrder() {
		console.log("canceling order");
	}

	private async deploySrcEVMEscrow(order: Order, srcChainId: SupportedNetworks, tokenAddress: string, secretHashHex: string, amount: string, walletAddress: string) {
		if (walletAddress === ethers.ZeroAddress) throw Error("Wallet address can't be zero address");
		const chainConfig = config.chain[srcChainId];
		if (!chainConfig) throw Error("Chain not configured")
		const provider = new ethers.JsonRpcProvider(chainConfig.testnet_url);
		const resolverWallet = new ethers.Wallet(chainConfig.resolver_private_key, provider);

		// Check wallet address balance
		const hashSufficientBalance = await this.hasSufficientERC20Balance(tokenAddress, walletAddress, amount, provider);
		if (!hashSufficientBalance) throw Error("Wallet address has insufficient balance")

		const resolver = new ethers.Contract(chainConfig.resolver_address, Resolver.abi, resolverWallet);

		const formattedSecretHex = `0x${secretHashHex}`;
		if (!chainConfig.escrow_factory) throw Error("No escrow factory for this chain id");
		const preComputedAddress = await resolver.precomputeAddress(tokenAddress, formattedSecretHex);
		if (!preComputedAddress) throw Error("Unable to precompute destination escrow address")
		order.src_escrow_address = preComputedAddress;
		order.src_status.push(Status.ADDRESS_CREATED)

		const tx = await resolver.deploySrc(
			walletAddress,
			tokenAddress,
			formattedSecretHex,
			amount
		);
		order.src_status.push(Status.DEPOSIT_COMPLETE)

		console.log('Source escrow deployed at:', tx.hash);
	}

	private async deployDstEVMEscrow(order: Order, dstChainId: SupportedNetworks, tokenAddress: string, secretHashHex: string, amount: string) {
		const chainConfig = config.chain[dstChainId];
		if (!chainConfig) throw Error("Chain not configured")
		const provider = new ethers.JsonRpcProvider(chainConfig.testnet_url);
		const resolverWallet = new ethers.Wallet(chainConfig.resolver_private_key!, provider);

		// Check resolver balance
		const hashSufficientBalance = await this.hasSufficientERC20Balance(tokenAddress, chainConfig.resolver_address, amount, provider);
		if (!hashSufficientBalance) throw Error("Resolver has insufficient balance")

		const resolver = new ethers.Contract(chainConfig.resolver_address, Resolver.abi, resolverWallet);

		const formattedSecretHex = `0x${secretHashHex}`;
		if (!chainConfig.escrow_factory) throw Error("No escrow factory for this chain id");
		const preComputedAddress = await resolver.precomputeAddress(tokenAddress, formattedSecretHex);
		if (!preComputedAddress) throw Error("Unable to precompute destination escrow address")
		order.dst_escrow_address = preComputedAddress;

		const tx = await resolver.deployDst(
			tokenAddress,
			formattedSecretHex,
			amount
		);
		order.dst_status.push(Status.ADDRESS_CREATED)
		order.dst_status.push(Status.DEPOSIT_COMPLETE)

		console.log('Destination escrow deployed at:', tx.hash);
	}

	private async hasSufficientERC20Balance(
		tokenAddress: string,
		holderAddress: string,
		minAmount: string,
		provider: ethers.Provider
	): Promise<boolean> {
		const token = new ethers.Contract(tokenAddress, ERC20.abi, provider);
		const requiredAmount: bigint = BigInt(minAmount);
		const balance: bigint = await token.balanceOf(holderAddress);
		return balance >= requiredAmount;
	}
}

