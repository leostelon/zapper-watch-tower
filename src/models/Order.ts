import mongoose, { Document } from "mongoose";
import { QuoteModel, Quote } from "./Quote";

export enum Status {
    ADDRESS_CREATED = "ADDRESS_CREATED",
    DEPOSIT_COMPLETE = "DEPOSIT_COMPLETE",
    WITHDRAWN = "WITHDRAWN",
    CANCELED = "CANCELED",
}

interface IOrder {
    secret_hash: string,
    src_escrow_address?: string,
    dst_escrow_address?: string,
    quote_id: typeof QuoteModel,
    src_status: Status[],
    dst_status: Status[],
    quote?: Quote
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
        required: true
    },
    src_status: {
        type: [String],
        enum: Object.values(Status),
        default: []
    },
    dst_status: {
        type: [String],
        enum: Object.values(Status),
        default: []
    }
}, { timestamps: true })

OrderSchema.set("toObject", { virtuals: true });
OrderSchema.set("toJSON", { virtuals: true });
OrderSchema.virtual("quote", {
    ref: "Quote",
    localField: "quote_id",
    foreignField: "_id",
    justOne: true
});

export const OrderModel = mongoose.model<Order>("Order", OrderSchema);
