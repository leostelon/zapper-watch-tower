export class Order {
    public secretHash: string;
    public amount: bigint;
    public readonly srcPaymentAddress: string;

    constructor(_secretHash: string, _amount: bigint, paymentAddress: string) {
        this.secretHash = _secretHash;
        this.amount = _amount;
        this.srcPaymentAddress = paymentAddress;
    }
}