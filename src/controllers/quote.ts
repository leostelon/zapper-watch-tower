import express from "express";
import { GetQuoteReqTransformer } from "./transformers";
import { QuoteService } from "../services";
export const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const body = GetQuoteReqTransformer.parse(req.body)
        const quote = await QuoteService.createQuote(body.srcChainId, body.dstChainId, body.srcTokenAddress, body.dstTokenAddress, body.amount, body.walletAddress, body.enableEstimate);
        res.send(quote);
    } catch (error: any) {
        res.status(500).send({ message: error.message })
    }
});

router.get("/:id", async (req, res) => {
    try {
        const quote = await QuoteService.getQuote(req.params.id);
        res.send(quote);
    } catch (error: any) {
        res.status(500).send({ message: error.message })
    }
});
