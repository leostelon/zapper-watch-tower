import { opcodes, payments, script } from "bitcoinjs-lib";
import { NETWORK } from "../constants";

export class BitcoinLib {
    public static getP2WSHAddress(hash: string, resolverRecipientAddress: string) {
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
            redeem: { output: locking_script, network: NETWORK },
            network: NETWORK,
        });

        const p2wshAddr = p2wsh.address ?? "";
        return p2wshAddr;
    }
}