import express from "express";
import { OrderService } from "../services/order";
import { CreateOrderReqTransformer } from "./transformers";
export const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const body = CreateOrderReqTransformer.parse(req.body)
		const order = await OrderService.createOrder(body.secret_hash, body.quote_id);
		res.status(201).send(order);
	} catch (error: any) {
		res.status(500).send({ message: error.message })
	}
});
