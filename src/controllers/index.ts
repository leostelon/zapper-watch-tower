import { router as orderController } from "./order"

export const router = require("express").Router();
router.use("/order", orderController);
