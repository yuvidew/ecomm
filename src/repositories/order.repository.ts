import { pool } from "@/config/db";
import { OrderItemWithProductRow, OrderRow, OrderStatus } from "@/types/order.types";
import { CartItemWithProductRow } from "@/types/cart.types";
import { ResultSetHeader } from "mysql2/promise";


// create an order + its items, decrement stock, and clear the cart — all in one transaction
export const createOrderFromCart = async (
    userId: number,
    cartItems: CartItemWithProductRow[],
    shippingAddress: string
): Promise<number> => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

        const [orderResult] = await connection.query<ResultSetHeader>(
            "INSERT INTO orders (user_id, status, total, shipping_address) VALUES (?, 'pending', ?, ?)",
            [userId, total, shippingAddress]
        );
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                throw {
                    status : 409,
                    message : `Insufficient stock for ${item.name}`
                };
            }

            await connection.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
                [orderId, item.product_id, item.quantity, item.price]
            );

            await connection.query(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
                [item.quantity, item.product_id]
            );
            
        }

        await connection.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

        await connection.commit();
        return orderId;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

// list a user's orders, newst first
export const findOrderByUser = async (userId: number): Promise<OrderRow[]> => {
    const [rows] = await pool.query<OrderRow[]>(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
    );

    return rows;
};

// list every order (admin)
export const findAllOrders = async (): Promise<OrderRow[]> => {
    const [rows] = await pool.query<OrderRow[]>(
        "SELECT * FROM orders ORDER BY created_at DESC",
    );

    return rows;
};

// find a single order by id
export const findOrderById = async (id: number): Promise<OrderRow | null> => {
    const [rows] = await pool.query<OrderRow[]>(
        "SELECT * FROM orders WHERE id = ?",
        [id]
    );

    return rows[0] ?? null;
};

// find items for an order, joined with product info
export const findOrderItems = async (orderId: number): Promise<OrderItemWithProductRow[]> => {
    const [rows] = await pool.query<OrderItemWithProductRow[]>(
        `SELECT order_items.*, products.name, products.slug
        FROM order_items
        JOIN products ON products.id = order_items.product_id
        WHERE order_items.order_id = ?`,
        [orderId]
    );

    return rows;
};

// update an order's status
export const updateOrderSchema = async (id: number, status: OrderStatus): Promise<void> => {
    await pool.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, id]
    );
};