import { RowDataPacket } from "mysql2";
import z from "zod";

export type PaymentMethod = "card" | "upi" | "wallet";
export type PaymentStatus = "initiated" | "success" | "failed";

export interface PaymentRow extends RowDataPacket {
    id: number;
    order_id: number;
    user_id: number;
    amount: string;
    method: PaymentMethod;
    status: PaymentStatus;
    transaction_ref: string;
    failure_reason: string | null;
    created_at: Date;
    updated_at: Date;
};

export const initiatePaymentSchema = z.object({
    orderId: z.number().int().positive(),
    method: z.enum(["card", "upi", "wallet"]),
});

export type InitiatePaymentType = z.infer<typeof initiatePaymentSchema>;

export const verifyPaymentSchema = z.object({
    simulate: z.enum(["success", "failure"]).default("success"),
});

export type VerifyPaymentSchema = z.infer<typeof verifyPaymentSchema>;