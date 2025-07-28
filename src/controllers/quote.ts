import express from "express";
import { GetQuoteReqTransformer } from "./transformers";
import { QuoteService } from "../services";
import { stringifyBigInt } from "../utils/serializeBigInt";
export const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const body = GetQuoteReqTransformer.parse(req.body)
        const quote = await QuoteService.getQuote(body.srcChainId, body.dstChainId, body.srcTokenAddress, body.dstTokenAddress, body.amount, body.walletAddress);
        res.json(stringifyBigInt(quote));
    } catch (error) {
        res.status(501).send({ message: error })
    }
});
