import crypto from "crypto";
import * as paymentRepository from "@/repositories/payment.repository";
import * as orderRepository from "@/repositories/order.repository";
import { InitiatePaymentType } from "@/types/payment.types";

// generate a fake gateway transaction reference
const generateTransactionRef = () => `TXN_${crypto.randomBytes(12).toString("hex")}`;

// start a payment attempt for an order (mocked gateway "session create")
export const  initiatePayment = async (userId: number, input : InitiatePaymentType) => {
    const order = await orderRepository.findOrderById(input.orderId);

    if (!order || order.user_id !== userId) {
        throw { status: 404, message: "Order not found" };
    }

    if (order.status !== "pending") {
        throw { status: 409, message: "Only pending orders can be paid for" };
    }

    const transactionRef = generateTransactionRef();
    const paymentId = await paymentRepository.createPayment(
        order.id,
        userId,
        order.total,
        input.method,
        transactionRef
    );

    return paymentRepository.findPaymentById(paymentId);
};

// simulate the gatway's callback confirming (or rejecting) a payment
export const verifyPayment = async (userId: number, transactionRef: string, simulate: "success" | "failure") => {
    const payment = await paymentRepository.findPaymentByRef(transactionRef);

    if (!payment || payment.user_id !== userId) {
        throw { status: 404, message: "Payment not found" };
    }

    // idempotent: a finalized payment is returned as-is, never reprocessed
    if (payment.status !== "initiated") {
        return payment;
    }


    const status = simulate === "success" ? "success" : "failed";
    const failureReason = status === "failed" ? "Simulated payment failure" : null;

    await paymentRepository.finalizePayment(
        payment.id,
        payment.order_id,
        status,
        failureReason
    );
    
    return paymentRepository.findPaymentById(payment.id);
};

// get every payment attempt for an order (owner or admin)
export const getPaymentsForOrder = async (userId: number, orderId: number, isAdmin: boolean) => {
    const order = await orderRepository.findOrderById(orderId);

    if (!order || (!isAdmin && order.user_id !== userId)) {
        throw { status: 404, message: "Order not found" };
    };

    return paymentRepository.findPaymentByOrder(orderId)
}