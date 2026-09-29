import { NextFunction, Request, Response } from "express";
import * as paymentService from "@/services/payment.service";

// start a payment atempt for an order
export const initiatePaymentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payment = await paymentService.initiatePayment(req.user!.id, req.body);
        return res.status(201).json(payment);
    } catch (error) {
        next(error);
    }
};

// simulate the gateway confirming/rejecting a payment
export const verifyPaymentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payment = await paymentService.verifyPayment(
            req.user!.id,
            String(req.params.transactionRef),
            req.body.simulate
        );

        return res.status(200).json(payment);

    } catch (error) {
        next(error);
    }
};

// list payment attempt for an order
export const getOrderPaymentsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isAdmin = req.user!.role === "admin";
        const payments = await paymentService.getPaymentsForOrder(
            req.user!.id,
            Number(req.params.orderId),
            isAdmin
        );

        return res.status(200).json(payments)
    } catch (error) {
        next(error);
    }
}