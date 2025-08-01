import { OrderModel, Status } from "../models/Order";

export class OrderRepository {
    async updateSourceStatus(orderId: string, status: Status) {
        const order = await OrderModel.findById(orderId);
        if (!order) return;
        order?.src_status.push(status)
        await order.save()
    }

    async updateDestinationStatus(orderId: string, status: Status) {
        const order = await OrderModel.findById(orderId);
        if (!order) return;
        order?.dst_status.push(status)
        await order.save()
    }
}