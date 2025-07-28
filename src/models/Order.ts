import mongoose, { Document } from "mongoose";

interface IOrder {
    secret_hash: string,
    src_payment_address?: string
}

export interface Order extends IOrder, Document { }

const OrderSchema = new mongoose.Schema<Order>({
    secret_hash: {
        type: String,
        required: true,
        trim: true,
    },
    src_payment_address: {
        type: String,
        required: false,
        trim: true,
    },

}, { timestamps: true })

export const OrderModel = mongoose.model<Order>("Order", OrderSchema);
