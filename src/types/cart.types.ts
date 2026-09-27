import { RowDataPacket } from "mysql2";
import z from "zod";

export interface CartItemRow extends RowDataPacket {
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    created_at: Date;
    updated_at: Date;
}

// cart item joined with product details, for display
export interface CartItemWithProductRow extends CartItemRow {
    name: string;
    slug: string;
    price: string;
    stock: number;
    description: string | null;
}

export const addToCartSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
});
export type AddToCartType = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive("Quantity must be at least 1"),
});
export type UpdateCartItemType = z.infer<typeof updateCartItemSchema>;