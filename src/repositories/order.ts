import { OrderModel, Status } from "../models/Order";

export class OrderRepository {
    async updateBitcoinSourceDepositStatus(orderId: string) {
        const order = await OrderModel.findById(orderId);
        if (!order) return;
        order?.src_status.push(Status.DEPOSIT_COMPLETE)
        await order.save()
    }

    async updateBitcoinSourceCancelStatus(orderId: string) {
        const order = await OrderModel.findById(orderId);
        if (!order) return;
        order?.src_status.push(Status.CANCELED)
        await order.save()
    }
}