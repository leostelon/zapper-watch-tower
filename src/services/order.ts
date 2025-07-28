import { script, opcodes, payments } from "bitcoinjs-lib";
import { NETWORK } from "../constants";
import { Order, OrderModel } from "../models/Order";

const network = NETWORK;

export class OrderService {
	public static async createOrder(secretHash: string, amount: bigint): Promise<Order> {
		const p2wshAddr = this.getP2WSHAddress(secretHash, "");
		const order = new OrderModel({ secret_hash: secretHash, src_payment_address: p2wshAddr })
		
		return await order.save()
	}

	public static async cancelOrder() {
		console.log("canceling order");
	}

	private static getP2WSHAddress(hash: string, resolverRecipientAddress: string) {
		// const resolverAddress = resolverRecipientAddress;
		const resolverAddress = "tb1qkj2s9055xjpv3gmdff5xz3z3978uu8kfcqv7xu" as any;
		const locking_script = script.compile([
			opcodes.OP_1,
			opcodes.OP_CHECKSEQUENCEVERIFY,
			opcodes.OP_DROP,
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
}

