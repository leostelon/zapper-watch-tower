import mongoose, { Document } from "mongoose";
import { QuoteModel } from "./Quote";

interface IOrder {
    secret_hash: string,
    src_escrow_address?: string,
    dst_escrow_address?: string,
    quote_id: typeof QuoteModel
}

export interface Order extends IOrder, Document { }

const OrderSchema = new mongoose.Schema<Order>({
    secret_hash: {
        type: String,
        required: true,
        trim: true,
    },
    src_escrow_address: {
        type: String,
        required: false,
        trim: true,
    },
    dst_escrow_address: {
        type: String,
        required: false,
        trim: true
    },
    quote_id: {
        type: mongoose.Types.ObjectId,
        ref: QuoteModel,
        require: true
    }

}, { timestamps: true })

export const OrderModel = mongoose.model<Order>("Order", OrderSchema);
