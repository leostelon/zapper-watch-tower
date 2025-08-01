import express from "express";
import { OrderService } from "../services/order";
import { CreateOrderReqTransformer } from "./transformers";
import { RedeemOrderReqTransformer } from "./transformers/order";
export const router = express.Router();
const orderService = new OrderService();

router.post("/", async (req, res) => {
	try {
		const body = CreateOrderReqTransformer.parse(req.body)
		const order = await orderService.createOrder(body.secret_hash, body.quote_id);
		res.status(201).send(order);
	} catch (error: any) {
		res.status(500).send({ message: error.message })
	}
});

router.get("/wallet/:address", async (req, res) => {
	try {
		const order = await orderService.getOrders(req.params.address);
		res.send(order);
	} catch (error: any) {
		res.status(500).send({ message: error.message })
	}
});

router.get("/:id", async (req, res) => {
	try {
		const order = await orderService.getOrder(req.params.id);
		res.send(order);
	} catch (error: any) {
		res.status(500).send({ message: error.message })
	}
});

router.post("/redeem", async (req, res) => {
	try {
		const body = RedeemOrderReqTransformer.parse(req.body);
		const order = await orderService.redeemOrder(body.order_id, body.secret, body.withdraw_to);
		res.send(order);
	} catch (error: any) {
		res.status(500).send({ message: error.message })
	}
});
