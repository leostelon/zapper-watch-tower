import { script, opcodes, payments } from "bitcoinjs-lib";
import { NETWORK } from "../constants";
import { Order, OrderModel, Status } from "../models/Order";
import { QuoteModel } from "../models/Quote";
import { BitcoinMonitor } from "../unisat";
import { ethers } from 'ethers';
import Resolver from '../contracts/abi/Resolver.json';
import { config } from "../config";
import { SupportedNetworks } from "../chains";

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
		await this.deployDstEVMEscrow(quote.dstChainId, quote.dstTokenAddress, secretHashHex, quote.dstTokenAmount)
		BitcoinMonitor.instance.addAddress(order.id, p2wshAddr)
		return await order.save()
	}

	public static async getOrder(orderId: string): Promise<Order> {
		const order = await OrderModel.findById(orderId)
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

	private static async deployDstEVMEscrow(dstChainId: SupportedNetworks, tokenAddress: string, secretHashHex: string, amount: string) {
		const chainConfig = config.chain[dstChainId];
		if (!chainConfig) throw Error("Chain not configured")
		const provider = new ethers.JsonRpcProvider(chainConfig.testnet_url);
		const wallet = new ethers.Wallet(chainConfig.resolver_private_key!, provider);

		const resolver = new ethers.Contract(chainConfig.resolver_address, Resolver.abi, wallet);

		const tx = await resolver.deployDst(
			tokenAddress,
			`0x${secretHashHex}`,
			amount
		);

		await tx.wait();
		console.log('Destination escrow deployed at:', tx.hash);
	}
}

