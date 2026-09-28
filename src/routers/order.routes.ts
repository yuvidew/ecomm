import { Router } from "express";
import {
    cancelOrderController,
    getAllOrdersController,
    getOrderByIdController,
    getOrdersController,
    placeOrderController,
    updateOrderStatusController,
} from "@/controllers/order.controller";
import { placeOrderSchema, updateOrderStatusSchema } from "@/types/order.types";
import { validate } from "@/middlewares/validate.middleware";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/admin", authorize("admin"), getAllOrdersController);
router.get("/", getOrdersController);
router.post("/", validate(placeOrderSchema), placeOrderController);
router.get("/:orderId", getOrderByIdController);
router.patch("/:orderId/status", authorize("admin"), validate(updateOrderStatusSchema), updateOrderStatusController);
router.patch("/:orderId/cancel", cancelOrderController);

export default router;
