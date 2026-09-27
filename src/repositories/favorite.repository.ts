import { pool } from "@/config/db";
import { FavoriteRow, FavoriteWithProductRow } from "@/types/favorite.types";
import { ResultSetHeader } from "mysql2";

// find as user's favorites, joined with product info
export const findFavoritesByUser = async (userId : number): Promise<FavoriteWithProductRow[]> => {
    const [rows] = await pool.query<FavoriteWithProductRow[]>(
        `SELECT favorites.*, products.name, products.slug, products.description, products.price, products.stock
        FROM favorites
        JOIN products ON products.id = favorites.product_id
        WHERE favorites.user_id = ?
        ORDER BY favorites.created_at DESC`,
        [userId]
    );

    return rows;
};

// find a single favorite for a user + product
export const findFavorite = async (userId: number, productId: number): Promise<FavoriteRow | null> => {
    const [rows] = await pool.query<FavoriteRow[]>(
        "SELECT * FROM favorites WHERE user_id = ? AND product_id = ?",
        [userId, productId]
    );

    return rows[0] ?? null;
};

// add a favorite
export const createFavorite = async (userId: number, productId: number): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO favorites (user_id, product_id) VALUES (?, ?)",
        [userId, productId]
    );

    return result.insertId;
};

// remove a favorite
export const deleteFavorite = async (userId: number, productId: number): Promise<void> => {
    await pool.query(
        "DELETE FROM favorites WHERE user_id = ? AND product_id = ?",
        [userId, productId]
    );
};