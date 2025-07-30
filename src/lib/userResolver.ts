import { Network } from "bitcoinjs-lib";
import { userResolverConfig } from "../config";
import { ECPairFactory } from "ecpair";
import * as tinysecp from "tiny-secp256k1";
const ECPair = ECPairFactory(tinysecp);

export class UserResolverLib {
    public readonly resolverBTCAddress;
    public readonly resolverBTCKeyWIF: string;

    constructor() {
        this.resolverBTCAddress = userResolverConfig.btc_address;
        this.resolverBTCKeyWIF = userResolverConfig.btc_key_wif;
    }

    public getBTCKeypair(network: Network) {
        return ECPair.fromWIF(this.resolverBTCKeyWIF, network);
    }
}