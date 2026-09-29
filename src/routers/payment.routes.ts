import { Router } from "express";
import {
    getOrderPaymentsController,
    initiatePaymentController,
    verifyPaymentController,
} from "@/controllers/payment.controller";
import { initiatePaymentSchema, verifyPaymentSchema } from "@/types/payment.types";
import { validate } from "@/middlewares/validate.middleware";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", validate(initiatePaymentSchema), initiatePaymentController);
router.post("/:transactionRef/verify", validate(verifyPaymentSchema), verifyPaymentController);
router.get("/order/:orderId", getOrderPaymentsController);

export default router;
