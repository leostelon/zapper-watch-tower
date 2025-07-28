import { router as orderController } from "./order"
import { router as quoteController } from "./quote"

export const router = require("express").Router();
router.use("/order", orderController);
router.use("/quote", quoteController);
