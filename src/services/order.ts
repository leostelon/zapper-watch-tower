import { script, opcodes, payments } from "bitcoinjs-lib";
import { NETWORK } from "../constants";
import { Order } from "../types/Order.type";

const network = NETWORK;

export class OrderService {
	public static async createOrder(secretHash: string, amount: bigint): Promise<Order> {
		const p2wshAddr = getP2WSHAddress(secretHash, "");
		const order = new Order(secretHash, amount, p2wshAddr)
		return order
	}
}

export async function createOrder(secretHash: string, amount: bigint) {
	const p2wshAddress = getP2WSHAddress(secretHash, "");
	return { paymentAddress: p2wshAddress };
}

export async function cancelOrder() {
	console.log("canceling order");
}

function getP2WSHAddress(hash: string, resolverRecipientAddress: string) {
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