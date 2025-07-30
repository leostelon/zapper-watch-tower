import { Status } from "../models/Order";
import { OrderRepository } from "../repositories";
import { getUTXOs } from "./api";
import { CronJob } from 'cron';

interface WatchedAddress {
    id: string;
    orderId: string;
    address: string;
    job: CronJob;
    timeoutRef: NodeJS.Timeout;
}

export class BitcoinMonitor {
    private static _instance: BitcoinMonitor;
    private watchedAddresses: Map<string, WatchedAddress> = new Map();
    private orderRepo: OrderRepository;

    private constructor() {
        this.orderRepo = new OrderRepository()
    }

    public static get instance(): BitcoinMonitor {
        if (!BitcoinMonitor._instance) {
            BitcoinMonitor._instance = new BitcoinMonitor();
        }
        return BitcoinMonitor._instance;
    }

    private async checkBitcoinDeposit(address: string, orderId: string) {
        console.log(`[${new Date().toISOString()}] Checking balance for ${address}...`);
        const utxo: any[] = await getUTXOs(address);
        if (utxo.length > 0) {
            this.removeAddress(orderId)
            await this.orderRepo.updateBitcoinSourceStatus(orderId, Status.DEPOSIT_COMPLETE)
        }
    }

    public addAddress(orderId: string, bitcoinAddress: string): string {
        const id = `job-${orderId}`;

        const job = new CronJob('*/3 * * * * *', () => {
            this.checkBitcoinDeposit(bitcoinAddress, orderId);
        });

        job.start();

        // Auto-remove the job after 30 minutes (30 * 60 * 1000 ms)
        const timeoutRef = setTimeout(async () => {
            console.log(`Auto-expired job for ${bitcoinAddress} after 30 minutes`);
            this.removeAddress(orderId);
            await this.orderRepo.updateBitcoinSourceStatus(orderId, Status.CANCELED)
        }, 30 * 60 * 1000);

        this.watchedAddresses.set(id, { id, address: bitcoinAddress, job, orderId, timeoutRef });
        console.log(`Started watching ${bitcoinAddress} (Job ID: ${id})`);
        return id;
    }

    public removeAddress(orderId: string): boolean {
        const job = this.watchedAddresses.get(`job-${orderId}`);
        if (!job) {
            console.warn(`Job ${orderId} not found.`);
            return false;
        }

        job.job.stop();
        clearTimeout(job.timeoutRef); // clear auto-expire if manually removed early
        this.watchedAddresses.delete(orderId);
        console.log(`Stopped watching ${job.address} (Job ID: ${orderId})`);
        return true;
    }

    public listWatched(): WatchedAddress[] {
        return Array.from(this.watchedAddresses.values());
    }
}
