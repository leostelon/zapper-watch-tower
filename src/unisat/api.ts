import axios from 'axios';
import { UNISAT_API_KEY } from '../constants';

const BASE_URL = "https://open-api-testnet4.unisat.io";
const api = axios.create({
    baseURL: BASE_URL, headers: {
        "Authorization": `Bearer ${UNISAT_API_KEY}`
    }
})

export async function getUTXOs(address: string) {
    try {
        const res = await api.get(`/v1/indexer/address/${address}/available-utxo-data`);
        return res.data.data.utxo;
    } catch (error) {
        throw new Error(`Failed to check confirmation for ${address}: ${error}`);
    }
}
