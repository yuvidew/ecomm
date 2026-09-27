import { pool } from "@/config/db";
import { CartItemRow, CartItemWithProductRow } from "@/types/cart.types";
import { ResultSetHeader } from "mysql2";

// find a user's full cart, joined with product info
export const findCartByUser = async (userId: number): Promise<CartItemWithProductRow[]> => {
    const [rows] = await pool.query<CartItemWithProductRow[]>(
        `SELECT cart_items.*, products.name, products.slug, products.description, products.price, products.stock
        FROM cart_items
        JOIN products ON products.id = cart_items.product_id
        WHERE cart_items.user_id = ?
        ORDER BY cart_items.created_at DESC`,
        [userId]
    );

    return rows;
};

// find a single cart line for a user + product
export const findCartItems = async (userId: number, productId: number): Promise<CartItemRow | null> => {
    const [rows] = await pool.query<CartItemRow[]>(
        "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
        [userId, productId]
    );

    return rows[0] ?? null;
};

// find a cart line by its id
export const findCartItemById = async (id: number): Promise<CartItemRow | null> => {
    const [rows] = await pool.query<CartItemRow[]>(
        "SELECT * FROM cart_items WHERE id = ?",
        [id]
    );

    return rows[0] ?? null;
};

// insert a new cart items
export const createCartItems = async (userId: number, produtId : number, quantity: number): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, produtId, quantity]
    );

    return result.insertId;
};

// bump an existing cart line's quntilty by the given amount
export const incrementCartItemsQuantity = async (id: number, amount: number): Promise<void> => {
    await pool.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
        [amount, id]
    );
};

// set a cart line's quanity to an exact value
export const setCartItemsQuantity = async (id: number, amount: number): Promise<void> => {
    await pool.query(
        "UPDATE cart_items SET quantity = ? WHERE id = ?",
        [amount, id]
    );
};

// remove a single cart line
export const deleteCartItem = async (id : number):Promise<void> => {
    await pool.query(
        "DELETE FROM cart_items WHERE id = ?",
        [id]
    );
};

// empty a user's whole cart
export const clearCart = async (userId: number): Promise<void> => {
    await pool.query(
        "DELETE FROM cart_items WHERE user_id = ?",
        [userId]
    );
};