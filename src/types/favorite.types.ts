import { RowDataPacket } from "mysql2";
import z from "zod";

export interface FavoriteRow extends RowDataPacket {
    id: number;
    user_id: number;
    product_id: number;
    created_at: Date;
}

export interface FavoriteWithProductRow extends FavoriteRow {
    name: string;
    slug: string;
    price: string;
    stock: number;
    description: string | null;
}

export const addFavoriteSchema = z.object({
    productId: z.number().int().positive(),
});
export type AddFavoriteType = z.infer<typeof addFavoriteSchema>;
