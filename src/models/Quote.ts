import mongoose, { Document } from "mongoose";

interface IQuote {
    srcChainId: number,
    dstChainId: number,
    srcTokenAddress: string,
    dstTokenAddress: string,
    srcTokenAmount: string,
    dstTokenAmount: string,
    walletAddress: string,
}

export interface Quote extends IQuote, Document { }

const QuoteSchema = new mongoose.Schema<Quote>({
    srcChainId: {
        type: Number,
        required: true,
    },
    dstChainId: {
        type: Number,
        required: true,
    },
    srcTokenAddress: {
        type: String,
        required: true,
    },
    dstTokenAddress: {
        type: String,
        required: true,
    },
    srcTokenAmount: {
        type: String,
        required: true,
    },
    dstTokenAmount: {
        type: String,
        required: true,
    },
    walletAddress: {
        type: String,
        required: true,
    },
}, { timestamps: true })

export const QuoteModel = mongoose.model<Quote>("Quote", QuoteSchema);
