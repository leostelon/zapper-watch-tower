import express from "express";
import { OrderService } from "../services/order";
export const router = express.Router();

router.get("/create", async (req, res) => {
	const order = await OrderService.createOrder("", 1n);
	res.status(201).send({ paymentAddress: order.srcPaymentAddress });
});
