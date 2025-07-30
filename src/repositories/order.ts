import { OrderModel, Status } from "../models/Order";

export class OrderRepository {
    async updateBitcoinSourceStatus(orderId: string, status: Status) {
        const order = await OrderModel.findById(orderId);
        if (!order) return;
        order?.dst_status.push(status)
        await order.save()
    }

    async updateBitcoinDestinationStatus(orderId: string, status: Status) {
        const order = await OrderModel.findById(orderId);
        if (!order) return;
        order?.dst_status.push(status)
        await order.save()
    }
}