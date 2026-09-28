import { RowDataPacket } from "mysql2";
import z from "zod";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface OrderRow extends RowDataPacket {
    id: number;
    user_id: number;
    status: OrderStatus;
    total: string;
    shipping_address: string;
    created_at: Date;
    updated_at: Date;
}

export interface OrderItemRow extends RowDataPacket {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: string;
}

export interface OrderItemWithProductRow extends OrderItemRow {
    name: string;
    slug: string;
}

export const placeOrderSchema = z.object({
    shippingAddress: z.string().min(5, "Shipping address is required"),
});
export type PlaceOrderType = z.infer<typeof placeOrderSchema>;

export const updateOrderStatusSchema = z.object({
    status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});
export type UpdateOrderStatusType = z.infer<typeof updateOrderStatusSchema>;
