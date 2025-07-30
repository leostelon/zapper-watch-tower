import axios from 'axios';
import { UNISAT_API_KEY } from '../constants';

const BASE_URL = "https://open-api-testnet4.unisat.io";
const api = axios.create({
    baseURL: BASE_URL, headers: {
        "Authorization": `Bearer ${UNISAT_API_KEY}`
    }
})

type Utxo = {
    txid: string;
    vout: number;
    satoshi: number;
    scriptPk: string;
    address: string;
}

export async function getUTXOs(address: string): Promise<Utxo[]> {
    try {
        const res = await api.get(`/v1/indexer/address/${address}/available-utxo-data`);
        return res.data.data.utxo;
    } catch (error) {
        throw new Error(`Failed to check confirmation for ${address}: ${error}`);
    }
}

export async function sendRawTransaction(txhex: string) {
    try {
        const response = await axios.post('https://mempool.space/testnet4/api/tx', txhex, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        console.log("Bitcoin tx hash:", response.data)
    } catch (error: any) {
        throw new Error(error.message);
    }
}
