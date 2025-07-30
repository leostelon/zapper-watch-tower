import { Network, payments, Psbt } from "bitcoinjs-lib";
import { userResolverConfig } from "../config";
import { ECPairFactory, ECPairInterface } from "ecpair";
import * as tinysecp from "tiny-secp256k1";
import { getUTXOs, sendRawTransaction } from "../unisat/api";
import { NETWORK } from "../constants";
const ECPair = ECPairFactory(tinysecp);

export class UserResolverLib {
    public readonly resolverBTCAddress;
    public readonly resolverBTCKeyWIF: string;

    constructor() {
        this.resolverBTCAddress = userResolverConfig.btc_address;
        this.resolverBTCKeyWIF = userResolverConfig.btc_key_wif;
    }

    public async depositDestBTC(destinationAddress: string, sendAmount: number) {
        const psbt = new Psbt({ network: NETWORK });
        const keyPair = this.getBTCKeypair(NETWORK);

        // Get UTXOs
        const utxos = await getUTXOs(this.resolverBTCAddress);
        console.log(this.resolverBTCAddress)
        if (!utxos || utxos.length === 0) throw Error("No UTXO's found for this address");

        let totalAmount = 0;
        for (const utxo of utxos) {
            const p2wpkh = payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network: NETWORK
            });

            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: p2wpkh.output!,
                    value: utxo.satoshi
                }
            });
            totalAmount += utxo.satoshi;
        }

        psbt.addOutput({
            address: destinationAddress,
            value: sendAmount
        });
        const change = totalAmount - sendAmount - 1000;

        if (change > 0) {
            psbt.addOutput({
                address: this.resolverBTCAddress,
                value: change
            });
        }

        utxos.forEach((_, index) => {
            psbt.signInput(index, keyPair);
        });

        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction();
        console.log('BTC from user resolver sent, tx:', tx.toHex());
        await sendRawTransaction(tx.toHex())
    }

    public getBTCKeypair(network: Network): ECPairInterface {
        return ECPair.fromWIF(this.resolverBTCKeyWIF, network);
    }

}