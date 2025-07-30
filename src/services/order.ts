import { script, opcodes, payments } from "bitcoinjs-lib";
import { NETWORK } from "../constants";
import { Order, OrderModel, Status } from "../models/Order";
import { QuoteModel } from "../models/Quote";
import { BitcoinMonitor } from "../unisat";
import { ethers } from 'ethers';
import Resolver from '../contracts/abi/Resolver.json';
import ERC20 from '../contracts/abi/ERC20.json';
import { config } from "../config";
import { SupportedNetworks } from "../chains";
import { OrderRepository } from "../repositories";

const network = NETWORK;

export class OrderService {
	public static async createOrder(secretHashHex: string, quote_id: string): Promise<Order> {
		const quote = await QuoteModel.findById(quote_id)
		if (!quote) throw Error("No quote found");

		const chainConfig = config.chain[quote.dstChainId as SupportedNetworks];
		if (!chainConfig || !chainConfig.resolver_btc_address) {
			throw new Error(`resolver_btc_address missing for chain ID: ${quote.dstChainId}`);
		}
		const p2wshAddr = this.getP2WSHAddress(secretHashHex, chainConfig.resolver_btc_address);

		const order = new OrderModel({ secret_hash: secretHashHex, src_escrow_address: p2wshAddr, quote_id, src_status: [Status.ADDRESS_CREATED] })
		await this.deployDstEVMEscrow(order, quote.dstChainId, quote.dstTokenAddress, secretHashHex, quote.dstTokenAmount)
		BitcoinMonitor.instance.addAddress(order.id, p2wshAddr)
		return await order.save()
	}

	public static async getOrder(orderId: string): Promise<Order> {
		const order = await OrderModel.findById(orderId).populate("quote")
		if (!order) {
			throw Error("Order not found")
		}
		return order
	}

	public static async cancelOrder() {
		console.log("canceling order");
	}

	private static getP2WSHAddress(hash: string, resolverRecipientAddress: string) {
		const resolverAddress = resolverRecipientAddress as any;
		const secretHashBuffer = Buffer.from(hash, 'hex')
		const locking_script = script.compile([
			opcodes.OP_HASH160,
			secretHashBuffer,
			opcodes.OP_EQUALVERIFY,
			opcodes.OP_DUP,
			opcodes.OP_HASH160,
			resolverAddress,
			opcodes.OP_EQUALVERIFY,
			opcodes.OP_CHECKSIG,
		]);

		const p2wsh = payments.p2wsh({
			redeem: { output: locking_script, network },
			network,
		});

		const p2wshAddr = p2wsh.address ?? "";
		return p2wshAddr;
	}

	private static async deployDstEVMEscrow(order: Order, dstChainId: SupportedNetworks, tokenAddress: string, secretHashHex: string, amount: string) {
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

		await tx.wait();
		console.log('Destination escrow deployed at:', tx.hash);
	}

	private static async hasSufficientERC20Balance(
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

