import { crypto, Network, networks, opcodes, payments, Psbt, script } from "bitcoinjs-lib";
import { NETWORK } from "../constants";
import { UserResolverLib } from "./userResolver";
import varuint from "varuint-bitcoin";
import { getUTXOs, sendRawTransaction } from "../unisat/api";

export class BitcoinLib {
    private userResolver: UserResolverLib;
    private network: Network;
    constructor() {
        this.userResolver = new UserResolverLib()
        this.network = networks.testnet;
    }

    public async submitTransaction(secret: string, address: string) {
        try {
            const preimage = Buffer.from(secret);
            const secretHash = crypto.hash160(preimage)
            const psbt = new Psbt({ network: this.network });
            const userResolverBtcKeypair = this.userResolver.getBTCKeypair(this.network)
            const recipientAddr = crypto.hash160(userResolverBtcKeypair.publicKey)
            const lockingScript = this.getLockingScriptBuffer(secretHash, recipientAddr)

            const p2wsh = payments.p2wsh({
                redeem: { output: lockingScript, network: this.network },
                network: this.network,
            });
            if (!p2wsh.output) throw Error("No output for p2wsh");

            // Get UTXOs
            const utxos = await getUTXOs(address);
            if (!utxos || utxos.length === 0) throw Error("No UTXO's found for this address");
            const unspentUtxo = utxos[0];

            psbt.addInput({
                hash: unspentUtxo.txid,
                index: 0,
                witnessUtxo: {
                    script: p2wsh.output,
                    value: unspentUtxo.satoshi, // in Satoshis
                },
                witnessScript: lockingScript,
            });
            psbt.setVersion(2)

            psbt.addOutput({
                address: this.userResolver.resolverBTCAddress,
                value: unspentUtxo.satoshi - 1000,
            });

            psbt.signInput(0, userResolverBtcKeypair);

            const finalizeInput = (_inputIndex: number, input: any) => {
                const redeemPayment = payments.p2wsh({
                    redeem: {
                        input: script.compile([
                            input.partialSig[0].signature,
                            userResolverBtcKeypair.publicKey,
                            preimage,
                        ]),
                        output: input.witnessScript,
                    },
                });

                const finalScriptWitness = this.witnessStackToScriptWitness(
                    redeemPayment.witness ?? []
                );

                return {
                    finalScriptSig: Buffer.from(""),
                    finalScriptWitness,
                };
            };

            psbt.finalizeInput(0, finalizeInput);

            const tx = psbt.extractTransaction();
            console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
            await sendRawTransaction(tx.toHex())
        } catch (error) {
            console.log(error)
        }
    }

    public getP2WSHHTLCAddress(hash: string, recipientPublicKey: Buffer) {
        const secretHashBuffer = Buffer.from(hash, 'hex')
        const locking_script = this.getLockingScriptBuffer(secretHashBuffer, recipientPublicKey);

        const p2wsh = payments.p2wsh({
            redeem: { output: locking_script, network: NETWORK },
            network: NETWORK,
        });

        const p2wshAddr = p2wsh.address ?? "";
        return p2wshAddr;
    }

    private getLockingScriptBuffer(hash: Buffer, recipientAddress: Buffer) {
        const locking_script = script.compile([
            opcodes.OP_HASH160,
            hash,
            opcodes.OP_EQUALVERIFY,
            opcodes.OP_DUP,
            opcodes.OP_HASH160,
            recipientAddress,
            opcodes.OP_EQUALVERIFY,
            opcodes.OP_CHECKSIG,
        ]);
        return locking_script
    }

    private witnessStackToScriptWitness(witness: Buffer<ArrayBufferLike>[] | undefined) {
        let buffer = Buffer.allocUnsafe(0);

        function writeSlice(slice: any) {
            buffer = Buffer.concat([buffer, Buffer.from(slice)]);
        }

        function writeVarInt(i: any) {
            const currentLen = buffer.length;
            const varintLen = varuint.encodingLength(i);

            buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)]);
            varuint.encode(i, buffer, currentLen);
        }

        function writeVarSlice(slice: any) {
            writeVarInt(slice.length);
            writeSlice(slice);
        }

        function writeVector(vector: any) {
            writeVarInt(vector.length);
            vector.forEach(writeVarSlice);
        }

        writeVector(witness);

        return buffer;
    }
}